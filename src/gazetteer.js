var sqlite3 = require('sqlite3')
var utils = require('./utils.js')
var fs = require('fs'), readline = require('readline')


/* Load the required data */
exports.loadData = function() {
    return new Promise(function(resolve, reject) {
        global.DB = new sqlite3.Database(__dirname + '/../data/geonames_data5000.db', function callback(err) {
            if (err) {
                throw(err);
            } else {
                console.log("Database loaded from " + __dirname + '/../data/geonames_data5000.db')
            }
            
        });
        
        parser = utils.parseJsonAsync(__dirname + '/../data/countryList.json');
        parser.then(json => {
            global.COUNTRIES = json;
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
        if (request.hasOwnProperty('country')) {
            var region = false;
            if (request.hasOwnProperty('region'))
                region = request['region'];
            var country = request['country'].toUpperCase();
            if (!region) {
                getRegions(country, lang).then(res => {
                    response['data'] = res;
                    resolve(response);
                }).catch(err => {
                    response['msg'] = err;
                    resolve(response);
                });
            } else {
                getCities(country, region, lang).then(res => {
                    response['data'] = res;
                    resolve(response);
                }).catch(err => {
                    response['msg'] = err;
                    resolve(response);
                })
            }
            
        } else { // No ID, return country list
            var countries = getCountries(lang);
            response['data'] = countries;
            response['msg'] = "No ID or country code specified, returned the list of countries in default language: " + defaultlang;
            resolve(response);
        }
    })
}

function getCountries(lang) {

    var data = [];
    Object.keys(COUNTRIES).forEach(key => {
            var country = COUNTRIES[key];
            var country = country.code;
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
            info['country'] = country.toUpperCase();
            info['id'] = id;
            data.push(info);
        });
    return data;
}

function getRegions(country, lang) {

    return new Promise(function(resolve, reject) {
        var tableName = "_" + country.toUpperCase();
        // Check if country code is valid
        var query = "SELECT name FROM sqlite_master WHERE type='table' AND name='" + tableName + "'";
        DB.get(query, function callback(err, res) {
            if (err) {
                reject(err)
            }
            if (res) {
                var data = [];
                var query = "SELECT * FROM " + tableName + " WHERE level=1";
                DB.all(query, function(err, rows) {
                    rows.forEach(region => {
                        var info = {};
                        var name;
                        info['id'] = region.id;
                        info['key'] = region.name;
                        info['country'] = country.toUpperCase();
                        if (region.hasOwnProperty('altnames')) {
                            var othernames = JSON.parse(region.altnames);
                            if (lang != 'en' && othernames.hasOwnProperty(lang)) {
                                name = othernames[lang];
                            } else {
                                name = region.name;
                            }
                        }
                        info['name'] = name;
                        data.push(info);
                    })
                    resolve(data);
                });
            } else {
                reject("Invalid country code");
            }
        });
    });
}

function getCities(country, region, lang) {

    return new Promise(function(resolve, reject) {
        var tableName = "_" + country.toUpperCase();
        // Check if country code is valid
        var query = "SELECT name FROM sqlite_master WHERE type='table' AND name='" + tableName + "'";
        DB.get(query, function callback(err, res) {
            if (err) {
                reject(err)
            }
            else if (res) {
                getAdminCode(tableName, region).then(res => {
                    // Valid admin code
                    if (res != undefined) {
                        var data = [];
                        var admincode = res;
                        var query = "SELECT * FROM " + tableName + " WHERE level='5' AND admin1='" + admincode + "'";
                        console.log(query)
                        DB.all(query, function(err, rows) {
                            if (err) {
                                reject(err);
                            }
                            rows.forEach(city => {
                                var info = {};
                                var name;
                                info['id'] = city.id;
                                info['key'] = city.name;
                                info['country'] = country;
                                info['region'] = region;
                                if (city.hasOwnProperty('altnames')) {
                                    var othernames = JSON.parse(city.altnames);
                                    if (othernames != null && lang != 'en' && othernames.hasOwnProperty(lang)) {
                                        name = othernames[lang];
                                    } else {
                                        name = city.name;
                                    }
                                }
                                info['name'] = name;
                                data.push(info);
                            });
                            resolve(data);
                        });
                    } else {
                        reject(region + " not found in " + country)
                    }
                }).catch(err => {
                    reject(err)
                });
            } else {
                reject("Invalid country code");
            }
        });
    });
}

function getAdminCode(table, id) {

    return new Promise(function(resolve, reject) {
        var query = "SELECT * FROM " + table + " WHERE id=" + id;
        DB.get(query, function callback(err, res) {
            if (err) {
                reject(err);
            } else {
                if (res != undefined) {
                    var level = res.level;
                    var code = res['admin' + level];
                    resolve(code);
                } else {
                    // ID not found in Table
                    resolve(undefined)
                }
            }
        })
    });
}
