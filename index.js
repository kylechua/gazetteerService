var http = require('http')
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
            console.log("Listening on " + JSON.stringify(server.address()))
        });
    });
    setup.catch(err => {
        throw(err)
    });
}


server.on('request', function(request, response) {
    response.write("Test")
    response.end()
});

/*
Object.keys(countries).forEach(country => {
    if (countries[country].altnames.hasOwnProperty('ko')) {
        console.log(countries[country].altnames['ko'])
    } else {
    console.log(countries[country].name)
    }
});
*/