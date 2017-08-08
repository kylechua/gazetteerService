var sqlite3 = require('sqlite3')
var utils = require('./utils.js')
var fs = require('fs'), readline = require('readline')


/* Load the required data */
exports.loadData = function() {
    return new Promise(function(resolve, reject) {
        global.DB = new sqlite3.Database(__dirname + '/../data/geonames_data.db', function callback(err) {
            if (err) {
                throw(err);
            } else {
                console.log("Database loaded from " + __dirname + '/../data/geonames_data.db')
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

exports.getLocations = function(request, defaultlang) {

    return new Promise(function(resolve, reject) {
        var response = {};
        var lang;
        if (request.hasOwnProperty('lang')) {
            lang = request['lang'];
        } else {
            lang = defaultlang;
        }
        // Check if ID is given
        if (request.hasOwnProperty('id') && request.hasOwnProperty('country')) {
            var id = request['id'];
            var code = request['country'];
            getChildren(id, code, lang).then(res => {
                response['data'] = res;
                resolve(response);
            }).catch(err => {
                response['msg'] = err;
                resolve(response);
            });
        } else { // No ID, return country list
            var countries = getCountries(lang);
            response['data'] = countries;
            response['msg'] = "No ID or country code specified, returned the list of countries in language: " + lang;
            resolve(response);
        }
    })
}

function getCountries(lang) {

    var data = [];
    Object.keys(COUNTRIES).forEach(key => {
            var country = COUNTRIES[key];
            var code = country.codes;
            var id = country.id;
            var name;
            var key = key.toString();
            if (country.hasOwnProperty('altnames')) {
                if (lang != 'en' && country.altnames.hasOwnProperty(lang)) {
                    name = country.altnames[lang];
                } else {
                    name = key;
                }
            }
            var info = {};
            info['key'] = key;
            info['name'] = name;
            info['code'] = code;
            info['id'] = id;
            data.push(info);
        });
    return data;
}

function getChildren(id, code, lang) {

    return new Promise(function(resolve, reject) {
        var tableName = 'country' + code.toUpperCase();
        // Check if country code is valid
        var query = "SELECT name FROM sqlite_master WHERE type='table' AND name='" + tableName + "'";
        DB.get(query, function callback(err, res) {
            if (err) {
                reject(err)
            }
            if (res) {
                var childrenList = HIERARCHY[id];
                var num = childrenList.length;
                var data = [];
                var promises = [];
                var last = false;
                childrenList.forEach(function(child, index) {
                        var command = "SELECT * FROM " + tableName + " WHERE id=" + child;
                        promises.push(getChild(command, lang, code))
                    });
                Promise.all(promises).then(values => {
                    // Remove undefined values (e.g. U.S. Virgin Islands)
                    resolve(values.filter(Boolean))
                });
            } else {
                reject("Invalid country code");
            }
        });
    });
}

function getChild(command, lang, code) {

    return new Promise(function(resolve, reject) {
        DB.get(command, function callback(err, child) {
            if (err) {
                console.log(err);
            } else {
                if (child != undefined) {
                    var id = child.id;
                    var name;
                    var altnames = JSON.parse(child.altnames);
                    if (lang != 'en' && altnames.hasOwnProperty(lang)){
                        name = altnames[lang];
                    } else {
                        name = child.name;
                    }
                    var info = {};
                    info['key'] = child.name;
                    info['name'] = name;
                    info['code'] = code;
                    info['id'] = id;
                    resolve(info);
                } else {
                    // This is probably a dependent state (e.g. U.S. Virgin Islands)
                    // So we don't add it to the data (it should appear as a country)
                    resolve();
                }
            }
        });
    })
}