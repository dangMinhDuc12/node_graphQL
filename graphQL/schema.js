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
        imageUrl: String!
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
    
    input PostInputData {
        title: String!
        content: String!
        imageUrl: String!
    }
    type AuthData {
        token: String!
        userId: String!
    
    }
    
    type PostData {
        posts: [Post!]!
        totalPosts: Int!
    }
    
    type RootMutation {
        createUser(userInput: UserInputData): User!
        createPost(postInput: PostInputData): Post!
    }
    
    type RootQuery {
        login(email: String!, password: String!): AuthData!
        posts(page: Int!): PostData!
    }
    
    schema {
        query: RootQuery
        mutation: RootMutation
    }

`);