const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => res.send('APP SUCCESSFULLY HOSTED!'))

app.listen(port, () => console.log(`Aapp listening at http://localhost:${port}`))