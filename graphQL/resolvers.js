//Resolver: tạo ra các hàm xử lý các query
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const validator = require('validator');

module.exports = {
    async createUser({ userInput }, req) {
        const errors = [];
        if (!validator.isEmail(userInput.email)) {
            errors.push({ message: 'Email is invalid' })
        }
        if (validator.isEmpty(userInput.password) || !validator.isLength(userInput.password, { min: 5 })) {
            errors.push({ message: 'Password to short' })
        }
        if (errors.length) {
            const err = new Error('Invalid input');
            err.data = errors;
            err.statusCode = 422
            throw err;
        }
        const existingUser = await User.findOne({ email: userInput.email });
        if (existingUser) {
            const err = new Error('User existing');
            throw err;
        }
        const hashPw = await bcrypt.hash(userInput.password, 12);
        const userCreated = new User({
            email: userInput.email,
            password: hashPw,
            name: userInput.name
        });
        const result = await userCreated.save();
        return {
            ...result._doc,
            _id: result._id.toString()
        }
    }
}