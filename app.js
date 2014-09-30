var mj = require('musicjson');
var fs = require('fs');

var processScore = function(data) {
    console.log('Processing score...');
};

(function() {
    fs.readFile('score.xml', function(err, data) {
        // check for read error
        if (err) {
            console.log('Error reading file: ' + err);
        } else {
            // parse MusicXML
            mj.musicJSON(data, function(err, json) {
                if (err) {
                    console.log('Error parsing MusicXML: ' + err);
                } else {
                    processScore(json);
                }
            });
        }
    });
})();
