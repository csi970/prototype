var Pitch = function Pitch(jsonValue) {
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
        returnString += ' ' + (this.alter === 1 ? 'Sharp ' : 'Flat ');
    }
    returnString += this.octave;
    return returnString;
};

module.exports = Pitch;
