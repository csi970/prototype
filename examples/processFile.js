var music = require('../lib/index.js');

music.parseMXLFile('Chariots_of_Fire.mxl', function(score) {
    score.parts.forEach(function(part) {
        console.log(part.getRawStats());
    });
});

music.parseMusicXMLFile('testScore.xml', function(score) {
    score.parts.forEach(function(part) {
        console.log(part.getRawStats());
    });
});
