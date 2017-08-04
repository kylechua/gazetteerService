var Geonames = require('geonames.js')
geonames = new Geonames({username: 'kylechua', lan: 'en', encoding: 'JSON'});
var fs = require('fs'), readline = require('readline')
var mysql = require('mysql')
var LineByLineReader = require('line-by-line')


var connection = mysql.createConnection({
  host     : '127.0.0.1',
  user     : 'root',
  database : 'gazetteer'
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
})


// Get geonameIds for each continent -- COMPLETED
    // var log = fs.createWriteStream('./data/continents.txt', {
    //     flags: 'a'
    // })

    // myconts = getContinents().then(function(conts){
    //     conts.forEach(function(c){
    //         log.write(c.name.toString() + "\n" + c.geonameId.toString() + "\n")
    //     })
    // }).catch(function(err){
    //     console.log(err)
    // })

    // // Return a list of continents
    // function getContinents(){
    //     return new Promise(function(resolve, reject){
    //         geonames.search({q: 'CONT'})
    //         .then(function(continents){
    //             data = []
    //             resp = continents.geonames
    //             resp.forEach(function(c){
    //                 if (c.fcode == 'CONT'){
    //                     var continent = {
    //                         name: c.name,
    //                         code: c.continentCode,
    //                         geonameId: c.geonameId,
    //                         altNames: c.alternateNames
    //                     };
    //                     data.push(continent);
    //                 }
    //             })
    //             resolve(data)
    //         }).catch(function(err){
    //             reject(err)
    //         });
    //     });
    // }

// Parse hierarchy.txt from geonames to be just parent -> child pairs -- COMPLETED
    // var log = fs.createWriteStream('./data/hierarchies.txt', {
    //         flags: 'a'
    //     })

    // var rd = readline.createInterface({
    //     input: fs.createReadStream('./data/hierarchy.txt'),
    //     console: false
    // });

    // rd.on('line', function(line) {
    //     str = line.toString()
    //     nums = str.split(/\s*[\s,]\s*/).filter(Boolean);
    //     log.write(nums[0] + ',' + nums[1] + '\n')
    // });

// Parse hierarchies.txt and create a hashmap of hierarchies -- COMPLETED
    // function parseHierarchies() {
    //     var rd = readline.createInterface({
    //             input: fs.createReadStream('./data/hierarchies.txt'),
    //             console: false
    //         });

    //     var dictionary = {}
    //     rd.on('line', function(line) {
    //         str = line.toString()
    //         nums = str.split(/\s*[\s,]\s*/)
    //         key = nums[0]
    //         val = nums[1]
    //         if (dictionary.hasOwnProperty(key)){
    //             dictionary[key].push(val)
    //         } else {
    //             dictionary[key] = new Array()
    //             dictionary[key].push(val)
    //         }
    //         // var post  = {parent: parseInt(key), child: parseInt(val)};
    //         //     connection.query('INSERT INTO hierarchy SET ?', post, function(err, result) {
    //         //         console.log(err)    
    //         //         console.log(result)
    //         //     });
    //     }).on('close', function() {
    //         var json = JSON.stringify(dictionary);
    //         fs.writeFile('./data/hierarchyMap.json', json, 'utf8');
    //     }).on('error', function(err) {
    //         console.log(err)
    //     });
    // }
    // parseHierarchies()


// Parse alternateNames.txt to csv with only relevant info -- COMPLETED
    // var rd = readline.createInterface({
    //         input: fs.createReadStream('./data/alternateNames.txt'),
    //         console: false
    //     });
    // var log = fs.createWriteStream('./data/altNames.txt', {
    //     flags: 'a'
    // })
    // count = 0
    // rd.on('line', function(line) {
    //     count += 1
    //     str = line.toString()
    //     params = str.split('\t')
    //     if (params[2].length > 0 && params[2].length < 4){
    //         id = params[1]
    //         lang = params[2]
    //         name = params[3]
    //         console.log(count + "/12617918")
    //         log.write(id + ',' + lang + ',' + name + '\n')
    //     }
    // }).on('close', function() {
    //     console.log("Done parsing")
    // }).on('error', function(err) {
    //     console.log(err)
    // });

// Parse altNames csv and turn into json hashmap -- COMPLETED
    // var istream = readline.createInterface({
    //         input: fs.createReadStream('./data/altNames.txt'),
    //         console: false
    //     });

    // var dictionary = {}
    // count = 0
    // istream.on('line', line => {
    //     count += 1
    //     str = line.toString()
    //     data = line.split(',')
    //     id = data[0]
    //     lang = data[1]
    //     name = data[2]
    //     if (dictionary.hasOwnProperty(id)){
    //         dictionary[id][lang] = name
    //     } else {
    //         dictionary[id] = {}
    //         dictionary[id][lang] = name
    //     }
    //     /*
    //     if (dictionary.hasOwnProperty(id)){
    //         dictionary[id].push(keyval)
    //     } else {
    //         dictionary[id] = new Array()
    //         dictionary[id].push(keyval)
    //     }
    //     */
    //     console.log(count)
    // }).on('close', function() {
    //     var json = JSON.stringify(dictionary);
    //     fs.writeFile('./data/altnameMap.json', json, 'utf8');
    // }).on('error', function(err) {
    //     console.log(err)
    // });

//Read the hierarchy map -- COMPLETED -- might need this function
/*
    function parseMap(mapPath) {
        return new Promise(function(resolve, reject) {
            fs.readFile(mapPath, 'utf8', function callback(err, data) {
                if (err) {
                    reject(err)
                } else {
                    resolve(JSON.parse(data));
                }
            })
        })
    }

    var gazetteer;
    var altnames;
    parseMap('./data/hierarchyMap.json').then(res => {
        gazetteer = res;
        return parseMap('./data/altnameMap.json')
    }).then(res => {
        altnames = res;
        parseContinent(6255151)
        // getProvinces(6251999).then(res => {
        //             console.log(res)
                    
        //             data["provinces"] = JSON.parse(JSON.stringify(res));
        //             var json = JSON.stringify(data)
        //             fs.writeFile(db, json, 'utf8')
                    
        //         }).catch(err => {
        //             console.log(err)
        //         })
    }).catch(err => {
        console.log(err)
    })
*/

// Parse hierarchy.txt from geonames to be just parent -> child pairs -- COMPLETED
/*
var log = fs.createWriteStream('./cache.txt', {
        flags: 'a'
    })

var rd = readline.createInterface({
    input: fs.createReadStream('./data/CA.txt'),
    console: false
});

rd.on('line', function(line) {
    str = line.toString()
    nums = str.split('\t').filter(Boolean);
    console.log(nums)
});
*/

// Create a set of locations with hierarchies (so we can filter out misc. locations later)
/*
var log = fs.createWriteStream('./cache.txt', {
        flags: 'a'
    })
var rd = readline.createInterface({
    input: fs.createReadStream('./data/hierarchies.txt'),
    console: false
});
myset = new Set()
count = 0;
rd.on('line', function(line) {
    count += 1
    str = line.toString()
    nums = str.split(',').filter(Boolean);
    myset.add(nums[0])
    myset.add(nums[1])
}).on('close', function(line) {
    console.log(count)
    myset.forEach(val => {
        log.write(val + '\n')
    })
});
*/


// Get list of used languages
/*
    myset = new Set()
    var log = fs.createWriteStream('./data/listoflanguages.txt', {
        flags: 'a'
    })
    var rd = readline.createInterface({
            input: fs.createReadStream('./data/altNames.txt'),
            console: false
        });
    count = 0
        rd.on('line', function(line) {
            count += 1
            data = line.split(',')
            console.log(count + ": " + data[1])
            lang = data[1]
            myset.add(lang)
        }).on('close', function(line) {
            console.log("DONE")
            myset.forEach(lang => {
                log.write(lang + '\n')
            })
        })
*/
// Sort list alphabetically
    // languages = []
    // var log = fs.createWriteStream('./data/languages.txt', {
    //         flags: 'a'
    //     })
    // var rd = readline.createInterface({
    //         input: fs.createReadStream('./data/listoflanguages.txt'),
    //         console: false
    //     });
    //     rd.on('line', line => {
    //         languages.push(line)
    //     }).on('close', function() {
    //         languages.sort()
    //         languages.forEach(lang => {
    //             log.write(lang + '\n')
    //         })
    //     })
/*
languages = []
var rd = readline.createInterface({
        input: fs.createReadStream('./data/languages.txt'),
        console: false
    });
    rd.on('line', line => {
        languages.push(line)
    }).on('close', function() {
    })
    */

function createTableSql(name) {
    var str = "CREATE TABLE country"
    str += name + " (id VARCHAR(8), name VARCHAR(200), altnames MEDIUMTEXT)"
    return str
}

// Read set of valid locations
main()
var altNames;
var myset = new Set();

function main() {
fs.readFile('./data/altnameMap.json', 'utf8', function callback(err, data) {
    if (err) {
       throw err;
    } else {
        altNames = JSON.parse(data);
        console.log("Parsed alt names map")
        var rd = readline.createInterface({
            input: fs.createReadStream('./data/cache.txt'),
            console: false
        });
        rd.on('line', function(line) {
            myset.add(line)
        }).on('close', function(line) {
            console.log("Parsed cache of valid locations")
            parseGeoname()
        });
    }
})
}

// Parse country data
function parseGeoname() {
    var today = new Date()
    var log = fs.createWriteStream('./logs/' + today.toString() + '.txt', {
        flags: 'a'
    })
    lr = new LineByLineReader('./data/allCountries.txt')
    lr.on('error', err => {
        throw err
    })
    count = 0
    lr.on('line', line => {
        lr.pause()
        setTimeout(function () {
            data = line.split('\t')
            if (myset.has(data[0]) && validLoc(data[7])){
                var post  = {id: parseInt(data[0]), name: data[1]};
                country = data[8]
                if (altNames.hasOwnProperty(data[0])){
                    names = JSON.stringify(altNames[data[0]])
                    names  = names.replace(/[\u007F-\uFFFF]/g, function(chr) {
                        return "\\u" + ("0000" + chr.charCodeAt(0).toString(16)).substr(-4)
                    })
                    post["altnames"] = names;
                }
                connection.query(createTableSql(country), function(err, result) {
                    if (err && err.errno == 1050) {
                        connection.query('INSERT INTO ' + 'country' + country + ' SET ?', post, function(err, result) {
                                if (result != undefined) {
                                    log.write(count + ': ' + post.id + ' - ' + post.name + ' (' + country + ')')
                                    log.write('\n')
                                } else {
                                    console.log(err)
                                }
                        });
                    } else {
                        console.log(err)
                    }
                })
            }
            count += 1
            console.log(count)
            lr.resume();
        }, 0.0001)
    })

    lr.on('end', function () {
        console.log("DONE")
    })

    /*
    var rd = readline.createInterface({
        input: fs.createReadStream('./data/CA.txt'),
        console: false
    });
    count = 0
    rd.on('line', function(line) {
        data = line.split('\t')
        // if is a valid location
        count += 1
            if (count%1000 == 0) {
                setTimeout(function() {
                    console.log("RESTING: " + count)
                }, 2000)
            }
        if (myset.has(data[0]) && validLoc(data[7])){
            var post  = {id: parseInt(data[0]), name: data[1]};
            country = data[8]
            if (altNames.hasOwnProperty(data[0])){
                names = JSON.stringify(altNames[data[0]])
                names  = names.replace(/[\u007F-\uFFFF]/g, function(chr) {
                    return "\\u" + ("0000" + chr.charCodeAt(0).toString(16)).substr(-4)
                })
                post["altnames"] = names
            }
            connection.query(createTableSql(country), function(err, result) {
                if (err && err.errno == 1050) {
                    connection.query('INSERT INTO ' + 'country' + country + ' SET ?', post, function(err, result) {
                            if (result != undefined) {
                            } else {
                                console.log(err)
                            }
                    });
                } else {
                    console.log(err)
                }
            })
        }
    }).on('close', function(line) {
    })
    */
}

divs = {
    'ADM1': true,
    'ADM2': true,
    'ADM3': true,
    'ADM4': true,
    'ADM5': true,
    'ADMD': true,
    'LTER': true,
    'PCL': true,
    'PCLD': true,
    'PCLF': true,
    'PCLI': true,
    'PCLS': true,
    'PRSH': true,
    'TERR': true,
    'ZN': true,
    'ZNB': true,
    'PPL': true,
    'PPLA': true,
    'PPLA2': true,
    'PPLA3': true,
    'PPLA4': true,
    'PPLC': true,
    'PPLF': true,
    'PPLG': true,
    'PPLL': true,
    'PPLR': true,
    'PPLS': true,
    'STLMT': true
}
function validLoc(code) {
    if (divs.hasOwnProperty(code)) {
        return true
    } else {
        return false
    }
}

/*
// USING THE API -- not used, I ended up just parsing the raw data
function parseContinent(id){
    console.log("Parsing: " + id)
    var countries;
    getCountries(id).then(res => {
        countries = res;
        countries.forEach(function(country, index){
            setTimeout(function() {
                getProvinces(country.geonameId).then(res => {
                    console.log(country.name)
                    code = country.code;
                    db = './data/countries/' + code + '.json'
                    data = JSON.parse(JSON.stringify(country));
                    data['locations'] = res
                    console.log(res)
                    var json = JSON.stringify(data)
                    fs.writeFileSync(db, json, 'utf8')
                }).catch(err => {
                    console.log(err)
                })
            }, 1000*index);
        })
    })
}


//getChildren(6255147)
// Return a list of children
function getCountries(id){
    return new Promise(function(resolve, reject){
        geonames.children({geonameId: id})
        .then(function(countries){
            data = []
            resp = countries.geonames
            resp.forEach(function(c){
                var country = {
                    name: c.name,
                    code: c.countryCode,
                    geonameId: c.geonameId
                }
                if (altnames.hasOwnProperty(c.geonameId)){
                    country["altNames"] = altnames[c.geonameId]
                }
                data.push(country)
            })
            resolve(data)
        }).catch(err => {
            reject(err)
        });
    })
}

function getProvinces(id){
    return new Promise(function(resolve, reject){
        geonames.children({geonameId: id})
        .then(function(provinces){
            if (provinces != undefined){
                data = {}
                resp = provinces.geonames
                if (resp != undefined){
                    resp.forEach(function(c){
                        var province = {
                            name: c.name
                        }
                        if (altnames.hasOwnProperty(c.geonameId)){
                            province["altNames"] = altnames[c.geonameId]
                        }
                        data[c.geonameId] = province;
                    })
                    resolve(data)
                }
            } else {
                reject()
            }
        }).catch(err => {
            reject(err)
        });
    })
}
*/