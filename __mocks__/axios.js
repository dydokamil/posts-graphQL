const users = require('../__mockData__/userData')
const axios = jest.genMockFromModule('axios')

const { ROOT_URL } = require('../consts')

axios.get = url => {
  switch (url) {
    case `${ROOT_URL}/users`:
      return Promise.resolve({ data: users })
  }
}

module.exports = axios
