require('dotenv').config()
const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const linkController = require('./controllers/link')
const adminController = require('./controllers/admin')
app.use('/', linkController)
app.use('/admin', adminController)
app.use('/auth', require('./controllers/user'))

app.listen(process.env.PORT || 3000, () => {
  console.log(`[LSCSlinks] Server started. (Listening on port: ${process.env.PORT || 3000})`)
})

