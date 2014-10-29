var Pitch = require('./pitch'),
    Util = require('./util'),
    Normal = require('./normal'),
    Measure = require('./measure');

var Part = function Part(part, partList) {
    this.calculatedStats = null;
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
    var prevDivisions = null;
    this.measures = Util.asArray(part.measure).map(function(value) {
        var meas = new Measure(value, prevDivisions);
        if (meas.divisions) {
            prevDivisions = meas.divisions;
        }
        return meas;
    });

    this.getNumMeasures = function() {
        return this.measures.length;
    };

    this.getRawStats = function() {
        if (this.calculatedStats) {
            return this.calculatedStats;
        }
        var currMeasure,
            currNote,
            measureNum,
            chordNum,
            currKey,
            currTime,
            currMeasureStats;

        var stats = {
            numRests: 0,

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

            // Sum of the durations of all the rests, in quarter notes
            totalRest: 0,

            // Distance between highest and lowest note
            range: this.getRange()
        };

        // loop through each measure
        for (measureNum in this.measures) {
            currMeasure = this.measures[measureNum];
            currMeasureStats = currMeasure.measureStats;

            // Increment total chords, rests, notes
            stats.numChords += currMeasureStats.numChords;
            stats.numRests += currMeasureStats.numRests;
            stats.numNotes += currMeasureStats.numNotes;
            stats.numGraceNotes += currMeasureStats.numGraceNotes;
            stats.numAccidentals += currMeasureStats.numAccidentals;
            stats.totalSound += currMeasureStats.noteLength;
            stats.totalRest += currMeasureStats.restLength;
            
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
        }
        this.calculatedStats = stats;
        return this.calculatedStats;
    };

    this.generateMeasureHeatMap = function() {
        var partStats = this.getRawStats(),
            measureDifficulties = [],
            partDifficulty;

        partDifficulty = Util.calculateDifficulty(partStats, true);

        // loop through each measure
        for (measureNum in this.measures) {
            currMeasure = this.measures[measureNum];
            currMeasureStats = currMeasure.measureStats;
            measureDifficulties.push(Util.calculateDifficulty(currMeasureStats, false));
        }

        // Standard deviation and then label each measure according to # of standard deviations away

        console.log(measureDifficulties);
    };

    this.getDifficulty = function() {
        // var stats = this.getRawStats();
        // var range = stats.range;
        // var numMeasures = stats.numMeasures;
        // var num_metrics = 0;

        // // Notes per measure
        // var difficulty = stats.numNotes / numMeasures / Normal.notes_per_measure;
        // num_metrics++;

        // // Accidentals per measure
        // difficulty += stats.numAccidentals / numMeasures / Normal.accidentals_per_measure;
        // num_metrics++;

        // // Key signature changes per part
        // difficulty += stats.keyChanges / numMeasures / Normal.key_changes_per_measure;
        // num_metrics++;

        // // Time signature changes per part
        // difficulty += stats.timeChanges / numMeasures / Normal.time_changes_per_measure;
        // num_metrics++;

        // // Range
        // difficulty += (range.maxPitch.value - range.minPitch.value) / Normal.range;
        // num_metrics++;
        
        // return difficulty / num_metrics;
        var difficulty = Util.calculateDifficulty(this.getRawStats(), true);
        return difficulty;
    };

    this.getRange = function() {
        var minPitch = new Pitch({'step': 'B', 'octave': 20});
        var maxPitch = new Pitch({'step': 'C', 'octave': -20});
        this.measures.forEach(function(measureValue) {
            measureValue.chords.forEach(function(chordValue) {
                if (chordValue.rest) {
                    return;
                }
                var highNote = chordValue.highestNote(),
                    lowNote = chordValue.lowestNote();
                if (lowNote.pitch.value < minPitch.value) {
                    minPitch = lowNote.pitch;
                }
                if (highNote.pitch.value > maxPitch.value) {
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
