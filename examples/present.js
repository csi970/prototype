var music = require('../lib/index.js');

music.parseMusicXMLFile('43_Clavierstucke.xml', function(score) {
    score.process();
});