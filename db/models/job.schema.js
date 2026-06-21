const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    role: {
        type: String,
        required: true,
        trim: true,
    },
    companyName:{
        type: String,
        required: true,
        trim: true
    },
    status:{
        type:String,
        enum: ['applied', 'interview', 'offer', 'rejected'],
        default: 'applied'
    },
    notes:{
        type: String,
        trim: true
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {timestamps:true});

jobSchema.index({userid:1, companyName:1, role:1},{unique:true});
module.exports = mongoose.model('Job', jobSchema);