var Chord = require('./chord'),
    Util = require('./util'),
    KeySignature = require('./keysignature'),
    TimeSignature = require('./timeSignature'),
    Note = require('./note');

var Measure = function(json) {
    this.chords = new Array();

    if (json.attributes) {
        if (json.attributes.key) {
            this.keySignature = new KeySignature(parseInt(json.attributes.key.fifths, 10));
        }
        if (json.attributes.time) {
            this.timeSignature = new TimeSignature(json.attributes.time);
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
