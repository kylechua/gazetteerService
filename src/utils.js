var fs = require('fs'), readline = require('readline')

/* Returns a JSON object in memory from a given file */
exports.parseJsonAsync = function(filePath) {
    return new Promise(function(res, rej) {
        fs.readFile(filePath, 'utf8', function callback(err, data) {
            if (err) {
                throw(err);
            } else {
                try {
                    console.log("Parsed '" + filePath + "'");
                    res(JSON.parse(data));
                } catch (e) {
                    console.log("Error parsing '" + filePath + "'");
                    throw(e);
                }
            }
        })
    });
}

/* Returns a set of values, separated by line, from a given file */
exports.parseSetAsync = function(filePath) {
    return new Promise(function(res, rej) {
        var mySet = new Set();
        try {
            var rd = readline.createInterface({
                input: fs.createReadStream(filePath),
                console: false
            });
            rd.on('line', function(line) {
                mySet.add(line);
            }).on('close', function(line) {
                console.log("Parsed '" + filePath + "'");
                res(mySet);
            });
        } catch(e) {
            console.log("Error parsing '" + filePath + "'");
            throw(e);
        }
    });
}