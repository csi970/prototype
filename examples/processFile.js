var music = require('../lib/index.js');

var showPart = function(part) {
    console.log('Part ' + part.partId + ': ' + part.partName + ' - ' + part.instrument);
    var stats = part.getRawStats();
    console.log('    Measures: ' + stats.numMeasures);
    console.log('      Chords: ' + stats.numChords);
    console.log('       Notes: ' + stats.numNotes);
    console.log('       Rests: ' + stats.numRests);
};

music.parseMXLFile('Celtic_Carol.mxl', function(score) {
    score.parts.forEach(showPart);
});

music.parseMusicXMLFile('testScore.xml', function(score) {
    score.parts.forEach(showPart);
});
