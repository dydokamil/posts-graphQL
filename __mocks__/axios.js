const users = require('../__mockData__/userData')
const posts = require('../__mockData__/postData')

const axios = jest.genMockFromModule('axios')

axios.get = url => {
  // console.log('URL', url)
  if (url === `undefined/users`) {
    return Promise.resolve({ data: users })
  } else if (url.startsWith(`undefined/user/`)) {
    const id = parseInt(url.split('/').pop(), 10)
    const user = users.find(user => user.id === id)

    return Promise.resolve({ data: user })
  } else if (url === `undefined/posts`) {
    posts.forEach(post => {
      const author = users.find(user => user.posts.includes(post.id))
      post.author = author
    })
    return Promise.resolve({ data: posts })
  } else if (url.startsWith(`undefined/post/`)) {
    const id = parseInt(url.split('/').pop(), 10)
    const post = posts.find(post => post.id === id)
    const author = users.find(user => user.posts.includes(post.id))
    post.author = author

    return Promise.resolve({ data: post })
  } else {
    throw new Error(`Unknown URL ${url}`)
  }
}

module.exports = axios
