const express = require('express');
const { createServer } = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { graphqlHTTP } = require('express-graphql');
const graphqlSchema = require('./graphQL/schema');
const graphqlResolver = require('./graphQL/resolvers');
const isAuth = require('./middleware/isAuth')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },
    filename: (req, file, cb) => {
        cb(null, uuidv4())
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true)
    } else {
        cb(null, false)
    }
};

const app = express();
dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(multer({ storage, fileFilter }).single('image'))

//Config Cors
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200)
    }
    next();
});


app.use(isAuth)

//GraphQL
app.use('/graphql', graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,
    customFormatErrorFn(err) {
        if (!err.originalError) {
            return err;
        }
        /*
        * err.originalError: lấy từ các trường mà mình tự thêm vào instance Error được tạo ra
        * err.message: lấy từ message khi khởi tạo Error instance
        *
        * */
        const data = err.originalError.data;
        const message = err.message || 'An error occured';
        const statusCode = err.originalError.statusCode || 500
        return {
            message,
            status: statusCode,
            data
        }
    }
}))




//Handle Error
app.use((err, req, res, next) => {
    console.log(err);
    const status = err.statusCode || 500;
    const message = err.message;
    const detail = err.detail || 'Server Error';
    res.status(status).json({
       message,
       detail
    });
});

//Start server
(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('connected to DB');
        const httpServer = createServer(app);
        httpServer.listen(8080);
    } catch (e) {
        console.log(e)
    }

})();
