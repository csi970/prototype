var Pitch = require('./pitch'),
    Util = require('./util'),
    Normal = require('./normal'),
    Measure = require('./measure');

var Part = function Part() {
    this.measures = [];
    this.partId = null;
    this.partName = null;
    this.instrument = null;

    this.fromJSON = function(part, partList) {
        this.partId = part['$'].id;

        //Get the part name and the instrument name from the part-list object
        for (var partNum in partList) {
            var currPart = partList[partNum];
            if (this.partId === currPart['$'].id) {
                this.partName = currPart['part-name'];
                this.instrument = currPart['score-instrument']['instrument-name'];
            }
        }

        //Read all measures for the part
        this.measures = Util.asArray(part.measure).map(function(value) {
            return new Measure(value);
        });
    };

    this.getNumMeasures = function() {
        return this.measures.length;
    };

    this.getRawStats = function() {
        var currMeasure, currNote, measureNum, noteNum, currKey, currTime;
        var stats = {
            numChords: 0,
            numNotes: 0,
            numAccidentals: 0,
            numMeasures: this.getNumMeasures(),
            keyUsage: [],
            keyChanges: 0,
            timeSigUsage: [],
            timeChanges: 0,
            range: this.getRange()
        };

        // loop through each measure
        for (measureNum in this.measures) {
            currMeasure = this.measures[measureNum];
            
            // see if we have a new key for this measure
            if (currMeasure.key) {
                currKey = currMeasure.key;
                stats.keyChanges++;
            }
            if (stats.keyUsage[currKey]) {
                stats.keyUsage[currKey]++;
            } else {
                stats.keyUsage[currKey] = 1;
            }

            // see if we have a new time signature for this measure
            if (currMeasure.timeSignature) {
                currTime = currMeasure.timeSignature;
                stats.timeChanges++;
            }
            if (stats.timeSigUsage[currTime]) {
                stats.timeSigUsage[currTime]++;
            } else {
                stats.timeSigUsage[currTime] = 1;
            }

            // loop through each note
            for(chordNum in currMeasure.chords) {
                currChord = currMeasure.chords[chordNum];

                // increment total notes
                if(!currChord.rest) {
                    stats.numChords++;
                    currChord.notes.map(function (noteValue) {
                        if (noteValue.accidental) {
                            stats.numAccidentals++;
                        }
                    });
                    stats.numNotes += currChord.notes.length;
                }
            }
        }
        return stats;
    };

    this.getDifficulty = function() {
        var stats = this.getRawStats();
        var range = stats.range;
        var numMeasures = stats.numMeasures;
        var num_metrics = 0;

        // Notes per measure
        var difficulty = stats.numNotes / numMeasures / Normal.notes_per_measure;
        num_metrics++;

        // Accidentals per measure
        difficulty += stats.numAccidentals / numMeasures / Normal.accidentals_per_measure;
        num_metrics++;

        // Key signature changes per part
        difficulty += stats.keyChanges / Normal.key_changes_per_part;
        num_metrics++;

        // Time signature changes per part
        difficulty += stats.timeChanges / Normal.time_changes_per_part;
        num_metrics++;

        // Range
        difficulty += (range.maxPitch.value - range.minPitch.value) / Normal.range_per_part;
        num_metrics++;
        
        return difficulty / num_metrics;
    };

    this.getRange = function() {
        var minPitch = new Pitch({'step': 'B', 'octave': 20});
        var maxPitch = new Pitch({'step': 'C', 'octave': -20});
        this.measures.map(function(measureValue) {
            measureValue.chords.forEach(function(chordValue) {
                var highNote = chordValue.highestNote(),
                    lowNote = chordValue.lowestNote();
                if (lowNote.pitch && lowNote.pitch.value < minPitch.value) {
                    minPitch = lowNote.pitch;
                }
                if (highNote.pitch && highNote.pitch.value > maxPitch.value) {
                    maxPitch = highNote.pitch;
                }
            });
        });
        return {
            'minPitch': minPitch,
            'maxPitch': maxPitch
        };
    };
};

module.exports = Part;
