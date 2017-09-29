var express = require('express');
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;


//==============Server================

var app = express();

var port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/form.html');
});

app.get('/drop', function (req, res) {
    dropCollection();
    res.end('Collection dropped');
})

app.post('/addUser', function (req, res) {
    var reqBody = req.body;
    var user = {
        nickname: reqBody.nickname,
        score:    reqBody.score
    };
    insertOrUpdate(user, function () {
        descendingUsers(function(users) {
            displayUsers(res, users);
        })
    });
});

app.listen(port, function () {
    console.log('Server is runizehifhziening on port: ' + port);
});




//=====================View==============

function displayUsers (res, users) {
    res.write('<table>');

    res.write('<tr>');
    res.write('<th>Utilisateurs</th>');
    res.write('<th>Score</th>');
    res.write('</tr>');

    for (var i in users) {
        var user = users[i];
        var name = user.nickname;
        var score = user.score;
        res.write('<tr>');
        res.write('<td>' + name + '</td>');
        res.write('<td>' + score + '</td>');
        res.write('</tr>');
    }

    res.write('</table>');

    res.end();
}





//===============Mongo=================

var url = 'mongodb://machko:machko@ds135394.mlab.com:35394/machko_test';

var db;
var usersCollection;


MongoClient.connect(url, function (err, _db) {
    db = _db;
    usersCollection = db.collection('users');
});


function insertOrUpdate (user, callback) {
    fetchUsers({
        nickname: user.nickname
    }, function (users) {
        if (users.length > 0) {
            updateUser(user, callback);
        } else {
            insertUser(user, callback);
        }
    });
}


function insertUser (user, callback) {
    usersCollection.insertOne(user, callback);
}


function updateUser (user, callback) {
    usersCollection.updateOne({
        nickname: user.nickname
    }, {
        $set: {
            score: user.score
        }
    }, callback);
}


function descendingUsers (callback) {
    aggregateUsers([
        {
            $sort : {
                score : -1
            }
        }
    ], callback);
}


function fetchUsers (params, callback) {
    params = params || {};

    usersCollection.find(params).toArray(function (err, users) {
        callback(users);
    });
}


function aggregateUsers (params, callback) {
    usersCollection.aggregate(params).toArray(function (err, users) {
        callback(users);
    });
}


function dropCollection (callback) {
    usersCollection.drop(callback);
}
