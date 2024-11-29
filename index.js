require('dotenv').config()
const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/', require('./controllers/link'))
app.use('/admin', require('./controllers/admin'))

// NOTE: deprecated for google login
// app.use('/auth', require('./controllers/user'))

app.use('/analytics', require('./controllers/analytics'))

app.listen(process.env.PORT || 3000, () => {
  console.log(`[LSCSlinks] Server started. (Listening on port: ${process.env.PORT || 3000})`)
})

