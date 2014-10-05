var x2j = require('xml-to-json');
var fs = require('fs');

function Part() {
    this.measures = [];
    this.partId = null;
    this.partName = null;
    this.instrument = null;

    this.fromJSON = function(part, partList) {
        this.partId = part['$'].id;

        //Get the part name and the instrument name from the part-list object
        for (var partNum in partList) {
            var currPart = partList[partNum];
            if (this.partId === currPart['$'].id) {
                this.partName = currPart['part-name'];
                this.instrument = currPart['score-instrument']['instrument-name'];
            }
        }

        //Read all measures for the part
        for (var measureNum in part.measure) {
            this.measures.push(new Measure(part.measure[measureNum]));
        }
    };
};

function TimeSignature(json) {
    this.numBeats = parseInt(json.beats, 10);
    this.beatType = parseInt(json['beat-type'], 10);
    //this.tempo = null;
};

function Measure(json) {
    this.notes = new Array();

    if (json.attributes) {
        if (json.attributes.key) {
            this.key = new Key(parseInt(json.attributes.key.fifths, 10));
        }
        if (json.attributes.time) {
            this.timeSignature = new TimeSignature(json.attributes.time);
        }
    }

    for (var noteNum in json.note) {
        this.notes.push(new Note(json.note[noteNum]));
    }
};

function Note(json) {
    this.rest = false;

    if (json.rest !== undefined) {
        this.rest = true;
    } else {
        this.pitch = {
            'step': json.pitch.step,
            'octave': parseInt(json.pitch.octave, 10)
        };
        if (json.pitch.alter) {
            this.pitch.alter = parseInt(json.pitch.alter, 10);
        }
    }

    if (json.accidental) {
        this.accidental = json.accidental;
    }

    this.voice = parseInt(json.voice, 10);

    this.duration = parseInt(json.duration, 10);
    this.type = json.type;
};

function Key(value) {
    this.value = null;
    //this.name = null;
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
    //We could concatinate all the measures from the parts into a single measure object
    //this.measures = null;

    this.fromJSON = function(json) {
        this.raw = json;
        this.parts = [];
        var partList = json['score-partwise']['part-list'];
        var partJSON = [];
        if (typeof json['score-partwise'].part === 'object') {
            partJSON.push(json['score-partwise'].part);
        } else {
            partJSON = json['score-partwise'].part;
        }
        for(var p in partJSON) {
            var tempPart = new Part();
            tempPart.fromJSON(partJSON[p], partList)
            this.parts.push(tempPart);
        }
        //this.measures = this.parts[0].measures;
        // for (var measureNum in this.parts[0].measure) {
        //     this.measures.push(new Measure(this.parts[0].measure[measureNum]));
        // }
    };

    this.getNumMeasures = function(partNum) {
        return this.parts[partNum].measures.length;
    };

    this.getNoteStats = function(partNum) {
        var currMeasure, currNote, measureNum, noteNum, currKey;
        var stats = {
            numNotes: 0,
            numAccidentals: 0
        };

        // loop through each note
        for (measureNum in this.parts[partNum].measures) {
            currMeasure = this.parts[partNum].measures[measureNum];
            
            // see if we have a new key for this measure
            if(currMeasure.key) {
                currKey = currMeasure.key;
            }

            // loop through each note
            for(noteNum in currMeasure.notes) {
                currNote = currMeasure.notes[noteNum];

                // increment total notes
                if(!currNote.rest) {
                    stats.numNotes++;
                }

                // increment accidentals
                if (currNote.accidental) {
                    stats.numAccidentals++;
                }
            }
        }
        return stats;
    };

    this.process = function() {
        // console.log(this.raw);
        // console.log(this.parts);
        // console.log(this.measures);
        // console.log(this.measure[0]);

        //Go through each part (could be multiple) and analyze basic indicators
        for(var p in this.parts) {
            console.log('Part Number: ' + (parseInt(p, 10) + 1));
            console.log('Part Name: ' + this.parts[p].partName);
            console.log('Instrument Name: ' + this.parts[p].instrument);
            var numMeasures = this.getNumMeasures(p);
            console.log('Number of Measures: ' + numMeasures);
            var noteStats = this.getNoteStats(p);
            console.log('Number of Notes: ' + noteStats.numNotes);
            console.log('Average Number of Accidentals Per Measure: ' + (noteStats.numAccidentals/numMeasures).toFixed(2));
            console.log('Average Number of Notes Per Measure: ' + (noteStats.numNotes/numMeasures).toFixed(2));
        }
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
