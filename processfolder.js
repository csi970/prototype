var xml2json = require('xml-to-json'),
    fs = require('fs');
    Score = require('./score'),
    folder = process.argv[2],
    today = new Date(),
    statsFileName = '';

statsFileName = '' + today.getUTCFullYear() + '-' + (today.getUTCMonth() + 1) + '-' + today.getUTCDate() + '.csv';

var processFolder = function (currDir, currObj) {
    var filePath, fileStats;
    if (currDir) {
        filePath = currDir + '/' + currObj;
    } else {
        filePath = currObj;
    }
    var fileStats = fs.statSync(filePath);
    if (fileStats.isFile()) {
        processFile(currDir, currObj);
    } else if (fileStats.isDirectory) {
        fs.readdir(filePath, function (err, files) {
            if (err) {
                console.error('Error processing folder:' + err);
                return;
            } else {
                files.forEach(function (file) {
                    processFolder(filePath, file);
                });
            }
        });
    }
}

var processFile = function (currDir, currFile) {
    var filePath;
    if (currDir) {
        filePath = currDir + '/' + currFile;
    } else {
        filePath = currFile;
    }
    if (filePath.indexOf('.xml') == -1) {
        return;
    }
    xml2json({
        input: filePath,
        output: null
    }, function (err, json) {
        if (err) {
            console.error('Error parsing xml: ' + err);
        } else {
            console.log(currFile);
            var s = new Score(json);
            var processedString = s.processToCSVString(currFile);
            try {
                outputStats = fs.statSync(statsFileName);
            } catch (fileErr) {
                fs.writeFileSync(statsFileName, s.CSVHeader + '\n');
            } finally {
                fs.appendFileSync(statsFileName, processedString)
            }
        }
    });
}

processFolder(null, folder);
