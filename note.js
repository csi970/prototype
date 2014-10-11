var Pitch = require('./pitch');

var Note = function(json) {
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

module.exports = Note;
