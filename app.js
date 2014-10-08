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
        this.measures = asArray(part.measure).map(function(value) {
            return new Measure(value);
        });
    };

    this.getNumMeasures = function() {
        return this.measures.length;
    };

    this.getRawStats = function() {
        var currMeasure, currNote, measureNum, noteNum, currKey;
        var stats = {
            numNotes: 0,
            numAccidentals: 0
        };

        // loop through each measure
        for (measureNum in this.measures) {
            currMeasure = this.measures[measureNum];
            
            // see if we have a new key for this measure
            // if(currMeasure.key) {
            //     currKey = currMeasure.key;
            // }

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

    this.notes = asArray(json.note).map(function(value) {
        return new Note(value);
    });
};

function Note(json) {
    this.rest = false;

    if (json.rest !== undefined) {
        this.rest = true;
    }
    if (json.pitch) {
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

        var scorePartwise = json['score-partwise'];
        var partList = asArray(scorePartwise['part-list']['score-part']);
        var partJSON = asArray(scorePartwise.part);

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
            var numMeasures = currPart.getNumMeasures(p);
            console.log('Number of Measures: ' + numMeasures);
            var rawStats = currPart.getRawStats(p);
            console.log('Number of Notes: ' + rawStats.numNotes);
            console.log('Average Number of Accidentals Per Measure: ' + (rawStats.numAccidentals/numMeasures).toFixed(2));
            console.log('Average Number of Notes Per Measure: ' + (rawStats.numNotes/numMeasures).toFixed(2));
        }
        console.log('--------------------------------------');
    };
};

//Handles cases when single values are not arrays
//Standardizes handling of xml-to-json values
function asArray(jsonObj) {
    return Array.isArray(jsonObj) ? jsonObj : new Array(jsonObj);
}

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
