const Property = require('../models/Property');
const TaxRecord = require('../models/TaxRecord');

// @desc    Get all properties with optional ward filtering
// @route   GET /api/properties
const getProperties = async (req, res) => {
  try {
    const { ward } = req.query;
    const query = ward ? { ward } : {};
    const properties = await Property.find(query);
    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all defaulters (unpaid tax records) with optional filtering
// @route   GET /api/defaulters
const getDefaulters = async (req, res) => {
  try {
    const { ward, year } = req.query;
    
    // Find tax records with status 'unpaid' 
    let query = { status: { $ne: 'paid' } };
    if (year) query.year = year;

    let taxRecords = await TaxRecord.find(query).populate('propertyId');

    // Filter by ward if provided
    if (ward) {
      taxRecords = taxRecords.filter(record => 
        record.propertyId && record.propertyId.ward === ward
      );
    }

    res.status(200).json(taxRecords);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get system analytics (summary counts and totals)
// @route   GET /api/analytics
const getAnalytics = async (req, res) => {
  try {
    const totalProperties = await Property.countDocuments();
    
    const aggregatedStats = await TaxRecord.aggregate([
      {
        $group: {
          _id: '$status',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const stats = {
      totalProperties,
      collection: aggregatedStats.find(s => s._id === 'paid') || { totalAmount: 0, count: 0 },
      pending: aggregatedStats.find(s => s._id === 'pending') || { totalAmount: 0, count: 0 },
      unpaid: aggregatedStats.find(s => s._id === 'unpaid') || { totalAmount: 0, count: 0 }
    };

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProperties,
  getDefaulters,
  getAnalytics
};
