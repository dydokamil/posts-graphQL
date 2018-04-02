const { graphql } = require('graphql')
const mongoose = require('mongoose')

const { MONGO_URL_DEV } = require('../consts')
const Subject = require('../models/subject')
const schema = require('../schema')

describe('subject schema GQL', () => {
  beforeAll(async () => {
    await mongoose.connect(MONGO_URL_DEV)
    // clear the database
    // await User.removeUsers()
    await Subject.removeSubjects()
  })

  afterEach(async () => {
    await Subject.removeSubjects()
  })

  afterAll(async done => {
    await mongoose.disconnect(done)
  })

  it('should create a subject', () => {
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

          expect(createSubject.message).toBe(message)
          expect(createSubject.title).toBe(title)
          expect(createSubject.createdAt).toBeDefined()
          expect(createSubject.author.username).toBeTruthy()
        })
      })
    })
  })

  it('should not create a subject given an invalid token', () => {
    expect.assertions(1)

    const cheekyToken =
      'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE1MjIzNDM1NjQsImV4cCI6MTUyMjQwODM2NH0.IHfxZBHvrwdETakAqbqBncg-rcvbOwRCG_zk2KFfFDunzki77aAReYHVqFTAVSwZ_C_YmlpIyUE8YXm2cIWViKeCPWuaLNd_G6yBZ9qwrBBtksFCDXWmUdLc4tJ92NzaIqwjVZtsfBRUleuWJu1MtIEIPO2gPIGA_pAvyd5zBY8fcdva4DgjBKwHKtn-2MuTwK9r_UgVE20DgLHu92sjv-qVlT6Op8hyTT5tGZjywVmlL23i7r_R7z6nBAzz1hYgVh9L7ndxNJagbOBftHzQe8mDEy0Mab9fVV8Gmr5-Il28ZTw4eCHct9Gd3LbFjuukb1kMCfkkISTUKxPmqwmAXw'

    const message = 'Some message'
    const title = 'Some title'

    const createSubjectQuery = `
      mutation {
        createSubject(
          token: "${cheekyToken}"
          message: "${message}"
          title: "${title}"
        ) {
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
      expect(result).toMatchSnapshot()
    })
  })

  it('should update a subject', () => {
    const username = 'User'
    const email = 'user@user.com'
    const password = 'test'

    const newMessage = 'some new message'
    const newTitle = 'some new title'

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

          const updateSubjectQuery = `
            mutation {
              updateSubject(
                subjectId: "${subjectId}"
                token: "${token}"
                message: "${newMessage}"
                title: "${newTitle}"
              ) {
                message
                title
                editedAt
              }
            } 
          `

          return graphql(schema, updateSubjectQuery).then(() => {
            const getSubjectQuery = `
              {
                subject(_id: "${subjectId}") {
                  message
                  title
                  editedAt
                }
              }
            `

            return graphql(schema, getSubjectQuery).then(response => {
              const subjectUpdated = response.data.subject
              expect(subjectUpdated.message).toBe(newMessage)
              expect(subjectUpdated.title).toBe(newTitle)
              expect(subjectUpdated.editedAt).toBeDefined()
            })
          })
        })
      })
    })
  })

  it('should delete a subject', () => {
    const username = 'User'
    const email = 'user@user.com'
    const password = 'test'

    const newMessage = 'some new message'
    const newTitle = 'some new title'

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

          const deleteSubjectQuery = `
            mutation {
              deleteSubject(
                subjectId: "${subjectId}"
                token: "${token}"
              ) {
                _id
                message
                title
                editedAt
              }
            } 
          `

          return graphql(schema, deleteSubjectQuery).then(deletedSubject => {
            const getSubjectQuery = `
              {
                subject(_id: "${subjectId}") {
                  message
                  title
                  editedAt
                }
              }
            `

            return graphql(schema, getSubjectQuery).then(nullSubject => {
              expect(nullSubject.data.subject).not.toBeTruthy()
            })
          })
        })
      })
    })
  })
})
