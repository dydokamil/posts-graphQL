jest.mock('axios')

const { Query } = require('../resolvers')

describe('user resolver', () => {
  it('should respond with users', async () => {
    const users = await Query.users()
    expect(users.length).toBe(3)
    expect(users).toMatchSnapshot()
  })

  it('should respond with a user', async () => {
    const user = await Query.user({}, { userId: 1 })
    expect(user.id).toBe(1)
    expect(user).toMatchSnapshot()
  })
})
