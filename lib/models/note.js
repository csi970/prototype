var Pitch = require('./pitch');

var Note = function(json) {
    this.rest = false;
    this.grace = false;
    this.cue = false;
    this.voice = 0;
    this.duration = 0;
    this.noteType = '';
    this.pitch = null;
    
    if (json !== undefined) {
        if (json.voice !== undefined) {
            this.voice = parseInt(json.voice, 10);
        }

        if (json.duration !== undefined) {
            this.duration = parseInt(json.duration, 10);
        }

        if (json.type !== undefined) {
            this.noteType = json.type;
        }

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

        if (json.grace !== undefined) {
            this.grace = true;
            this.duration = 0;
        }
    }
};

module.exports = Note;
