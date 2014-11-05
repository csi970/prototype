mysql = require 'mysql'
request = require 'request'
fs = require 'fs'
zip = require 'unzip'
Score = require './score'
mysql = require 'mysql'
xml2json = require 'xml-to-json'

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

add_score = (score) ->
    db = mysql.createConnection
        host: '127.0.0.1'
        user: 'music'
        password: 'music'
        database: 'music'

    db.connect

    db.query 'INSERT INTO scores (title) VALUES ("Test Score")', (err, score_id) ->
        throw err if err
        for part in score.parts
            db.query 'INSERT INTO parts (score_id) VALUES (' + score_id + ')', (err, part_id) ->
                for a of attributes
                    db.query 'INSERT INTO parts_attributes (attribute_id, part_id, value) VALUES (' + attributes[a] + ', ' + part_id + ', "' + part[a] + '")'

    db.end

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
        return
