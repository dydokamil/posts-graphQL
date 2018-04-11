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
    createdAt: 1523390727,
    lastLogin: 1523390727,
    posts: ['5abba8e47af4d91c259e12ee']
  }

  const postData = {
    _id: '5abba8e47af4d91c259e12ee',
    author: userData._id,
    createdAt: 1523390727,
    editedAt: 1523390727,
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
                createdAt
                editedAt
                message
                author {
                  _id
                  username
                  email
                  createdAt
                  lastLogin
                }
              }
            } 
          `

          return graphql(schema, createPostQuery).then(result => {
            const { createPost } = result.data
            expect(createPost.message).toBe(postMessage)
          })
        })
      })
    })
  })

  it('should create a subject, then post, then edit the post', () => {
    expect.assertions(2)
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
            }
          }
        `

          return graphql(schema, createPostQuery).then(post => {
            const { createPost } = post.data
            const newMessage = 'New Message'

            const editPostQuery = `
              mutation {
                editPost(
                  postId: "${createPost._id}"
                  token: "${token}"
                  message: "${newMessage}"
                ) {
                  editedAt
                  message
                }
              } 
            `

            return graphql(schema, editPostQuery).then(success => {
              const getPostQuery = `
                {
                  post(_id: "${createPost._id}") {
                    message
                    editedAt
                  }
                } 
              `

              return graphql(schema, getPostQuery).then(editedPost => {
                const { post } = editedPost.data
                expect(post.editedAt).toBeDefined()
                expect(post.message).toBe(newMessage)
              })
            })
          })
        })
      })
    })
  })

  it('should create a subject, then post, then delete the post', () => {
    expect.assertions(1)
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
            }
          }
        `

          return graphql(schema, createPostQuery).then(post => {
            // const subjectWithResponse = result.data.createPost

            // const postId = subjectWithResponse.responses[0]._id

            const deletePostQuery = `
              mutation {
                deletePost(
                  postId: "${post._id}"
                  token: "${token}"
                ) {
                  _id
                }
              } 
            `

            return graphql(schema, deletePostQuery).then(success => {
              const getPostQuery = `
                {
                  post(_id: "${post._id}") {
                    message
                    editedAt
                  }
                } 
              `

              return graphql(schema, getPostQuery).then(nullPost => {
                expect(nullPost.data.post).not.toBeTruthy()
              })
            })
          })
        })
      })
    })
  })
})
