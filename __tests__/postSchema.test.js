const { graphql } = require('graphql')
const mongoose = require('mongoose')

const schema = require('../schema')
const Post = require('../models/post')
const User = require('../models/user')
const { MONGO_URL_DEV } = require('../consts')

describe('post schema', () => {
  const userData = {
    _id: '5abba8e47af4d91c259e12ef',
    username: 'User1',
    email: 'User1@gql.com',
    createdAt: '2018-12-12T13:00:00',
    lastLogin: '2018-12-12T03:14:07',
    posts: ['5abba8e47af4d91c259e12ee']
  }

  const postData = {
    _id: '5abba8e47af4d91c259e12ee',
    author: userData._id,
    createdAt: '2018-10-10T13:00:00',
    editedAt: '2018-10-10T13:00:00',
    message: 'Some message'
  }

  beforeAll(async () => {
    await mongoose.connect(MONGO_URL_DEV)
    // clear the database
    await Post.removePosts()
    await User.removeUsers()
  })

  beforeEach(async () => {
    const userInstance = new User(userData)
    await userInstance.save()

    const postInstance = new Post(postData)
    await postInstance.save()
  })

  afterEach(async () => {
    await Post.removePosts()
    await User.removeUsers()
  })

  afterAll(done => {
    mongoose.disconnect(done)
  })

  it('should fetch a list of posts', async () => {
    const query = `
      {
        posts {
          _id
          author {
            _id
            username
            email
            createdAt
            lastLogin
            posts {
              _id 
              createdAt 
              editedAt
              message
            }
          }
          createdAt
          editedAt
          message
        }
      } 
    `

    const result = await graphql(schema, query)
    const posts = result.data.posts
    expect(posts.length).toBe(1)
    expect(posts).toMatchSnapshot()
  })

  it('should respond with a single post', async () => {
    const { _id } = postData
    const query = `
      {
        post(_id: "${_id}") {
          _id
          author {
            _id
            username
            email
            createdAt
            lastLogin
            posts {
              _id 
              createdAt 
              editedAt
              message
            }
          }
          createdAt
          editedAt
          message
        }
      } 
    `

    const result = await graphql(schema, query)
    const post = result.data.post
    expect(post).toMatchSnapshot()
  })

  it('should create a post', async () => {
    const message = 'Hello world!'

    const query = `
      mutation {
        createPost(message: "${message}") {
          _id
          author {
            _id
            username
            email
            createdAt
            lastLogin
          }
          createdAt
          editedAt
          message
        }
      } 
    `

    const result = await graphql(schema, query)
    const createPost = result.data.createPost
    expect(createPost.message).toBe(message)
  })
})
