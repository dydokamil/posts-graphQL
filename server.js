const { execute, subscribe } = require('graphql')
const { SubscriptionServer } = require('subscriptions-transport-ws')
const { createServer } = require('http')

const schema = require('./schema')
const app = require('./app')

const PORT = 3000

const ws = createServer(app)
ws.listen(PORT, () => {
  console.log(`Express running on ${PORT}`)
  new SubscriptionServer(
    {
      execute,
      subscribe,
      schema
    },
    {
      server: ws
      // path: '/subscriptions'
    }
  )
})
