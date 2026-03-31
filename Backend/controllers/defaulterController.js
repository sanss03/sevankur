const TaxRecord = require('../models/TaxRecord');
const Property = require('../models/Property');

// @desc    Get all active defaulters (admin view)
// @route   GET /api/defaulters
const getAllDefaulters = async (req, res) => {
  try {
    const { city, ward } = req.query;
    
    // Find tax records where isDefaulter is true
    let taxRecords = await TaxRecord.find({ isDefaulter: true })
      .populate('propertyId')
      .sort({ remainingAmount: -1 });

    // Filter by property details (city/ward) if provided
    if (city || ward) {
      taxRecords = taxRecords.filter(record => {
        const property = record.propertyId;
        if (!property) return false;
        if (city && property.address?.city !== city) return false;
        if (ward && property.ward !== ward) return false;
        return true;
      });
    }

    res.status(200).json({
      success: true,
      count: taxRecords.length,
      data: taxRecords
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Check defaulter status for a specific property
// @route   GET /api/defaulters/check/:propertyId
const checkPropertyStatus = async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    // Find the property first
    const property = await Property.findOne({ propertyId });
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Check all tax records for this property
    const records = await TaxRecord.find({ 
      propertyId: property._id,
      isDefaulter: true 
    });

    res.status(200).json({
      success: true,
      isDefaulter: records.length > 0,
      totalDues: records.reduce((sum, r) => sum + r.remainingAmount, 0),
      defaulterYears: records.map(r => r.taxYear),
      data: records
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get summary stats for defaulters
// @route   GET /api/defaulters/stats
const getDefaulterStats = async (req, res) => {
  try {
    const stats = await TaxRecord.aggregate([
      { $match: { isDefaulter: true } },
      {
        $group: {
          _id: null,
          totalAmountPending: { $sum: "$remainingAmount" },
          averagePending: { $avg: "$remainingAmount" },
          count: { $sum: 1 }
        }
      }
    ]);

    const byCity = await TaxRecord.aggregate([
      { $match: { isDefaulter: true } },
      {
        $lookup: {
          from: 'properties',
          localField: 'propertyId',
          foreignField: '_id',
          as: 'property'
        }
      },
      { $unwind: '$property' },
      {
        $group: {
          _id: '$property.address.city',
          defaulterCount: { $sum: 1 },
          totalDues: { $sum: '$remainingAmount' }
        }
      },
      { $sort: { totalDues: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalStats: stats[0] || { totalAmountPending: 0, count: 0 },
        byCity
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Resolve a defaulter record manually (e.g. dispute settled or waiver)
// @route   PUT /api/defaulters/:id/resolve
const resolveDefaulter = async (req, res) => {
  try {
    const { resolutionType, note } = req.body; // e.g., 'waived' or 'settled'
    
    const record = await TaxRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    if (resolutionType === 'waived') {
      record.paymentStatus = 'waived';
      record.remainingAmount = 0;
      record.isDefaulter = false;
    } else if (resolutionType === 'settled') {
      record.paymentStatus = 'paid';
      record.remainingAmount = 0;
      record.isDefaulter = false;
    }

    await record.save();

    res.status(200).json({
      success: true,
      message: `Tax record resolution success: ${resolutionType}`,
      data: record
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllDefaulters,
  checkPropertyStatus,
  getDefaulterStats,
  resolveDefaulter
};
