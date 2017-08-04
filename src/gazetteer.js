var sqlite3 = require('sqlite3')
var utils = require('./utils.js')

/* Load the required data */
exports.loadData = function() {
    return new Promise(function(resolve, reject) {
        global.DB = new sqlite3.Database(__dirname + '/../data/geonames_data.sql', sqlite3.OPEN_READONLY, function callback(err) {
            if (err) {
                throw(err)
            } else {
                console.log("Gazetteer database loaded.")
            }
        });
        parser = utils.parseJsonAsync(__dirname + '/../data/countryList.json');
        parser.then(json => {
            global.COUNTRIES = json;
            return utils.parseJsonAsync(__dirname + '/../data/hierarchyMap.json');
        }).then(json => {
            global.HIERARCHY = json;
            return utils.parseSetAsync(__dirname + '/../data/listoflanguages.txt');
        }).then(set => {
            global.LANGS = set;
            resolve();
        });
        parser.catch(err => {
            console.log(err.message)
            reject(err)
        });
    });
}