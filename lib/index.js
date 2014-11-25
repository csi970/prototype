var xml2json = require('xml2json');
var Score = require('./models/score');
var fs = require('fs');

var parseMusicXML = function(xml, next) {
    var json = JSON.parse(xml2json.toJson(xml));
    var s = new Score(json);
    next(s);
};

var parseMXL = function(mxl, next) {
    var zip = require('node-zip')(mxl, {
        base64: false,
        compression: 'DEFLATE'
    });

    var xml = zip.files['META-INF/container.xml'].asText();
    var json = JSON.parse(xml2json.toJson(xml));

    var filename = json.container.rootfiles.rootfile['full-path'];

    var musicXML = zip.files[filename].asText();
    parseMusicXML(musicXML, next);
};

var parseMusicXMLFile = function(filename, next) {
    fs.readFile(filename, function(err, data) {
        if (err) {
            console.error(err);
        } else {
            parseMusicXML(data, next);
        }
    });
};

var parseMXLFile = function(filename, next) {
    fs.readFile(filename, function(err, data) {
        parseMXL(data, next);
    });
};

module.exports.parseMusicXMLFile = parseMusicXMLFile;
module.exports.parseMXLFile = parseMXLFile;
module.exports.parseMusicXML = parseMusicXML;
module.exports.parseMXL = parseMXL;