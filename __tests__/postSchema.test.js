jest.mock('axios')

const { graphql } = require('graphql')
const schema = require('../schema')

describe('post schema', () => {
  it('should fetch a list of posts', async () => {
    const query = `
      {
        posts {
          id
          author {
            id
            username
            email
            createdAt
            lastLogin
            posts
          }
          createdAt
          editedAt
          message
        }
      } 
    `

    const result = await graphql(schema, query)
    const posts = result.data.posts
    expect(posts.length).toBe(5)
    expect(posts).toMatchSnapshot()
  })
})
