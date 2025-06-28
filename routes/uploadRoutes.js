const express = require('express');
const router = express.Router();
const multer = require('multer');
const xlsx = require('xlsx'); // For Excel parsing 
const ExcelData = require('../models/ExcelData');
const { protect } = require('../middleware/authMiddleware');

const storage = multer.memoryStorage(); // Store file in memory for parsing
const upload = multer({ storage: storage });

router.post('/', protect, upload.single('excelFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json(sheet); // Parsed data

        if (jsonData.length === 0) {
            return res.status(400).json({ message: 'Excel file is empty or has no recognizable data.' });
        }

        const excelData = new ExcelData({
            userId: req.user.id,
            fileName: req.file.originalname,
            data: jsonData,
            uploadDate: new Date()
        });
        await excelData.save(); // Store structured data in MongoDB

        res.status(200).json({
            message: 'File uploaded and processed successfully',
            dataId: excelData._id,
            fileName: excelData.fileName,
            headers: Object.keys(jsonData[0] || {}), // Send headers for dynamic axis selection
            preview: jsonData.slice(0, 5) // Send a small preview
        });
    } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).json({ message: 'Error processing file', error: error.message });
    }
});

module.exports = router; 