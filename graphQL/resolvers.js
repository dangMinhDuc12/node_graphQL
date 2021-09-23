//Resolver: tạo ra các hàm xử lý các query
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const Post = require('../models/post');
const validator = require('validator');
const jwt = require('jsonwebtoken');

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
    },
    async login({ email, password }) {
        const userFind = await User.findOne({ email });
        if (!userFind) {
            const err = new Error('User not found');
            err.statusCode = 401;
            throw err;
        }
        const checkPw = await bcrypt.compare(password, userFind.password)
        if(!checkPw) {
            const err = new Error('Pw incorrect');
            err.statusCode = 401;
            throw err;
        }
        const token = jwt.sign({
            userId: userFind._id.toString(),
            email: userFind.email
        }, 'somesupersecret', { expiresIn: '1h' })
        return {
            token,
            userId: userFind._id.toString()
        }
    },
    async createPost({ postInput }, req) {
        if (!req.isAuth) {
            const err = new Error('No authenticated');
            err.statusCode = 401
            throw err;
        }
        const errors = [];
        if (validator.isEmpty(postInput.title) || !validator.isLength(postInput.title, { min: 5 })) {
            errors.push({ message: 'Title is invalid' })
        }
        if (validator.isEmpty(postInput.content) || !validator.isLength(postInput.content, { min: 5 })) {
            errors.push({ message: 'Content is invalid' })
        }
        if (errors.length) {
            const err = new Error('Invalid input');
            err.data = errors;
            err.statusCode = 422
            throw err;
        }
        const userCreatePost = await User.findById(req.userId)
        if (!userCreatePost) {
            const err = new Error('No authenticated');
            err.statusCode = 401
            throw err;
        }

        const postCreate = new Post({
            title: postInput.title,
            content: postInput.content,
            imageUrl: postInput.imageUrl,
            creator: userCreatePost
        })
        const result = await postCreate.save()
        userCreatePost.posts.push(result)
        await userCreatePost.save();
        return {
            ...result._doc,
            _id: result._id.toString(),
            createdAt: result.createdAt.toISOString(),
            updatedAt: result.updatedAt.toISOString()
        }
    }
}