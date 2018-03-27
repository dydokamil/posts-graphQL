jest.mock('axios')

const { Query } = require('../resolvers')

describe('user resolver', () => {
  it('should respond with users', async () => {
    const users = await Query.users()
    expect(users.length).toBe(3)
    expect(users).toMatchSnapshot()
  })
})
