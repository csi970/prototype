// This object defines values for a piece of typical difficulty.
// The values can be tweaked to adjust the relative difficulty of a Part.
var normal = {
    chords_per_measure: 6,
    accidentals_per_measure: 1/5,
    range: 20,
    time_changes_per_measure: 1/20,
    key_changes_per_measure: 1/10
};

module.exports = normal;
