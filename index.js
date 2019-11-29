const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.listen(process.env.PORT || 8000)
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, 'models')))
app.use(express.static(path.join(__dirname, 'lib')))
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'index.html'))
})
