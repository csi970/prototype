var Normal = require('./normal');

//Handles cases when single values are not arrays
//Standardizes handling of xml-to-json values
var asArray = function(jsonObj) {
    return Array.isArray(jsonObj) ? jsonObj : new Array(jsonObj);
};

var calculateDifficulty = function(stats, partWise) {
    var range = stats.range;
    var numMeasures = stats.numMeasures || 1;
    var num_metrics = 0;

    // Chords per measure
    var difficulty = stats.numChords / numMeasures / Normal.chords_per_measure;
    num_metrics++;

    // Accidentals per measure
    difficulty += stats.numAccidentals / numMeasures / Normal.accidentals_per_measure;
    num_metrics++;

    if (partWise) {
        // Key signature changes per part
        difficulty += stats.keyChanges / numMeasures / Normal.key_changes_per_measure;
        num_metrics++;

        // Time signature changes per part
        difficulty += stats.timeChanges / numMeasures / Normal.time_changes_per_measure;
        num_metrics++;
    }

    // Range
    if (range.maxPitch && range.minPitch) {
        difficulty += (range.maxPitch.value - range.minPitch.value) / Normal.range;
    }
    num_metrics++;
    
    return difficulty / num_metrics;
};

module.exports.asArray = asArray;
module.exports.calculateDifficulty = calculateDifficulty;
