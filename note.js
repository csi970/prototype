var Pitch = require('./pitch');

var Note = function(json) {
    this.rest = false;
    this.grace = false;
    this.cue = false;
    this.voice = parseInt(json.voice, 10);
    this.duration = parseInt(json.duration, 10);
    this.noteType = json.type;
    
    if (json.rest !== undefined) {
        this.rest = true;
    }

    if (json.cue !== undefined) {
        this.cue = true;
    }

    if (json.pitch) {
        this.pitch = new Pitch(json.pitch);
    }

    if (json.accidental) {
        this.accidental = json.accidental;
    }

    if (json.grace) {
        this.grace = true;
    }
};

module.exports = Note;
