var xml2json = require('xml-to-json');
var Score = require('./models/score');

module.exports.parseMusicXMLFile = function(filename, next) {
    xml2json({
        input: filename,
        output: null
    }, function(err, json) {
        if (err) {
            console.error('Error parsing MusicXML: ' + err);
        } else {
            var s = new Score(json);
            next(s);
        }
    });
};
