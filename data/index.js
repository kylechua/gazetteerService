var fs = require('fs'), readline = require('readline')
var mysql = require('mysql')
var LineByLineReader = require('line-by-line')

var connection = mysql.createConnection({
  host     : '127.0.0.1',
  user     : 'root',
  database : 'gazetteerdb_15000'
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  main();
})

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

var altNames;
function main() {
fs.readFile('./data/altnameMap.json', 'utf8', function callback(err, data) {
    if (err) {
       throw err;
    } else {
        console.log("Read alt names")
        altNames = JSON.parse(data);
        readFile1()
    }
})
}

function validLoc(code) {
    if (divs.hasOwnProperty(code)) {
        return true
    } else {
        return false
    }
}

function readFile4() {
lr = new LineByLineReader('./logs/cities1000.txt')
    lr.on('error', err => {
        throw err
    })
    count = 0
    lr.on('line', line => {
        lr.pause()
        setTimeout(function () {
            count +=1
            params = line.split('\t')
            country = params[0].toString().toUpperCase()
            id = params[1]
            ad1 = params[2]
            ad2 = params[3]
            ad3 = params[4]
            ad4 = params[5]
            level = params[6]
            name = params[7]

            var post = {}
            post['id'] = id
            post['admin1'] = ad1
            post['admin2'] = ad2
            post['admin3'] = ad3
            post['admin4'] = ad4
            post['level'] = level
            post['name'] = name
            if (params[8] != null) {
                post['altnames'] = params[8]
            }
            connection.query('INSERT INTO ' + '_' + country + ' SET ?', post, function(err, result) {
                        if (result != undefined) {
                            console.log(count)
                        } else {
                            console.log(err)
                        }
                });

            lr.resume()
        }, 1)
    })

    lr.on('end', function () {
        console.log("DONE")
    })
}


function readFile3() {
    var log = fs.createWriteStream('./logs/cities1000.txt', {
        flags: 'a'
    })
lr = new LineByLineReader('./admin/cities1000.txt')
    lr.on('error', err => {
        throw err
    })
    count = 0
    lr.on('line', line => {
        lr.pause()
        setTimeout(function () {
            count +=1
            params = line.split('\t')
            type = params[7]
            if (validLoc(type)) {
                id = params[0]
                name = params[1]
                country = params[8]
                var str = country + '\t' + id;
                str += '\t' + params[10]
                str += '\t' + params[11]
                str += '\t' + params[12]
                str += '\t' + params[13]
                str += '\t' + 5
                str += '\t' + name
                if (altNames.hasOwnProperty(params[0])){
                    names = JSON.stringify(altNames[params[0]])
                    names  = names.replace(/[\u007F-\uFFFF]/g, function(chr) {
                        return "\\u" + ("0000" + chr.charCodeAt(0).toString(16)).substr(-4)
                    })
                    str += '\t' + names
                }
                console.log(count)
                log.write(str + '\n')
            }
            lr.resume()
        }, 1)
    })

    lr.on('end', function () {
        console.log("DONE")
    })
}



function readFile2() {
    var log = fs.createWriteStream('./logs/admin2.txt', {
        flags: 'a'
    })
lr = new LineByLineReader('./admin/admin2.txt')
    lr.on('error', err => {
        throw err
    })
    count = 0
    lr.on('line', line => {
        lr.pause()
        setTimeout(function () {
            count +=1
            params = line.split('\t')
            country = params[0].split('.')[0]
            post = {};
            post['admin1'] = params[0].split('.')[1]
            post['admin2'] = params[0].split('.')[2]
            post['name'] = params[1]
            post['id'] = params[3]
            post['level'] = 2
            if (altNames.hasOwnProperty(params[3])){
                names = JSON.stringify(altNames[params[3]])
                names  = names.replace(/[\u007F-\uFFFF]/g, function(chr) {
                    return "\\u" + ("0000" + chr.charCodeAt(0).toString(16)).substr(-4)
                })
                post["altnames"] = names
            }
            connection.query('INSERT INTO ' + '_' + country + ' SET ?', post, function(err, result) {
                        if (result != undefined) {
                            log.write(count + " - " + post.id + ' - ' + post.name + ' - ' + country)
                            log.write('\n')
                            console.log(count)
                        } else {
                            console.log(err)
                        }
                });
            lr.resume();
        }, 5)
    })

    lr.on('end', function () {
        console.log("DONE")
    })
}



function createTableSql(name) {
    var str = "CREATE TABLE _"
    str += name + " (id VARCHAR(10), admin1 VARCHAR(10), admin2 VARCHAR(10), admin3 VARCHAR(10), admin4 VARCHAR(10), level VARCHAR(1), name VARCHAR(200), altnames LONGTEXT)"
    return str
}



function readFile1() {
    var log = fs.createWriteStream('./logs/admin1.txt', {
        flags: 'a'
    })
lr = new LineByLineReader('./admin/admin1.txt')
    lr.on('error', err => {
        throw err
    })
    count = 0
    lr.on('line', line => {
        lr.pause()
        setTimeout(function () {
            count +=1
            params = line.split('\t')
            country = params[0].split('.')[0]
            post = {};
            post['admin1'] = params[0].split('.')[1]
            post['name'] = params[1]
            post['id'] = params[3]
            post['level'] = 1
            if (altNames.hasOwnProperty(params[3])){
                names = JSON.stringify(altNames[params[3]])
                names  = names.replace(/[\u007F-\uFFFF]/g, function(chr) {
                    return "\\u" + ("0000" + chr.charCodeAt(0).toString(16)).substr(-4)
                })
                post["altnames"] = names
            }
            connection.query(createTableSql(country), function(err, result) {
                if (err && err.errno == 1050) {
                } else {
                }
                connection.query('INSERT INTO ' + '_' + country + ' SET ?', post, function(err, result) {
                            if (result != undefined) {
                                log.write(count + " - " + post.id + ' - ' + post.name + ' - ' + country)
                                log.write('\n')
                                console.log(count)
                            } else {
                                console.log(err)
                            }
                    });
            })
            lr.resume();
        }, 20)
    })

    lr.on('end', function () {
        console.log("DONE")
    })
}
