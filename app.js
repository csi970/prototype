var x2j = require('xml-to-json');
var fs = require('fs');

//TODO: Make Note object/function

function Key(value) {
    this.value = null;
    this.name = null;
    this.accidentals = [];
    this.accidentalDirection = 0;


    var sharpSequence = 'FCGDAEB';
    var flatSequence = 'BEADGCF';

    this.value = value;
    if (value < 0) {
        this.accidentalDirection = -1;
        this.accidentals = flatSequence.substring(0, -value).split('');
    } else if (value > 0) {
        this.accidentalDirection = 1;
        this.accidentals = sharpSequence.substring(0, value).split('');
    }
};

function Score() {
    this.raw = null;
    this.parts = null;
    this.measures = null;

    this.fromJSON = function(json) {
        this.raw = json;
        this.parts = json['score-partwise'].part;
        this.measures = this.parts.measure;
    };

    this.getNumMeasures = function() {
        return this.measures.length;
    };

    this.getNoteStats = function() {
        var currMeasure, currNote, measureNum, noteNum, currKey;
        var stats = {
            numNotes: 0,
            numAccidentals: 0
        };

        // loop through each note
        for (measureNum in this.measures) {
            currMeasure = this.measures[measureNum];
            
            // see if we have a new key for this measure
            if(currMeasure.attributes && currMeasure.attributes.key && currMeasure.attributes.key.fifths) {
                currKey = new Key(currMeasure.attributes.key.fifths);
            }

            // loop through each note
            for(noteNum in currMeasure.note) {
                currNote = currMeasure.note[noteNum];

                // increment total notes
                if(currNote.rest === undefined) {
                    stats.numNotes++;
                }

                // increment accidentals
                if (currNote.accidental !== undefined) {
                    stats.numAccidentals++;
                }
            }
        }
        return stats;
    }

    this.process = function() {
        // console.log(this.raw);
        // console.log(this.parts);
        // console.log(this.measures);
        // console.log(this.measure[0]);
        var numMeasures = this.getNumMeasures();
        console.log('Number of Measures: ' + numMeasures);
        var noteStats = this.getNoteStats();
        console.log('Number of Notes: ' + noteStats.numNotes);
        console.log('Average Number of Accidentals Per Measure: ' + (noteStats.numAccidentals/numMeasures).toFixed(2));
        console.log('Average Number of Notes Per Measure: ' + (noteStats.numNotes/numMeasures).toFixed(2));
    };
};

(function() {
    x2j({
        input: 'score.xml',
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
})();
