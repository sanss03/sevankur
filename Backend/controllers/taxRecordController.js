const TaxRecord = require('../models/TaxRecord');

// @desc    Get all tax records with filtering
// @route   GET /api/tax-records
const getTaxRecords = async (req, res) => {
  try {
    const { year, status, propertyId, isDefaulter } = req.query;
    let query = {};

    if (year) query.taxYear = year;
    if (status) query.paymentStatus = status;
    if (propertyId) query.propertyId = propertyId;
    if (isDefaulter !== undefined) query.isDefaulter = isDefaulter === 'true';

    const records = await TaxRecord.find(query).populate('propertyId').sort({ taxYear: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update payment status and remaining amount
// @route   PUT /api/tax-records/:id/pay
const updatePayment = async (req, res) => {
  try {
    const { amountPaid } = req.body;
    const record = await TaxRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ success: false, message: 'Tax record not found' });
    }

    // Calculation logic
    const newRemaining = Math.max(0, record.remainingAmount - (amountPaid || 0));
    record.remainingAmount = newRemaining;
    
    if (newRemaining === 0) {
      record.paymentStatus = 'paid';
      record.isDefaulter = false;
    }

    await record.save();

    res.status(200).json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Detect and mark overdue records
// @route   POST /api/tax-records/detect-overdue
const detectOverdue = async (req, res) => {
  try {
    const today = new Date();
    
    const result = await TaxRecord.updateMany(
      {
        dueDate: { $lt: today },
        paymentStatus: { $in: ['pending'] }
      },
      {
        $set: { 
          paymentStatus: 'overdue',
          isDefaulter: true 
        }
      }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} records marked as overdue`,
      details: result
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get tax collection statistics
// @route   GET /api/tax-records/stats
const getTaxStats = async (req, res) => {
  try {
    const stats = await TaxRecord.aggregate([
      {
        $group: {
          _id: "$paymentStatus",
          totalAmount: { $sum: "$taxAmount" },
          totalRemaining: { $sum: "$remainingAmount" },
          count: { $sum: 1 }
        }
      }
    ]);

    const collectionByYear = await TaxRecord.aggregate([
      {
        $group: {
          _id: "$taxYear",
          totalCollection: {
             $sum: {
               $cond: [ { $eq: ["$paymentStatus", "paid"] }, "$taxAmount", 0 ]
             }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        byStatus: stats,
        byYear: collectionByYear
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new tax record
// @route   POST /api/tax-records
const createTaxRecord = async (req, res) => {
  try {
    const record = await TaxRecord.create(req.body);
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTaxRecords,
  createTaxRecord,
  updatePayment,
  detectOverdue,
  getTaxStats
};
