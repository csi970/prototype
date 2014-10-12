var Chord = require('./chord'),
    Util = require('./util'),
    KeySignature = require('./keysignature'),
    TimeSignature = require('./timeSignature'),
    Note = require('./note');

var Measure = function(json) {
    this.chords = new Array();
    this.divisions = null;
    this.keySignature = null;
    this.timeSignature = null;

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
            this.divisions = json.attributes.divisions;
        }
    }

    Util.asArray(json.note).map(function(value, index) {
        if (value.chord === undefined) {
            var ch = new Chord();
            ch.addNote(new Note(value));
            this.chords.push(ch);
        } else {
            //Add the current note to the last chord encountered
            this.chords[this.chords.length - 1].addNote(new Note(value));
        }
    }, this);
};

module.exports = Measure;
