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
        // console.log(this.raw);
        // console.log(this.parts);
        // console.log(this.measures);
        // console.log(this.measure[0]);

        //Go through each part (could be multiple) and analyze basic indicators
        for(var p in this.parts) {
            var currPart = this.parts[p];
            console.log('--------------------------------------');
            console.log('Part Number: ' + (parseInt(p, 10) + 1));
            console.log('Part Name: ' + currPart.partName);
            console.log('Instrument Name: ' + currPart.instrument);
            // var numMeasures = currPart.getNumMeasures(p);
            // console.log('Number of Measures: ' + numMeasures);
            var rawStats = currPart.getRawStats();
            console.log(rawStats);
            // console.log('Number of Notes: ' + rawStats.numNotes);
            console.log('Average Number of Accidentals Per Measure: ' + (rawStats.numAccidentals / rawStats.numMeasures).toFixed(2));
            console.log('Average Number of Chords Per Measure: ' + (rawStats.numChords / rawStats.numMeasures).toFixed(2));
            console.log('Average Number of Notes Per Chord: ' + (rawStats.numNotes / rawStats.numChords).toFixed(2));
            console.log('Range: ' + rawStats.range.minPitch + ' to ' + rawStats.range.maxPitch);
            console.log('Key Signature Usage Percentages:');
            for(var keyId in rawStats.keyUsage) {
                console.log('  ' + keyId + '\t' + ((rawStats.keyUsage[keyId]/rawStats.numMeasures) * 100).toFixed(2) + '%');
            }
            console.log('Time Signature Usage Percentages:');
            for(var timeId in rawStats.timeSigUsage) {
                console.log('  ' + timeId + '\t' + ((rawStats.timeSigUsage[timeId]/rawStats.numMeasures) * 100).toFixed(2) + '%');
            }

            console.log('Average note duration: ' + rawStats.totalSound / rawStats.numNotes + ' quarter notes');

            console.log('Difficulty: ' + currPart.getDifficulty());
            console.log('Measure Difficulties:');
            currPart.generateMeasureHeatMap();
            currPart.generateSectionHeatMap();
        }
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
