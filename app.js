const express = require('express')
const app = express()
var mysql = require('mysql')
const bodyParser = require('body-parser')

const port = process.env.PORT || 5000;

const connection = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'chandrajournal'
});

// Body parser
app.use(bodyParser.json({ limit: '50mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));
app.use(express.json());
app.use('/', express.static(__dirname + 'server/index.html'));
app.set('view engine', 'html');

// CORS
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//Check if app is served correctly
app.get('/', (req, res) => 
    res.send('App served successfully!'));

app.get('/test', (req, res) => {
    var sql = "Select * from `entries`";
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

//USER APIs
app.get('/user-login/:form', (req, res) => {
    const form = JSON.parse(req.params.form);
    var sql = "SELECT `UserId`,"+
                    " `UserName`," +
                    " `FirstName`," +
                    " `LastName`,"+
                    " `EmailAddress`"+
                    " FROM `users` WHERE `EmailAddress` = '"+form.email+"'"+
                    " AND `Password` = '"+form.password+"'";
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

app.post('/user-signup', bodyParser.json(), (req, res) => {
    const form = req.body;
    var sql = "INSERT INTO `users` (`UserId`,`UserName`, `FirstName`, `LastName`,`EmailAddress`, `Password`) "+
            "VALUES (NULL, '"+form.username+"','"+ form.firstname + "','"+form.lastname+"',"+
            " '"+form.email+"','"+form.password+"')";
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

//ENTRIES APIs

app.post('/get-entries',bodyParser.json(), (req, res) => {
    const id = req.body.id;
    const page = req.body.id;
    const limit = 6;
    const offset = (page - 1)  * limit;
    var totalRows;
    var results = {};
    var sql = "SELECT `EntryNo`,"+
                    " `Title`," +
                    " `Content`," +
                    " `CreatedTimestamp`"+
                    " FROM `entries` WHERE `UserId` = '"+id+"'"+
                    " ORDER BY `CreatedTimestamp` DESC"+
                    " LIMIT "+limit+" OFFSET "+offset;
    connection.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            res.json({ "error": err });
        }
        else {
            totalRows = result.length;
        }
    });

    connection.query(sql, (err, rows) => {
        if (err) {
            console.log(err);
            res.json({ "error": err });
        }
        else {
            console.log(rows);
            results['page'] = page;
            results['totalRows'] = totalRows;
            results['rows'] = rows;
            res.send(results);
        }
    });
});



app.listen(port, () => console.log(`App listening at http://localhost:${port}`))