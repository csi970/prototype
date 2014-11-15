var Util = require('./util');

var Section = function Section() {
    this.measures = [];
    this.firstMeasure = -1;
    this.lastMeasure = -1;
    this.sectionStats = {
        numRests: 0,
        numChords: 0,
        numNotes: 0,
        numAccidentals: 0,
        numGraceNotes: 0,
        numMeasures: 0,
        keyUsage: [],
        keyChanges: 0,
        timeSigUsage: [],
        timeChanges: 0,
        totalSound: 0,
        totalRest: 0,
        range: {
            'minPitch': null,
            'maxPitch': null
        }
    };
    this.currKey = null;
    this.currTime = null;

    this.addMeasure = function(measure, measureNum) {
        if (this.firstMeasure === -1) {
            this.firstMeasure = measureNum;
            this.currKey = measure.keySignature;
            this.currTime = measure.timeSignature;
        }
        this.lastMeasure = measureNum;
        this.measures.push(measure);
        this.addStats(measure);
        return this;
    };

    this.addStats = function(measure) {
        var newStats = measure.measureStats;
        this.sectionStats.numRests += newStats.numRests;
        this.sectionStats.numChords += newStats.numChords;
        this.sectionStats.numNotes += newStats.numNotes;
        this.sectionStats.numAccidentals += newStats.numAccidentals;
        this.sectionStats.numGraceNotes += newStats.numGraceNotes;
        this.sectionStats.totalSound += newStats.noteLength;
        this.sectionStats.totalRest += newStats.restLength;
        this.sectionStats.numMeasures++;
        
        if (measure.keySignature !== this.currKey) {
            this.currKey = measure.keySignature;
            this.sectionStats.keyChanges++;
        }

        if (this.sectionStats.keyUsage[this.currKey]) {
            this.sectionStats.keyUsage[this.currKey]++;
        } else {
            this.sectionStats.keyUsage[this.currKey] = 1;
        }

        if (measure.timeSignature !== this.currTime) {
            this.currTime = measure.timeSignature;
            this.sectionStats.timeChanges++;
        }

        if (this.sectionStats.timeSigUsage[this.currTime]) {
            this.sectionStats.timeSigUsage[this.currTime]++;
        } else {
            this.sectionStats.timeSigUsage[this.currTime] = 1;
        }

        if (newStats.range.minPitch && newStats.range.maxPitch) {
            if (!this.sectionStats.range.maxPitch ||
                newStats.range.maxPitch.value > this.sectionStats.range.maxPitch.value) {
                this.sectionStats.range.maxPitch = newStats.range.maxPitch;
            }

            if (!this.sectionStats.range.minPitch ||
                newStats.range.minPitch.value < this.sectionStats.range.minPitch.value) {
                this.sectionStats.range.minPitch = newStats.range.minPitch;
            }
        }
    };

    this.getLength = function() {
        return this.measures.length;
    };

    this.getDifficulty = function() {
        return Util.calculateDifficulty(this.sectionStats, true);
    }

};

module.exports = Section;
