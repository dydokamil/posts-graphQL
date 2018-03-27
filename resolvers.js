const axios = require('axios')

const { ROOT_URL } = require('./consts')

const resolvers = {
  Query: {
    status: () => 'GraphQL status: OK',
    users: () => axios.get(`${ROOT_URL}/users`).then(res => res.data),
    user: (obj, args) =>
      axios.get(`${ROOT_URL}/user/${args.userId}`).then(res => res.data)
  }
}

module.exports = resolvers
