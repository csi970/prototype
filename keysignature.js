var Key = function Key(value) {
    this.value = null;
    //this.name = null;
    this.accidentals = [];
    this.accidentalDirection = 0;

    var sharpSequence = 'FCGDAEB';
    var flatSequence = 'BEADGCF';

    this.value = parseInt(value, 10);
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
        return '' + -this.value + ' Flat';
    } else {
        return '' + this.value + ' Sharp';
    }
};

module.exports = Key;