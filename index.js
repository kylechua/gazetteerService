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

init();
function init() {
    gazetteer.loadData().then(res => {
        var server = http.createServer().listen(opts.PORT);
    });
}


/*
Object.keys(countries).forEach(country => {
    if (countries[country].altnames.hasOwnProperty('ko')) {
        console.log(countries[country].altnames['ko'])
    } else {
    console.log(countries[country].name)
    }
});
*/