mysql = require 'mysql'
request = require 'request'
fs = require 'fs'
zip = require 'unzip'
Score = require './score'
mysql = require 'mysql'
xml2json = require 'xml-to-json'

# These are the attribute_ids from the MySQL database
attributes =
    numMeasures: 1
    numNotes: 2
    numRests: 3
    numChords: 4
    keyChanges: 5
    timeChanges: 6
    numGraceNotes: 7
    numAccidentals: 8

download_mxl = (url, filename, callback) ->
    request url, (error, response, body) ->
        if error
            console.log "Couldn't download MXL document: " + error
        else
            console.log 'Writing MXL file'
            fs.writeFile filename, body, ->
                console.log 'Done writing'
                callback(filename)

mxl_to_xml = (file) ->
    console.log 'Converting...'
    readStream = fs.createReadStream(file)
    readStream.pipe(zip.Parse()).on 'entry', (entry) ->
        console.log entry.path + ' ' + entry.type
        writeStream = fs.createWriteStream 'entry_' + entry.path
        entry.pipe writeStream

add_attributes = (attribute_id, part_id, value) ->
    db = mysql.createConnection
        host: '127.0.0.1'
        user: 'music'
        password: 'music'
        database: 'music'
    db.connect
    q = 'INSERT INTO parts_attributes (attribute_id, part_id, value) VALUES (' + attribute_id + ',' + part_id + ',"' + value + '")'
    db.query q, (err) ->
        throw err if err
        db.end ->
            return

add_part = (score_id, part) ->
    db = mysql.createConnection
        host: '127.0.0.1'
        user: 'music'
        password: 'music'
        database: 'music'
    db.connect
    q = 'INSERT INTO parts (score_id) VALUES (' + score_id + ')'
    db.query q, (err, result) ->
        throw err if err
        for a of attributes
            add_attributes attributes[a], result.insertId, part.calculatedStats[a]
            db.end ->
                return

add_score = (score) ->
    db = mysql.createConnection
        host: '127.0.0.1'
        user: 'music'
        password: 'music'
        database: 'music'
    db.connect
    q = 'INSERT INTO scores (title) VALUES ("Test Score 2");'
    db.query q, (err, result) ->
        throw err if err
        db.end ->
            for part in score.parts
                add_part result.insertId, part

do ->
    file = process.argv[2] || 'testScore.xml'
    xml2json
        input: file
        output: null
    , (err, json) ->
        if err
            console.error 'Error parsing MusicXML: ' + err
        else
            s = new Score(json)
            s.process()
            add_score s
