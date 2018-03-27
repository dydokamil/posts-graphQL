const request = require('supertest')
const app = require('../app')

describe('app', () => {
  it('should return the status', async () => {
    const response = await request(app)
      .post('/graphql')
      .send({ query: 'query { status }' })
    expect(response.statusCode).toBe(200)
    expect(response.body.data.status).toMatchSnapshot()
  })
})
