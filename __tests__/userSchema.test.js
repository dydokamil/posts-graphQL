jest.mock('axios')

const { graphql } = require('graphql')
const schema = require('../schema')

describe('User schema', () => {
  it('should respond with a list of users', async () => {
    const query = `
      {
        users {
          id
          username
          email
          createdAt
          lastLogin
          posts
        }
      } 
    `
    const result = await graphql(schema, query)
    const users = result.data.users
    expect(users.length).toBe(3)
    expect(users).toMatchSnapshot()
  })

  it('should respond with an object of a particular user', async () => {
    const query = `
      {
        user(userId: 1) {
          id
          username
          email
          createdAt
          lastLogin
          posts
        }
      }
    `
    const result = await graphql(schema, query)
    const user = result.data.user
    expect(user).toMatchSnapshot()
  })
})
