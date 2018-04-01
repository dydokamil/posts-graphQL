const { graphql } = require('graphql')
const mongoose = require('mongoose')

const schema = require('../schema')
const Post = require('../models/post')
const User = require('../models/user')
const { MONGO_URL_DEV } = require('../consts')

describe('post schema', () => {
  const userData = {
    _id: '5abba8e47af4d91c259e12ef',
    password: 'test',
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

  it('should fetch a list of posts', () => {
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
          }
          createdAt
          editedAt
          message
        }
      } 
    `

    const postInstance = new Post(postData)
    return postInstance.save().then(() => {
      return graphql(schema, query).then(result => {
        const posts = result.data.posts
        expect(posts.length).toBe(1)
        expect(posts).toMatchSnapshot()
      })
    })
  })

  it('should respond with a single post', () => {
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
          }
          createdAt
          editedAt
          message
        }
      } 
    `

    const postInstance = new Post(postData)
    return postInstance.save().then(() => {
      return graphql(schema, query).then(result => {
        const post = result.data.post
        expect(post).toMatchSnapshot()
      })
    })
  })

  it('should create a subject, then post', () => {
    const username = 'User'
    const email = 'user@user.com'
    const password = 'test'

    const createUserQuery = `
      mutation {
        createUser(
          username: "${username}"
          email: "${email}"
          password: "${password}"
        ) {
          username
        }
      } 
    `

    const loginQuery = `
      mutation {
        login(
          username: "${username}"
          password: "${password}"
        ) {
          token
        }
      }
    `

    return graphql(schema, createUserQuery).then(user => {
      return graphql(schema, loginQuery).then(result => {
        const message = 'Some message'
        const title = 'Some title'

        const { token } = result.data.login

        const createSubjectQuery = `
          mutation {
            createSubject(
              token: "${token}"
              message: "${message}"
              title: "${title}"
            ) {
              _id
              createdAt
              message
              title
              author {
                username
              }
            }
          } 
        `

        return graphql(schema, createSubjectQuery).then(result => {
          const { createSubject } = result.data
          const subjectId = createSubject._id

          const postMessage = 'post message'

          const createPostQuery = `
          mutation {
            createPost(
              subjectId: "${subjectId}"
              token: "${token}"
              message: "${postMessage}"
            ) {
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
              responses {
                _id
              }
            }
          } 
        `

          return graphql(schema, createPostQuery).then(result => {
            const subjectWithResponse = result.data.createPost
            expect(subjectWithResponse.responses.length).toBe(1)
          })
        })
      })
    })
  })
})
