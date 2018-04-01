const mongoose = require('mongoose')

const { MONGO_URL_DEV } = require('../consts')
const Subject = require('../models/subject')
// const resolver = require('../resolvers')
const { Mutation } = require('../resolvers')

describe('subject resolver', () => {
  beforeAll(async () => {
    await mongoose.connect(MONGO_URL_DEV)
    // clear the database
    await Subject.removeSubjects()
  })

  beforeEach(async () => {
    // const userInstance = new User(userData)
    // await userInstance.save()
    // const postInstance = new Post(postData)
    // await postInstance.save()
  })

  afterEach(async () => {
    await Subject.removeSubjects()
  })

  afterAll(async done => {
    await mongoose.disconnect(done)
  })

  it('should create a subject', () => {
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
            expect(subject.message).toBe(message)
            expect(subject.title).toBe(title)
            expect(subject.createdAt).toBeDefined()
            expect(subject.author).toBeDefined()
          }
        )
      })
    })
  })
})
