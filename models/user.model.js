const { UserTypes } = require("../constants");
const { BaseSchema, extend } = require("./base.model");
let mongoose = require("mongoose"),
    userSchema = extend(BaseSchema, {
        fullName: { type: String, required: true },
        gender: { type: String, required: true },
        phoneNumber: { type: String, required: true, unique: true, minlength: 10, maxlength: 10 },
        address: { type: String, required: false },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true, },
        password: { type: String, required: true },
        userType: {
            type: String,
            enum: Object.values(UserTypes),
            default: UserTypes.user,
        },
    });
exports.UserSchema = mongoose.model("users", userSchema);