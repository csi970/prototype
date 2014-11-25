var music = require('../lib/index.js');

music.parseMusicXMLFile('testScore.xml', function(score) {
    score.parts.forEach(function(part) {
        console.log(part.getRawStats());
    });
});
