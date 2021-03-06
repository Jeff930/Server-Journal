const express = require('express')
const app = express()
var mysql = require('mysql')
const bodyParser = require('body-parser')
const file = require("fs") 
var atob = require('atob');
const path = require('path');

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
    var sql = "SELECT `UserId`," +
        " `UserName`," +
        " `FirstName`," +
        " `LastName`," +
        " `EmailAddress`," +
        " `CreatedTimestamp`" +
        " FROM `users` WHERE `EmailAddress` = '" + form.email + "'" +
        " AND `Password` = '" + form.password + "'";
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

app.get('/user-details/:userId', (req, res) => {
    const userId = req.params.userId;
    console.log(userId);
    var sql = "SELECT `UserId`," +
        " `UserName`," +
        " `FirstName`," +
        " `LastName`," +
        " `Birthdate`," +
        " `EmailAddress`," +
        " `LifeVerse`," +
        " `VerseContent`" +
        " FROM `users` WHERE `UserId` = '" + userId + "'";
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

app.post('/update-user-details', bodyParser.json(), (req, res) => {
    const form = req.body;
    console.log("Form: ",form);
    var sql = "UPDATE users SET" +
        " `UserName` = '" + form.username + "'," +
        " `FirstName` = '" + form.firstname + "'," +
        " `LastName` = '" + form.lastname + "'," +
        " `Birthdate` = '" + form.birthdate + "'," +
        " `EmailAddress` = '" + form.email + "'," +
        " `LifeVerse` = '" + form.lifeverse + "'," +
        " `VerseContent` = '" + form.versecontent + "'" +
        "  WHERE `UserId` = '" + form.userid + "'";

    connection.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            res.json({ "error": err });
        }
        else {
            console.log("Result: ", result);
            res.send(result);
        }
    });
});

app.post('/user-signup', bodyParser.json(), (req, res) => {
    const form = req.body;
    var sql = "INSERT INTO `users` (`UserId`,`UserName`, `FirstName`, `LastName`,`EmailAddress`, `Password`,`CreatedTimestamp`) " +
        "VALUES (NULL, '" + form.username + "','" + form.firstname + "','" + form.lastname + "'," +
        " '" + form.email + "','" + form.password + "', CURRENT_TIMESTAMP)";
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

app.post('/create-entry', bodyParser.json(), (req, res) => {
    const form = req.body;
    var images = form.images;
    var sql = "INSERT INTO `entries` (`EntryNo`,`Title`, `Content`, `CreatedTimestamp`,`UserId`) " +
        "VALUES (NULL, '" + form.title + "','" + form.content + "',CURRENT_TIMESTAMP," +
        " '" + form.userId+ "')";
    connection.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            res.json({ "error": err });
        }
        else {
            console.log(result);
            var entryDir ='./images/entries/' + result['insertId'];
                file.access(entryDir, function(err) {
                    if (err.code === 'ENOENT') {
                        file.mkdir(entryDir,function(err){
                            if (err) {
                                res.send(err);
                            } else{
                                console.log("Directory created successfully!");
                                for (var i = 0;i<JSON.parse(images).length;i++ ){
                                    var filename = result['insertId'] + '-' + i + ".jpeg";
                                    var base64Data = atob(JSON.parse(images)[i]).replace("-", "+").replace("_", "/");
                                    base64Data = base64Data.replace(/^data:image\/jpeg;base64,/, "");
                                    
                                    var filePath = entryDir+'/'+filename;
                    
                                    file.writeFile(filePath, base64Data, 'base64', function(err) {
                                        if(err===null){
                                            console.log("Files Created Successfully!");
                                        }else{
                                            console.log("Error Encountered: ",err);
                                        }
                                    });
                               }  
                            }
                           
                        });
                    }
                });
           res.send('{"Success": true}');
        }
    });
});

app.post('/get-entries', bodyParser.json(), (req, res) => {
    const id = req.body.id;
    const page = req.body.page;
    const limit = 6;
    const offset = (page - 1) * limit;
    var totalPages;
    var results = {};
    var sqlCount = "SELECT `EntryNo`," +
        " `Title`," +
        " `Content`," +
        " `CreatedTimestamp`" +
        " FROM `entries` WHERE `UserId` = '" + id + "'";

    var sql = "SELECT `EntryNo`," +
        " `Title`," +
        " `Content`," +
        " `CreatedTimestamp`" +
        " FROM `entries` WHERE `UserId` = '" + id + "'" +
        " ORDER BY `CreatedTimestamp` DESC" +
        " LIMIT " + limit + " OFFSET " + offset;

    connection.query(sqlCount, (err, result) => {
        if (err) {
            console.log(err);
            res.json({ "error": err });
            res.end("Error occured.");
        }
        else {
            totalPages = Math.ceil(result.length / limit);
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
            results['totalPages'] = totalPages;
            results['rows'] = rows;
            res.send(results);
        }
    });
});

app.post('/search-entries', bodyParser.json(), (req, res) => {
    const id = req.body.id;
    const page = req.body.page;
    const searchKey = req.body.searchKey;
    const limit = 6;
    const offset = (page - 1) * limit;
    var totalPages;
    var results = {};
    var sqlCount = "SELECT `EntryNo`," +
        " `Title`," +
        " `Content`," +
        " `CreatedTimestamp`" +
        " FROM `entries` WHERE `UserId` = '" + id + "' AND `Title` LIKE '%" + searchKey + "%'";

    var sql = "SELECT `EntryNo`," +
        " `Title`," +
        " `Content`," +
        " `CreatedTimestamp`" +
        " FROM `entries` WHERE `UserId` = '" + id + "' AND `Title` LIKE '%" + searchKey + "%'" +
        " ORDER BY `CreatedTimestamp` DESC" +
        " LIMIT " + limit + " OFFSET " + offset;

    connection.query(sqlCount, (err, result) => {
        if (err) {
            console.log(err);
            res.json({ "error": err });
            res.end("Error occured.");
        }
        else {
            totalPages = Math.ceil(result.length / limit);
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
            results['totalPages'] = totalPages;
            results['rows'] = rows;
            res.send(results);
        }
    });
});

app.post('/filter-entries', bodyParser.json(), (req, res) => {
    const id = req.body.id;
    const page = req.body.page;
    const date = req.body.date;
    const limit = 6;
    const offset = (page - 1) * limit;
    var totalPages;
    var results = {};
    var sqlCount = "SELECT `EntryNo`," +
        " `Title`," +
        " `Content`," +
        " `CreatedTimestamp`" +
        " FROM `entries` WHERE `UserId` = '" + id + 
        "' AND date(`CreatedTimestamp`) = '"+date+
        "' ORDER BY `CreatedTimestamp` DESC";

    var sql = "SELECT `EntryNo`," +
        " `Title`," +
        " `Content`," +
        " `CreatedTimestamp`" +
        " FROM `entries` WHERE `UserId` = '" + id + 
        "' AND date(`CreatedTimestamp`) = '"+date+
        "' ORDER BY `CreatedTimestamp` DESC"+
        " LIMIT " + limit + " OFFSET " + offset;

    connection.query(sqlCount, (err, result) => {
        if (err) {
            console.log(err);
            res.json({ "error": err });
            res.end("Error occured.");
        }
        else {
            totalPages = Math.ceil(result.length / limit);
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
            results['totalPages'] = totalPages;
            results['rows'] = rows;
            res.send(results);
        }
    });
});

app.post('/update-entry', bodyParser.json(), (req, res) => {
    const form = req.body;
    var sql = "UPDATE `entries` SET" +
        " `Title` = '" + form.title + "'," +
        " `Content` = '" + form.content + "'" +
        "  WHERE `EntryNo` = '" + form.entryNo + "'";

    connection.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            res.json({ "error": err });
        }
        else {
            console.log("Result: ", result);
            res.send(result);
        }
    });
});

app.get('/delete-entry/:id', (req, res) => {
    const id = req.params.id;
    console.log(id);
    var sql = "DELETE FROM `Entries` WHERE `EntryNo` = '"+id+"'";
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