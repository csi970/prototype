var x2j = require('xml-to-json');
var fs = require('fs');

var Score = require('./score');

x2j({
    input: 'reunion.xml',
    output: null
}, function(err, json) {
    if (err) {
        console.error('Error parsing MusicXML: ' + err);
    } else {
        var s = new Score();
        s.fromJSON(json);
        s.process();
    }
});
