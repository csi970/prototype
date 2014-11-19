var xml2json = require('xml-to-json');
var mongoose = require('mongoose');
var Score = require('./score');

var file = process.argv[2] || 'testScore.xml';

var scoreSchema = new mongoose.Schema({
    parts: [{
        id: String,
        name: String,
        instrument: String,
        measures: [{
            chords: [{
                notes: [{
                    pitch: {
                        stepLetter: String,
                        step: String,
                        octave: Number,
                        value: Number
                    },
                    rest: Boolean,
                    grace: Boolean,
                    voice: Boolean,
                    duration: Number,
                    noteType: String
                }]
            }],
            divisions: Number,
            keySignature: String,
            timeSignature: String,
            stats: [{
                accidentals: Number,
                graceNotes: Number,
                rests: Number,
                chords: Number,
                notes: Number,
                noteLength: Number,
                restLength: Number,
                range: {
                    minPitch: {
                        step: String,
                        octave: Number
                    },
                    maxPitch: {
                        step: String,
                        octave: Number
                    }
                }
            }]
        }]
    }]
});

var DBScore = mongoose.model('Score', scoreSchema);
mongoose.connect('mongodb://localhost/music');

xml2json({
    input: file,
    output: null
}, function(err, json) {
    if (err) {
        console.error('Error parsing MusicXML: ' + err);
    } else {
        var s = new Score(json);
        s.process();

        var dbs = new DBScore(s).save(function(err, res) {
            return console.log('err: ' + err);
        });

    }
});
