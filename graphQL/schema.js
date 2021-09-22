const { buildSchema } = require('graphql');


/*
* !: là kí hiệu required;
* schema: chứa các keyword query: [GET], mutation: [POST, PUT, PATCH, DELETE]
* type: tạo ra các field của object cần query (giống khi tạo schema mongoose), các type này có thể dùng các dạng type khác
* */
module.exports = buildSchema(`
    type Post {
        _id: ID!
        title: String!
        content: String!
        creator: User!
        createdAt: String!
        updatedAt: String!
    }
    
    
    type User {
        _id: ID!
        name: String!
        email: String!
        password: String!
        status: String!
        posts: [Post!]!
    }
    
    input UserInputData {
        email: String!
        password: String!
        name: String!
    }
    
    type RootMutation {
        createUser(userInput: UserInputData): User!
    }
    
    type RootQuery {
        hello: String
    }
    
    schema {
        query: RootQuery
        mutation: RootMutation
    }

`);