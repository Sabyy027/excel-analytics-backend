const mongoose = require('mongoose');
const excelDataSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    fileName: { type: String, required: true },
    data: { type: Array, required: true }, // Store parsed JSON data
    uploadDate: { type: Date, default: Date.now }
}, { timestamps: true });
module.exports = mongoose.model('ExcelData', excelDataSchema); 