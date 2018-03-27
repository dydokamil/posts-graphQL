jest.mock('axios')

const { graphql } = require('graphql')
const schema = require('../schema')

describe('User schema', () => {
  it('should respond with a list of users', async () => {
    const query = `
    {
      users {
        username
        email
      }
    } 
    `
    const result = await graphql(schema, query)
    const users = result.data.users
    expect(users.length).toBe(3)
    expect(users).toMatchSnapshot()
  })
})
