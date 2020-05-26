const express = require('express')
const app = express()
var mysql = require('mysql')
const port = process.env.PORT || 5000;

const connection = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'chandrajournal'
});

app.get('/', (req, res) => {
    connection.query("SELECT * FROM `users`", (err, result) => {
        if (err) {
            console.log(err);
            res.json({ "error": err });
        }
        else {
            console.log(result);
            res.send(result);
        }
    });
});

app.listen(port, () => console.log(`App listening at http://localhost:${port}`))