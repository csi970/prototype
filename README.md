## Music Analysis Package

Get some information about [MusicXML](http://www.musicxml.com) files and (experimentally) find out how hard it might be to play!

### Installation

    $ npm install music-analysis

Or you can [download the ZIP](https://github.com/csi970/prototype/archive/master.zip).

### Usage

It's easy to use asynchronously in your Node.js programs:

```javascript
var music = require('music-analysis');

music.parseMXLFile('AwesomeScore.mxl', function(score) {
    var parts = score.parts;
    parts.forEach(function(part) {
        var stats = part.getRawStats();
        var m = stats.numMeasures;

        console.log('This part has ' + m + ' measures.')
    });
});
```

You can also check out the `./examples/`.

### Contributing?

Yes, please! Feel free to send pull requests :)
