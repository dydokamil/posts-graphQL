const { Query, Mutation } = require('../resolvers')
const { graphql } = require('graphql')
const mongoose = require('mongoose')

const schema = require('../schema')
const Post = require('../models/post')
const User = require('../models/user')
const { MONGO_URL_DEV } = require('../consts')

describe('post resolver', () => {
  const userData = {
    _id: '5abba8e47af4d91c259e12ef',
    username: 'User1',
    email: 'User1@gql.com',
    createdAt: '2018-12-12T13:00:00',
    lastLogin: '2018-12-12T03:14:07',
    posts: ['41224d776a326fb40f000002']
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
  it('should get a list of posts', async () => {
    const posts = await Query.posts()
    expect(posts.length).toBe(1)
    expect(posts).toMatchSnapshot()
  })

  it('should get a specific post', async () => {
    const { _id } = postData
    const user = await Query.post({}, { _id })
    expect(user._id.equals(_id)).toBeTruthy()
    expect(user).toMatchSnapshot()
  })

  it('should create a post', async () => {
    const message = 'Hello world!'
    const author = userData._id
    const createPost = await Mutation.createPost({}, { message, author })
    expect(createPost.message).toBe(message)
  })
})
