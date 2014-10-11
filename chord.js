var Chord = function Chord() {
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

module.exports = Chord;