jest.mock('axios')

const { Query } = require('../resolvers')

describe('user resolver', () => {
  it('should respond with users', async () => {
    const users = await Query.users()
    expect(users.length).toBe(3)
    expect(users).toMatchSnapshot()
  })

  it('should respond with a user', async () => {
    const id = 1
    const user = await Query.user({}, { userId: id })
    expect(user.id).toBe(id)
    expect(user).toMatchSnapshot()
  })
})
