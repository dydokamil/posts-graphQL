const mongoose = require('mongoose')

const { MONGO_URL_DEV } = require('../consts')
const Post = require('../models/post')
const User = require('../models/user')

describe('mongoose `Post` schema', () => {
  const user = {
    _id: '5abba8e47af4d91c259e12ef',
    username: 'User1',
    email: 'User1@gql.com',
    createdAt: '2018-12-12T13:00:00',
    lastLogin: '2018-12-12T03:14:07',
    posts: ['41224d776a326fb40f000002']
  }

  const post = {
    _id: '5abba8e47af4d91c259e12ee',
    author: user._id,
    createdAt: '2018-10-10T13:00:00',
    editedAt: '2018-10-10T13:00:00',
    message: 'Some message'
  }

  beforeAll(() => {
    mongoose.connect(MONGO_URL_DEV)
  })

  beforeEach(async () => {
    const userInstance = new User(user)
    await userInstance.save()

    const postInstance = new Post(post)

    await postInstance.save()
  })

  afterEach(async () => {
    await Post.removePosts()
    await User.removeUsers()
  })

  afterAll(done => {
    mongoose.disconnect(done)
  })

  it('should create 1 post', async () => {
    const result = await Post.find({})
    expect(result).toMatchSnapshot()
    expect(result.length).toBe(1)
  })

  it('should delete all post', async () => {
    await Post.removePosts()
    const posts = await Post.find({})
    expect(posts.length).toBe(0)
    expect(posts).toEqual([])
  })
})
