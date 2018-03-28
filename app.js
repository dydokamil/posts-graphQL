const express = require('express')
const path = require('path')
// const favicon = require('serve-favicon')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const { graphiqlExpress, graphqlExpress } = require('apollo-server-express')
const mongoose = require('mongoose')

const { MONGO_URL_DEV } = require('./consts')
const schema = require('./schema')

const app = express()

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

mongoose.connect(MONGO_URL_DEV)
const db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'))

app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }))
app.use('/graphql', bodyParser.json(), graphqlExpress({ schema }))

module.exports = app
