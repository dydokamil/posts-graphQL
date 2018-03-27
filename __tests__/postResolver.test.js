jest.mock('axios')

const { Query, Mutation } = require('../resolvers')

describe('post resolver', () => {
  it('should get a list of posts', async () => {
    const posts = await Query.posts()
    expect(posts.length).toBe(5)
    expect(posts).toMatchSnapshot()
  })

  it('should get a specific post', async () => {
    const id = 4
    const user = await Query.post({}, { postId: id })
    expect(user.id).toBe(id)
    expect(user).toMatchSnapshot()
  })

  it('should create a post', async () => {
    const message = 'Hello world!'
    const createPost = await Mutation.createPost({}, { message })
    expect(createPost.message).toBe(message)
    expect(createPost).toMatchSnapshot()
  })
})
