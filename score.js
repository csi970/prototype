var Util = require('./util'),
    Part = require('./part');

var Score = function() {
    this.raw = null;
    this.parts = null;
    //We could concatinate all the measures from the parts into a single measure object
    //this.measures = null;

    this.fromJSON = function(json) {
        this.raw = json;
        this.parts = [];

        var scorePartwise = json['score-partwise'];
        var partList = Util.asArray(scorePartwise['part-list']['score-part']);
        var partJSON = Util.asArray(scorePartwise.part);

        this.parts = partJSON.map(function(value, index) {
            var tempPart = new Part();
            tempPart.fromJSON(value, partList);
            return tempPart;
        });
        
        //this.measures = this.parts[0].measures;
        // for (var measureNum in this.parts[0].measure) {
        //     this.measures.push(new Measure(this.parts[0].measure[measureNum]));
        // }
    };

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
            console.log('Average Number of Notes Per Measure: ' + (rawStats.numNotes / rawStats.numMeasures).toFixed(2));
            console.log('Average Number of Notes Per Chord: ' + (rawStats.numNotes / rawStats.numChords).toFixed(2));
            var range = currPart.getRange();
            // console.log('Range: ' + range.minPitch + ' to ' + range.maxPitch);
            console.log('Key Signature Usage Percentages:');
            for(var keyId in rawStats.keyUsage) {
                console.log('  ' + keyId + '\t' + ((rawStats.keyUsage[keyId]/rawStats.numMeasures) * 100).toFixed(2) + '%');
            }
            console.log('Time Signature Usage Percentages:');
            for(var timeId in rawStats.timeSigUsage) {
                console.log('  ' + timeId + '\t' + ((rawStats.timeSigUsage[timeId]/rawStats.numMeasures) * 100).toFixed(2) + '%');
            }

            console.log('Difficulty: ' + currPart.getDifficulty());
        }
        console.log('--------------------------------------');
    };
};

module.exports = Score;
