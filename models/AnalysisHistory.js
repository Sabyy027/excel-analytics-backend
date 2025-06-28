const mongoose = require('mongoose');

const analysisHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User', // ⭐ MUST match your User model name exactly ⭐
    },
    excelDataId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'ExcelData', // ⭐ MUST match your ExcelData model name exactly ⭐
    },
    fileName: { // Storing file name here makes it easier to display history without populating
        type: String,
        required: true,
    },
    chartType: {
        type: String,
        required: true,
    },
    xAxis: {
        type: String,
        required: true,
    },
    yAxis: {
        type: String,
        required: true,
    },
    zAxis: { // ⭐ New field for 3D charts ⭐
        type: String,
        required: false, // Optional for 2D charts
    },
    analysisDate: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

module.exports = mongoose.model('AnalysisHistory', analysisHistorySchema); 