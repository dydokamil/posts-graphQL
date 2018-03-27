const users = require('../__mockData__/userData')
const posts = require('../__mockData__/postData')

const { ROOT_URL } = require('../consts')

const axios = jest.genMockFromModule('axios')

axios.get = url => {
  if (url === `${ROOT_URL}/users`) {
    return Promise.resolve({ data: users })
  } else if (url.startsWith(`${ROOT_URL}/user`)) {
    const id = parseInt(url.split('/').pop(), 10)
    const user = users.find(user => user.id === id)

    return Promise.resolve({ data: user })
  } else if (url === `${ROOT_URL}/posts`) {
    return Promise.resolve({ data: posts })
  } else if (url.startsWith(`${ROOT_URL}/post`)) {
    const id = parseInt(url.split('/').pop(), 10)
    const post = posts.find(post => post.id === id)

    return Promise.resolve({ data: post })
  } else {
    throw new Error(`Unknown URL: ${url}`)
  }
}

axios.post = (url, body) => {
  // console.log(url)
  // console.log(body)

  if (url === `${ROOT_URL}/posts`) {
    const post = posts[0]
    post.message = body.message
    return Promise.resolve({ data: post })
  } else {
    throw new Error(`Unknown URL: ${url}`)
  }
}

module.exports = axios
