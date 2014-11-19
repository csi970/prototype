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
            finalString += ',' + currPart.sections.length;
            finalString += ',' + rawStats.numChords;
            finalString += ',' + rawStats.numRests;
            finalString += ',' + rawStats.numNotes;
            finalString += ',' + rawStats.numAccidentals;
            finalString += ',' + rawStats.numGraceNotes;
            finalString += ',' + rawStats.range.minPitch.value;
            finalString += ',' + rawStats.range.maxPitch.value;
            finalString += ',' + rawStats.totalSound;
            finalString += ',' + rawStats.totalRest;
            finalString += ',' + rawStats.keyChanges;
            finalString += ',' + rawStats.timeChanges;
            finalString += '\n';
        });
        return finalString;
    };

    this.CSVHeader = 'Score File Name,Part Number,Part Name,Instrument Name,Number of Measures,Number of Sections,Number of Chords,Number of Rests,Number of Notes,Number of Accidentals,Number of Grace Notes,Minimum Note Value,Maximum Note Value,Total Sound,Total Rest,Key Signature Changes,Time Signature Changes';
};

module.exports = Score;
