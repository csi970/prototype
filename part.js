var Pitch = require('./pitch'),
    Util = require('./util'),
    Normal = require('./normal'),
    Measure = require('./measure');

var Part = function Part(part, partList) {
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

    this.getNumMeasures = function() {
        return this.measures.length;
    };

    this.getRawStats = function() {
        var currMeasure,
            currNote,
            measureNum,
            chordNum,
            currKey,
            currDivisions,
            currTime;

        var stats = {
            // This stores the number of chords (which may contain multiple notes)
            numChords: 0,

            // Notes are the individual heads; multiple may construe a chord
            numNotes: 0,

            // Number of accidentals WITH MARKINGS
            // Using an accidental of the same pitch twice in a measure
            // will only increment this once.
            numAccidentals: 0,

            // A count of the number of grace notes
            numGraceNotes: 0,

            // Number of measures in the part
            numMeasures: this.getNumMeasures(),

            // Usage percent for each key
            keyUsage: [],

            // Number of times the key changes
            keyChanges: 0,

            // Usage percent for each time signature
            timeSigUsage: [],

            // Number of times the time signature changes
            timeChanges: 0,

            // Sum of the durations of all the notes, in quarter notes
            totalSound: 0,

            // Distance between highest and lowest note
            range: this.getRange()
        };

        // loop through each measure
        for (measureNum in this.measures) {
            currMeasure = this.measures[measureNum];
            
            // see if we have a new key for this measure
            if (currMeasure.keySignature) {
                currKey = currMeasure.keySignature;
                stats.keyChanges++;
            }

            // Increment the usage for the current key
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

            // increment the usage for the current time signature
            if (stats.timeSigUsage[currTime]) {
                stats.timeSigUsage[currTime]++;
            } else {
                stats.timeSigUsage[currTime] = 1;
            }

            // see if we have a new division for this measure
            if (currMeasure.divisions) {
                currDivisions = currMeasure.divisions;
            }

            // loop through each note
            for(chordNum in currMeasure.chords) {
                currChord = currMeasure.chords[chordNum];

                // Only process non-rests (notes)
                if(!currChord.rest) {

                    // Increment total chords
                    stats.numChords++;

                    // Apply to each note
                    currChord.notes.map(function (noteValue) {

                        // Increment accidentals if appropriate
                        if (noteValue.accidental) {
                            stats.numAccidentals++;
                        }

                        // Increment grace notes if appropriate
                        if (noteValue.grace) {
                            stats.numGraceNotes++;
                        }

                        // Increment total playing time
                        stats.totalSound += noteValue.duration / currDivisions;

                    });

                    // Increment total notes
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
        difficulty += stats.keyChanges / numMeasures / Normal.key_changes_per_measure;
        num_metrics++;

        // Time signature changes per part
        difficulty += stats.timeChanges / numMeasures / Normal.time_changes_per_measure;
        num_metrics++;

        // Range
        difficulty += (range.maxPitch.value - range.minPitch.value) / Normal.range;
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
