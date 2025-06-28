const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const ExcelData = require('../models/ExcelData');
const { protect } = require('../middleware/authMiddleware');
const AnalysisHistory = require('../models/AnalysisHistory');

// @desc    Get user's analysis history
// @route   GET /api/data/analysis-history
// @access  Private
router.get('/analysis-history', protect, async (req, res) => {
    try {
        console.log('Backend: Received analysis-history request for userId:', req.user.id);

        const history = await AnalysisHistory.find({ userId: req.user.id })
            // Populate excelDataId to get related file details (like fileName, uploadDate)
            .populate('excelDataId', 'fileName uploadDate')
            .sort({ analysisDate: -1 });

        console.log('Backend: Fetched', history.length, 'analysis history items for userId:', req.user.id);
        res.status(200).json(history);
    } catch (error) {
        console.error('Backend ERROR fetching analysis history:', error);
        res.status(500).json({ message: 'Error fetching analysis history', error: error.message });
    }
});

// @desc    Get user's upload history
// @route   GET /api/data/history
// @access  Private
router.get('/history', protect, async (req, res) => {
    try {
        const history = await ExcelData.find({ userId: req.user.id }).sort({ uploadDate: -1 }).select('-data'); // Don't send full data in history list
        res.status(200).json(history);
    } catch (error) {
        console.error('Backend ERROR fetching upload history:', error);
        res.status(500).json({ message: 'Error fetching history', error: error.message });
    }
});

// @desc    Save an analysis configuration
// @route   POST /api/data/save-analysis
// @access  Private
router.post('/save-analysis', protect, async (req, res) => {
    try {
        const { excelDataId, fileName, chartType, xAxis, yAxis, zAxis } = req.body;
        console.log('Backend: Saving analysis:', { userId: req.user.id, excelDataId, fileName, chartType, xAxis, yAxis, zAxis });

        const newAnalysis = new AnalysisHistory({
            userId: req.user.id,
            excelDataId,
            fileName,
            chartType,
            xAxis,
            yAxis,
            zAxis
        });
        await newAnalysis.save();
        res.status(201).json({ message: 'Analysis configuration saved successfully' });
    } catch (error) {
        console.error('Backend ERROR saving analysis:', error);
        res.status(500).json({ message: 'Error saving analysis', error: error.message });
    }
});

// @desc    Get specific Excel data by ID (DYNAMIC ROUTE - MUST BE LAST!)
// @route   GET /api/data/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        console.log('Backend: Received request for ExcelData with ID:', req.params.id);
        console.log('Backend: User ID:', req.user.id);
        console.log('Backend: Requested ID type:', typeof req.params.id);
        
        // Validate if the ID is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            console.log('Backend: Invalid ObjectId format:', req.params.id);
            return res.status(400).json({ message: 'Invalid ID format' });
        }
        
        const excelData = await ExcelData.findOne({ _id: req.params.id, userId: req.user.id });
        console.log('Backend: Found ExcelData:', excelData ? 'Yes' : 'No');
        
        if (!excelData) {
            console.log('Backend: No ExcelData found for ID:', req.params.id);
            return res.status(404).json({ message: 'Data not found or unauthorized' });
        }
        console.log('Backend: Sending ExcelData with fileName:', excelData.fileName);
        res.status(200).json(excelData);
    } catch (error) {
        console.error('Backend ERROR fetching specific Excel data:', error);
        res.status(500).json({ message: 'Error fetching data', error: error.message });
    }
});

module.exports = router; 