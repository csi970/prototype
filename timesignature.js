var TimeSignature = function(json) {
    this.numBeats = parseInt(json.beats, 10);
    this.beatType = parseInt(json['beat-type'], 10);
    //this.tempo = null;
};

TimeSignature.prototype.toString = function() {
    return '' + this.numBeats + '/' + this.beatType;
};

module.exports = TimeSignature;
