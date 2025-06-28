const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Import User model
const ExcelData = require('../models/ExcelData'); // Import ExcelData model
const AnalysisHistory = require('../models/AnalysisHistory'); // Import AnalysisHistory model
const { protect, authorizeAdmin } = require('../middleware/authMiddleware'); // Import auth middlewares

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', protect, authorizeAdmin, async (req, res) => {
    try {
        console.log('Admin: Fetching all users...');
        const users = await User.find({}).select('-password'); // Fetch all users, exclude password
        res.status(200).json(users);
    } catch (error) {
        console.error('Admin Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
});

// @desc    Delete a user (and their associated data/analyses)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
router.delete('/users/:id', protect, authorizeAdmin, async (req, res) => {
    try {
        const userId = req.params.id;
        console.log('Admin: Attempting to delete user:', userId);

        // Prevent admin from deleting themselves (optional but recommended)
        if (req.user.id === userId) {
            return res.status(403).json({ message: 'Admin cannot delete their own account via this panel.' });
        }

        const userToDelete = await User.findById(userId);
        if (!userToDelete) {
            return res.status(404).json({ message: 'User not found' });
        }

        await User.findByIdAndDelete(userId); // Delete the user from User collection
        await ExcelData.deleteMany({ userId }); // Delete associated excel data
        await AnalysisHistory.deleteMany({ userId }); // Delete associated analyses

        console.log('Admin: User and associated data removed:', userId);
        res.status(200).json({ message: 'User and all associated data/analyses removed successfully' });
    } catch (error) {
        console.error('Admin Error deleting user:', error);
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
});

// @desc    Get all uploaded data
// @route   GET /api/admin/all-data
// @access  Private/Admin
router.get('/all-data', protect, authorizeAdmin, async (req, res) => {
    try {
        console.log('Admin: Fetching all uploaded data...');
        // Fetch all ExcelData and populate userId to show who uploaded
        const allData = await ExcelData.find({}).populate('userId', 'username email');
        res.status(200).json(allData);
    } catch (error) {
        console.error('Admin Error fetching all data:', error);
        res.status(500).json({ message: 'Error fetching all data', error: error.message });
    }
});

// @desc    Delete specific uploaded data (and associated analyses)
// @route   DELETE /api/admin/data/:id
// @access  Private/Admin
router.delete('/data/:id', protect, authorizeAdmin, async (req, res) => {
    try {
        const dataId = req.params.id;
        console.log('Admin: Attempting to delete Excel data:', dataId);

        const excelDataToDelete = await ExcelData.findById(dataId);
        if (!excelDataToDelete) {
            return res.status(404).json({ message: 'Excel data not found' });
        }

        await ExcelData.findByIdAndDelete(dataId); // Delete the ExcelData entry
        await AnalysisHistory.deleteMany({ excelDataId: dataId }); // Delete associated analyses

        console.log('Admin: Excel data and associated analyses removed:', dataId);
        res.status(200).json({ message: 'Excel data and associated analyses removed successfully' });
    } catch (error) {
        console.error('Admin Error deleting data:', error);
        res.status(500).json({ message: 'Error deleting data', error: error.message });
    }
});

module.exports = router; 