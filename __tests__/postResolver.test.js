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
    password: 'test',
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
    // const userInstance = new User(userData)
    // await userInstance.save()
    // const postInstance = new Post(postData)
    // await postInstance.save()
  })

  afterEach(async () => {
    await Post.removePosts()
    await User.removeUsers()
  })

  afterAll(async done => {
    await mongoose.disconnect(done)
  })

  it('should get a list of posts', () => {
    const postInstance = new Post(postData)
    return postInstance.save().then(() => {
      return Query.posts().then(posts => {
        expect(posts.length).toBe(1)
        expect(posts).toMatchSnapshot()
      })
    })
  })

  it('should get a specific post', () => {
    const { _id } = postData

    const postInstance = new Post(postData)
    return postInstance.save().then(() => {
      return Query.post({}, { _id }).then(user => {
        expect(user._id.equals(_id)).toBeTruthy()
        expect(user).toMatchSnapshot()
      })
    })
  })

  it('should create a subject, then post', () => {
    const username = 'User2'
    const email = 'user2@user.com'
    const password = 'test2'

    const message = 'some message2'
    const title = 'some title2'

    return Mutation.createUser({}, { username, email, password }).then(user => {
      return Mutation.login({}, { username, password }).then(loginResult => {
        const { token } = loginResult

        return Mutation.createSubject({}, { token, message, title }).then(
          subject => {
            const subjectId = subject._id

            return Mutation.createPost(
              {},
              {
                subjectId,
                token,
                message
              }
            ).then(subjectUpdated => {
              expect(subjectUpdated.responses.length).toBe(1)
            })
          }
        )
      })
    })
  })
})
