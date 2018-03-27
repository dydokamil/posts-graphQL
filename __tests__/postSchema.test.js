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
            posts {
              id 
              createdAt 
              editedAt
              message
            }
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

  it('should respond with a single post', async () => {
    const id = 4
    const query = `
      {
        post(postId: ${id}) {
          id
          author {
            id
            username
            email
            createdAt
            lastLogin
            posts {
              id 
              createdAt 
              editedAt
              message
            }
          }
          createdAt
          editedAt
          message
        }
      } 
    `

    const result = await graphql(schema, query)
    const post = result.data.post
    expect(post).toMatchSnapshot()
  })
})
