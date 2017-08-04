var http = require('http')
var sqlite3 = require('sqlite3').verbose()

var gazetteer = require('./src/gazetteer.js')

/*
COUNTRIES
HIERARCHY
LANG
*/

init();
function init() {
    gazetteer.loadFiles().then(res => {

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