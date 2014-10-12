var xml2json = require('xml-to-json');

var Score = require('./score');

var file = process.argv[2] || 'testScore.xml';

xml2json({
    input: file,
    output: null
}, function(err, json) {
    if (err) {
        console.error('Error parsing MusicXML: ' + err);
    } else {
        var s = new Score(json);
        s.process();
    }
});
