const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        mobile: {
            type: String,
            required: true,
            unique: true,
        },
        passwordHash: {
            type: String,
            required: true,
        },
        passwordSalt: {
            type: String,
            required: true,
        },
    },
    {
        versionKey: false,
        timestamps: true,
    }
)

const Users = mongoose.model("user",userSchema);
module.exports = Users;
