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
    return Promise.resolve({ data: posts })
  } else {
    throw new Error(`Unknown URL ${url}`)
  }
}

module.exports = axios
