var x2j = require('xml-to-json');
var fs = require('fs');

var Normal = {
    notes_per_measure: 6,
    accidentals_per_measure: 0.4,
    range_per_part: 20,
    time_changes_per_part: 1,
    key_changes_per_part: 1
};

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
        var currMeasure, currNote, measureNum, noteNum, currKey, currTime;
        var stats = {
            numChords: 0,
            numNotes: 0,
            numAccidentals: 0,
            numMeasures: this.getNumMeasures(),
            keyUsage: [],
            keyChanges: 0,
            timeSigUsage: [],
            timeChanges: 0,
            range: this.getRange()
        };

        // loop through each measure
        for (measureNum in this.measures) {
            currMeasure = this.measures[measureNum];
            
            // see if we have a new key for this measure
            if (currMeasure.key) {
                currKey = currMeasure.key;
                stats.keyChanges++;
            }
            if (stats.keyUsage[currKey]) {
                stats.keyUsage[currKey]++;
            } else {
                stats.keyUsage[currKey] = 1;
            }

            // see if we have a new time signature for this measure
            if (currMeasure.timeSignature) {
                currTime = currMeasure.timeSignature;
                stats.timeChanges++;
            }
            if (stats.timeSigUsage[currTime]) {
                stats.timeSigUsage[currTime]++;
            } else {
                stats.timeSigUsage[currTime] = 1;
            }

            // loop through each note
            for(chordNum in currMeasure.chords) {
                currChord = currMeasure.chords[chordNum];

                // increment total notes
                if(!currChord.rest) {
                    stats.numChords++;
                    currChord.notes.map(function (noteValue) {
                        if (noteValue.accidental) {
                            stats.numAccidentals++;
                        }
                    });
                    stats.numNotes += currChord.notes.length;
                }
            }
        }
        return stats;
    };

    this.getDifficulty = function() {
        var stats = this.getRawStats();
        var range = stats.range;
        var numMeasures = stats.numMeasures;
        var num_metrics = 0;

        // Notes per measure
        var difficulty = stats.numNotes / numMeasures / Normal.notes_per_measure;
        num_metrics++;

        // Accidentals per measure
        difficulty += stats.numAccidentals / numMeasures / Normal.accidentals_per_measure;
        num_metrics++;

        // Key signature changes per part
        difficulty += stats.keyChanges / Normal.key_changes_per_part;
        num_metrics++;

        // Time signature changes per part
        difficulty += stats.timeChanges / Normal.time_changes_per_part;
        num_metrics++;

        // Range
        difficulty += (range.maxPitch.value - range.minPitch.value) / Normal.range_per_part;
        num_metrics++;
        
        return difficulty / num_metrics;
    };

    this.getRange = function() {
        var minPitch = new Pitch({'step': 'B', 'octave': 20});
        var maxPitch = new Pitch({'step': 'C', 'octave': -20});
        this.measures.map(function(measureValue) {
            measureValue.chords.forEach(function(chordValue) {
                var highNote = chordValue.highestNote(),
                    lowNote = chordValue.lowestNote();
                if (lowNote.pitch && lowNote.pitch.value < minPitch.value) {
                    minPitch = lowNote.pitch;
                }
                if (highNote.pitch && highNote.pitch.value > maxPitch.value) {
                    maxPitch = highNote.pitch;
                }
            });
        });
        return {
            'minPitch': minPitch,
            'maxPitch': maxPitch
        };
    };
};

function TimeSignature(json) {
    this.numBeats = parseInt(json.beats, 10);
    this.beatType = parseInt(json['beat-type'], 10);
    //this.tempo = null;
};

TimeSignature.prototype.toString = function() {
    return '' + this.numBeats + '/' + this.beatType;
};

function Measure(json) {
    this.chords = new Array();

    if (json.attributes) {
        if (json.attributes.key) {
            this.key = new Key(parseInt(json.attributes.key.fifths, 10));
        }
        if (json.attributes.time) {
            this.timeSignature = new TimeSignature(json.attributes.time);
        }
    }

    asArray(json.note).map(function(value, index) {
        if (value.chord === undefined) {
            var ch = new Chord();
            ch.addNote(new Note(value));
            this.chords.push(ch);
        } else {
            //Add the current note to the last chord encountered
            this.chords[this.chords.length - 1].addNote(new Note(json.note));
        }
    }, this);
};

function Chord() {
    this.notes = [];
    this.rest = false;

    this.addNote = function(note) {
        this.notes.push(note);
        if (note.rest) {
            this.rest = true;
        } else {
            this.notes.sort(function (a, b) {
                return a.value - b.value;
            });
        }
        return this;
    };

    this.getRange = function() {
        return this.highestNote().value - this.lowestNote().value;
    };

    this.lowestNote = function() {
        return this.notes[0];
    };

    this.highestNote = function() {
        return this.notes[this.notes.length - 1];
    }
}

function Note(json) {
    this.rest = false;

    if (json.rest !== undefined) {
        this.rest = true;
    }
    if (json.pitch) {
        this.pitch = new Pitch(json.pitch);
    }

    if (json.accidental) {
        this.accidental = json.accidental;
    }

    this.voice = parseInt(json.voice, 10);

    this.duration = parseInt(json.duration, 10);
    this.noteType = json.type;
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

Key.prototype.toString = function() {
    if (this.value === 0) {
        return 'Natural';
    } else if (this.value < 0) {
        return '' + -parseInt(this.value, 10) + ' Flat';
    } else {
        return '' + parseInt(this.value, 10) + ' Sharp';
    }
};

function Pitch(jsonValue) {
    var noteNums = 'C.D.EF.G.A.B';
    this.stepLetter = jsonValue.step;
    this.step = noteNums.indexOf(this.stepLetter);
    this.octave = parseInt(jsonValue.octave, 10);
    this.value = this.octave * 12 + this.step;

    if (jsonValue.alter) {
        this.alter = parseInt(jsonValue.alter, 10);
        this.value += this.alter;
    }
};

Pitch.prototype.toString = function() {
    var returnString = this.stepLetter;
    if (this.alter) {
        returnString += ' ' + (this.alter === 1 ? 'Sharp' : 'Flat');
    }
    returnString += this.octave;
    return returnString;
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

//Handles cases when single values are not arrays
//Standardizes handling of xml-to-json values
function asArray(jsonObj) {
    return Array.isArray(jsonObj) ? jsonObj : new Array(jsonObj);
}

(function() {
    x2j({
        input: 'multipartscore.xml',
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
