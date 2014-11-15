var Util = require('./util'),
    Part = require('./part');

var Score = function(json) {
    this.raw = json;
    this.parts = [];

    var scorePartwise = json['score-partwise'];
    var partList = Util.asArray(scorePartwise['part-list']['score-part']);
    var partJSON = Util.asArray(scorePartwise.part);

    this.parts = partJSON.map(function(value, index) {
        var tempPart = new Part(value, partList);
        return tempPart;
    });

    this.process = function() {
        //Go through each part and analyze basic indicators
        this.parts.forEach(function(part) {
            console.log('--------------------------------------');
            part.processToConsole();
        });
        console.log('--------------------------------------');
    };

    this.processToCSVString = function(fileName) {
        var finalString = '',
            cleanedFileName = fileName.replace(/,/g, '').replace(/.xml/g, '').replace(/_/g, ' ');
        this.parts.forEach(function (currPart, partIndex) {
            var rawStats = currPart.getRawStats();
            finalString += cleanedFileName;
            finalString += ',' + (partIndex + 1);
            finalString += ',' + currPart.partName;
            finalString += ',' + currPart.instrument;
            finalString += ',' + rawStats.numMeasures;
            finalString += ',' + rawStats.numChords;
            finalString += ',' + rawStats.numNotes;
            finalString += ',' + rawStats.numAccidentals;
            finalString += ',' + rawStats.numGraceNotes;
            finalString += ',' + rawStats.range.minPitch;
            finalString += ',' + rawStats.range.maxPitch;
            finalString += ',' + rawStats.totalSound;
            finalString += '\n';
        });
        return finalString;
    };

    this.CSVHeader = 'Score File Name,Part Number,Part Name,Instrument Name,Number of Measures,Number of Chords,Number of Notes,Number of Accidentals,Number of Grace Notes,Minimum Note,Maximum Note,Total Sound';
};

module.exports = Score;
