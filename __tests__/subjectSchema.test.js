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
          expect(createSubject.author).toBeDefined()
        })
      })
    })
  })
})
