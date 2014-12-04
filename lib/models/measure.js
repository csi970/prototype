var Chord = require('./chord'),
    Util = require('../util'),
    KeySignature = require('./keysignature'),
    TimeSignature = require('./timesignature'),
    Note = require('./note');

var Measure = function(json, previousValues) {
    this.chords = [];
    this.divisions = previousValues.divisions;
    this.keySignature = previousValues.key;
    this.timeSignature = previousValues.time;
    this.leftBarline = null;
    this.rightBarline = null;
    this.measureStats = {
        numAccidentals: 0,
        numGraceNotes: 0,
        numRests: 0,
        numChords: 0,
        numNotes: 0,
        noteLength: 0,
        restLength: 0,
        range: {}
    };

    // Fill in attributes if we can
    if (json.attributes) {

        // Key signature
        if (json.attributes.key) {
            this.keySignature = new KeySignature(parseInt(json.attributes.key.fifths, 10));
        }

        // Time signature
        if (json.attributes.time) {
            this.timeSignature = new TimeSignature(json.attributes.time);
        }

        // Divisions
        if (json.attributes.divisions) {
            this.divisions = parseInt(json.attributes.divisions,10);
        }
    }

    if (json.barline && json.barline['bar-style']) {
        if (json.barline.location === 'right') {
            this.rightBarline = json.barline['bar-style'];
        } else {
            this.leftBarline = json.barline['bar-style'];
        }
    }

    if (json.note !== undefined) {

        Util.asArray(json.note).map(function(value, index) {
            var nt = new Note(value),
                ch;
            if (value.chord === undefined) {
                ch = new Chord();
                if (nt.accidental) {
                    this.measureStats.numAccidentals++;
                }
                if (nt.grace) {
                    this.measureStats.numGraceNotes++;
                }
                ch.addNote(nt);
                if (ch.rest) {
                    this.measureStats.numRests++;
                    this.measureStats.restLength += (nt.grace ? 0 : nt.duration / this.divisions);
                } else if (!ch.cue) {
                    this.measureStats.numNotes++;
                    this.measureStats.noteLength += (nt.grace ? 0 : nt.duration / this.divisions);
                }
                this.chords.push(ch);
            } else {
                //Add the current note to the last chord encountered
                if (nt.accidental) {
                    this.measureStats.numAccidentals++;
                }
                if (nt.grace) {
                    this.measureStats.numGraceNotes++;
                }
                this.measureStats.numNotes++;
                this.chords[this.chords.length - 1].addNote(nt);
            }
        }, this);
    }
    
    this.measureStats.numChords += this.chords.length - this.measureStats.numRests;

    var minPitch = null;
    var maxPitch = null;
    this.chords.forEach(function(chord) {
        if (chord.rest) {
            return;
        }
        var highNote = chord.highestNote(),
            lowNote = chord.lowestNote();
        if (!minPitch || lowNote.pitch.value < minPitch.value) {
            minPitch = lowNote.pitch;
        }
        if (!maxPitch || highNote.pitch.value > maxPitch.value) {
            maxPitch = highNote.pitch;
        }
    });

    this.measureStats.range.maxPitch = maxPitch;
    this.measureStats.range.minPitch = minPitch;

    this.getDifficulty = function() {
        return Util.calculateDifficulty(this.measureStats, false);
    };
};

module.exports = Measure;
