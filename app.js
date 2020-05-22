const express = require('express')
const app = express()
const port = 3000

const mysql = require('mysql');

app.get('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => console.log(`Aapp listening at http://localhost:${port}`))