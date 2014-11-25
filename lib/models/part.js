var Util = require('../util'),
    Measure = require('./measure'),
    Section = require('./section'),
    numbers = require('numbers');

var Part = function Part(part, partList) {
    this.calculatedStats = null;
    this.partId = part.id;

    //Get the part name and the instrument name from the part-list object
    for (var partNum in partList) {
        var currPart = partList[partNum];
        if (this.partId === currPart.id) {
            this.partName = currPart['part-name'];
            this.instrument = currPart['score-instrument']['instrument-name'];
        }
    }

    //Read all measures for the part
    var prevValues = {
        divisions: null,
        key: null,
        time: null
    };
    
    var firstSection = new Section(),
        tempSections = [firstSection];
    this.measures = Util.asArray(part.measure).map(function(value, index) {
        var meas = new Measure(value, prevValues),
            section;
        if (meas.divisions !== prevValues.divisions) {
            prevValues.divisions = meas.divisions;
        }
        if (meas.keySignature !== prevValues.key) {
            prevValues.key = meas.keySignature;
        }
        if (meas.timeSignature !== prevValues.time) {
            prevValues.time = meas.timeSignature;
        }

        if (meas.leftBarline) {
            section = new Section();
            tempSections.push(section);
        }
        tempSections[tempSections.length - 1].addMeasure(meas, index);
        if (meas.rightBarline) {
            section = new Section();
            tempSections.push(section);
        }
        return meas;
    });

    this.sections = tempSections.filter(function (currSection) {
        return currSection.getLength() > 0;
    });

    this.getNumMeasures = function() {
        return this.measures.length;
    };

    this.getRawStats = function() {
        if (this.calculatedStats) {
            return this.calculatedStats;
        }
        var currKey = this.measures[0].keySignature,
            currTime = this.measures[0].timeSignature,
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
        this.measures.forEach(function (currMeasure) {
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
            if (currMeasure.keySignature !== currKey) {
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
            if (currMeasure.timeSignature !== currTime) {
                currTime = currMeasure.timeSignature;
                stats.timeChanges++;
            }

            // increment the usage for the current time signature
            if (stats.timeSigUsage[currTime]) {
                stats.timeSigUsage[currTime]++;
            } else {
                stats.timeSigUsage[currTime] = 1;
            }
        });
        this.calculatedStats = stats;
        return this.calculatedStats;
    };

    this.generateSectionHeatMap = function() {
        var sectionDifficulties = [];

        sectionDifficulties = this.sections.map(function (section) {
            return section.getDifficulty();
        });

        return sectionDifficulties;
    };

    this.generateMeasureHeatMap = function(sectionNumber) {
        var measureDifficulties = [],
            measureDeviance = [],
            selectedMeasures,
            averageDifficulty,
            halfSD;

        if (isNaN(sectionNumber)) {
            selectedMeasures = this.measures;
        } else {
            selectedMeasures = this.sections[sectionNumber].measures;
        }

        // loop through each measure
        measureDifficulties = selectedMeasures.map(function (currMeasure) {
            return currMeasure.getDifficulty();
        });

        averageDifficulty = numbers.statistic.mean(measureDifficulties);
        halfSD = numbers.statistic.standardDev(measureDifficulties)/2;

        measureDeviance = measureDifficulties.map(function(value) {
            if (value > (averageDifficulty + halfSD)) {
                return "harder";
            } else if (value < (averageDifficulty - halfSD)) {
                return "easier";
            } else {
                return "average";
            }
        });

        return {
            difficulty: measureDifficulties,
            deviation: measureDeviance
        };
    };

    this.getDifficulty = function() {
        return Util.calculateDifficulty(this.getRawStats(), true);
    };

    this.getRange = function() {
        var minPitch = null;
        var maxPitch = null;

        this.sections.forEach(function(section) {
            var sectionRange = section.sectionStats.range;
            if (sectionRange.maxPitch && sectionRange.minPitch) {
                if (!maxPitch ||
                    sectionRange.maxPitch.value > maxPitch.value) {
                    maxPitch = sectionRange.maxPitch;
                }
                if (!minPitch ||
                    sectionRange.minPitch.value < minPitch.value) {
                    minPitch = sectionRange.minPitch;
                }
            }
        });

        return {
            'minPitch': minPitch,
            'maxPitch': maxPitch
        };
    };

    this.processToConsole = function() {
        console.log('Part Name: ' + this.partName);
        console.log('Instrument Name: ' + this.instrument);

        var rawStats = this.getRawStats();
        console.log(rawStats);

        console.log('Average Number of Accidentals Per Measure: ' + (rawStats.numAccidentals / rawStats.numMeasures).toFixed(2));
        console.log('Average Number of Chords Per Measure: ' + (rawStats.numChords / rawStats.numMeasures).toFixed(2));
        console.log('Average Number of Notes Per Chord: ' + (rawStats.numNotes / rawStats.numChords).toFixed(2));
        console.log('Range: ' + rawStats.range.minPitch + ' to ' + rawStats.range.maxPitch);

        console.log('Key Signature Usage Percentages:');
        for(var keyId in rawStats.keyUsage) {
            console.log('  ' + keyId + '\t' + ((rawStats.keyUsage[keyId]/rawStats.numMeasures) * 100).toFixed(2) + '%');
        }

        console.log('Time Signature Usage Percentages:');
        for(var timeId in rawStats.timeSigUsage) {
            console.log('  ' + timeId + '\t' + ((rawStats.timeSigUsage[timeId]/rawStats.numMeasures) * 100).toFixed(2) + '%');
        }

        console.log('Average note duration: ' + rawStats.totalSound / rawStats.numNotes + ' quarter notes');
        console.log('Average rest duration: ' + rawStats.totalRest / rawStats.numRests + ' quarter notes');
        console.log('Percent of piece playing: ' + (100 * rawStats.totalSound / (rawStats.totalSound + rawStats.totalRest)).toFixed(2) + '%');

        console.log('Difficulty: ' + this.getDifficulty());
        console.log('Measure Difficulties:');
        this.generateMeasureHeatMap();
        console.log('Section Difficulties:');
        this.generateSectionHeatMap();
    };
};

module.exports = Part;
