var mysql = require('mysql');
var db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'music',
    password: 'music',
    database: 'music'
});

db.connect();


db.query('SELECT title, difficulty FROM music', function(err, rows, fields) {
    if (err) {
        throw err;
    }

    for (var i = 0; i < rows.length; i++) {
        console.log(rows[i].title + ': ' + rows[i].difficulty);
    }
});

db.end();
