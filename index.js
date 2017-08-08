var http = require('http')
var URL = require('url')
var path = require('path')
var sqlite3 = require('sqlite3')

var gazetteer = require('./src/gazetteer.js')
var opts = require('./config.json')

/* 
Global constants:
COUNTRIES
HIERARCHY
DB
LANG
*/

var server = http.createServer();

init();
function init() {
    setup = gazetteer.loadData();
    setup.then(res => {
        server.listen(opts.PORT, function callback(err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Gazetteer listening on " + JSON.stringify(server.address()));
            }   
        });
    });
    setup.catch(err => {
        throw(err)
    });
}

server.on('request', function(request, response) {
    var myPath = path.parse(request.url);
    var pathStr = path.format(myPath);
    if (pathStr.indexOf(opts.PREFIX + 'currency/rates') != -1) {
        console.log("currency service")
    } else if (pathStr.indexOf(opts.PREFIX + 'gazetteer/') != -1 ) {
        if (pathStr.indexOf('locations') != -1) {
            server.emit('locations', request, response);
        }
    } else {
        // Not found, wrong URI
        // response.statusCode = 404;
    }
    response.end();
});

server.on('locations', function (request, response, db) {
    var url = URL.parse(request.url, true).path;
    var querystr = url.split('?')[1];
    if (querystr != undefined){
        var queries = querystr.split('&');
        var query = {};
        queries.forEach(param => {
            var temp = param.split('=');
            var key = temp[0];
            var val = temp[1];
            query[key] = val;
        })
        data = gazetteer.getLocations(query, opts.defaultlang);
        data.then(res => {
            console.log(res)
        }).catch(err => {
            console.log(err)
        })
    }
});