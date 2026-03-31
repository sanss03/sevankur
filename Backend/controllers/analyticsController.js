const Property = require('../models/Property');
const TaxRecord = require('../models/TaxRecord');

// @desc    Dashboard overview
// @route   GET /api/analytics/dashboard
const getDashboardOverview = async (req, res) => {
  try {
    const totalProperties = await Property.countDocuments();
    const activeDefaulters = await TaxRecord.countDocuments({ isDefaulter: true });
    
    const taxStats = await TaxRecord.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$taxAmount", 0] } },
          totalPending: { $sum: "$remainingAmount" }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalProperties,
        activeDefaulters,
        revenue: taxStats[0]?.totalRevenue || 0,
        pending: taxStats[0]?.totalPending || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Detailed tax analytics
// @route   GET /api/analytics/tax
const getTaxAnalytics = async (req, res) => {
  try {
    const byStatus = await TaxRecord.aggregate([
      {
        $group: {
          _id: "$paymentStatus",
          totalAmount: { $sum: "$taxAmount" },
          count: { $sum: 1 }
        }
      }
    ]);

    const byYear = await TaxRecord.aggregate([
      {
        $group: {
          _id: "$taxYear",
          collected: { $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$taxAmount", 0] } },
          pending: { $sum: "$remainingAmount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: { byStatus, byYear }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Detailed property analytics
// @route   GET /api/analytics/property
const getPropertyAnalytics = async (req, res) => {
  try {
    const byType = await Property.aggregate([
      {
        $group: {
          _id: "$propertyType",
          count: { $sum: 1 },
          totalValue: { $sum: "$value" }
        }
      }
    ]);

    const byCity = await Property.aggregate([
      {
        $group: {
          _id: "$address.city",
          count: { $sum: 1 },
          totalValue: { $sum: "$value" }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: { byType, byCity }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Compliance reports (Paid vs Unpaid ratio)
// @route   GET /api/analytics/compliance
const getComplianceReport = async (req, res) => {
  try {
    const complianceData = await TaxRecord.aggregate([
      {
        $group: {
          _id: "$taxYear",
          totalRecords: { $sum: 1 },
          paidRecords: { $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, 1, 0] } }
        }
      },
      {
        $project: {
          taxYear: "$_id",
          totalRecords: 1,
          paidRecords: 1,
          complianceRate: {
            $multiply: [{ $divide: ["$paidRecords", "$totalRecords"] }, 100]
          }
        }
      },
      { $sort: { taxYear: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: complianceData
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboardOverview,
  getTaxAnalytics,
  getPropertyAnalytics,
  getComplianceReport
};
