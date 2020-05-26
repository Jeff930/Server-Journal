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

app.get('/sample', (req, res) => {
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

app.get('/user-login/:form', (req, res) => {
    var domain = req.params.domain;
    const form = JSON.parse(req.params.form);
    var sql = "SELECT `UserId`,"+
                    " `UserName`," +
                    " `FirstName`," +
                    " `LastName`,"+
                    " `EmailAddress`"+
                    " FROM `users` WHERE `EmailAddress` = '"+form.email+"'"+
                    " AND `Password` = '"+md5(form.password)+"'";
    connection.query(sql, (err, result) => {
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

app.get('/', (req, res) => {
    var domain = req.params.domain;
    const form = JSON.parse(req.params.form);
    var sql = "SELECT * FROM `entries`";
    connection.query(sql, (err, result) => {
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