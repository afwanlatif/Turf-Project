const { BaseSchema, extend } = require('../models/base.model');
let mongoose = require('mongoose'),
    instituteSchema = extend(BaseSchema, {
        location: { type: String, required: true, trim: true },
        description: { type: String, require: true, trim: true },
        adminId: {
            type: String,
            ref: 'users'
        }
    })


exports.InstituteSchema = new mongoose.model('institutes', instituteSchema)