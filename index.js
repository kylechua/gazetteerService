var http = require('http')
var URL = require('url')
var path = require('path')
var sqlite3 = require('sqlite3')
var fs = require('fs')

var gazetteer = require('./src/gazetteer.js')
var currency = require('./src/currency.js')
var opts = require('./config.json')

var server = http.createServer();

init();
initCurrency();
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
        if (pathStr.indexOf('/buy/') != -1) {
            server.emit("buying", request, response, XCRATES);
        } else if (pathStr.indexOf('/sell/') != -1) {
            server.emit("selling", request, response, XCRATES);
        } else if (pathStr.indexOf('/modifier') != -1) {
            server.emit("modifier", request, response, XCRATES);
        } else if (pathStr.indexOf('/update/') != -1) {
            server.emit("update", request, response, XCRATES);
        } else if (pathStr.indexOf('/sync/') != -1) {
            server.emit("sync", request, response, XCRATES);
        } else if (pathStr.indexOf('/source') != -1) {
            server.emit("source", request, response, XCRATES);
        } else {
            response.write(JSON.stringify({
                "code": 405
            }));
        }
    } else if (pathStr.indexOf(opts.PREFIX + 'gazetteer/') != -1 ) {
        if (pathStr.indexOf('locations') != -1) {
            server.emit('locations', request, response);
        } else {
            response.write(JSON.stringify({
                "code": 405
            }));
        }
    } else {
        // Not found, wrong URI
        // response.statusCode = 404;
    }
});

server.on('locations', function (request, response, db) {
    var url = URL.parse(request.url, true).path;
    var querystr = url.split('?')[1];
    var query = {};
    if (querystr != undefined){
        var queries = querystr.split('&');
        queries.forEach(param => {
            var temp = param.split('=');
            var key = temp[0];
            var val = temp[1];
            query[key] = val;
        })
        
    }

    data = gazetteer.getLocations(query, opts.defaultlang);
        data.then(res => {
            if (!res.hasOwnProperty('data')){
                res['code'] = 400;
            } else {
                res['code'] = 200;
            }
            response.write(JSON.stringify(res));
            response.end();
        }).catch(err => {
            response.write(err);
            response.end();
        })
});

function initCurrency(){
    /* Parse exchange rate database */
    try {
        global.XCRATES = JSON.parse(fs.readFileSync(__dirname + '/data/xcrates.json', 'utf8'));
    } catch (e) {
        /* Create JSON if file URL is invalid*/
        /* Default settings */
        global.XCRATES = { yahoo: {rates: {}}, local: {rates: {}} };
        XCRATES.modifier = 1;
        XCRATES.source = "yahoo";

        fs.writeFileSync(__dirname + '/data/xcrates.json', JSON.stringify(XCRATES));
        console.log("Currency service: could not find data/xcrates.json. New database created.");
    }
    /* Initialize Scheduler to update currency rates, then initially update them */
    var currencyScheduler = setInterval(updateRates, opts.xcRateUpdateInterval);
    updateRates();

    /* If no local rates are specified, set local rates to current Yahoo rates */
    if (XCRATES.local.rates["USD"] == undefined){
        XCRATES.local.rates = XCRATES.yahoo.rates;
        fs.writeFileSync(__dirname + '/data/xcrates.json', JSON.stringify(XCRATES));
    }
}

function updateRates() {
    /* Get query for every currency in currCodes */
    var myURL = 'http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.xchange%20where%20pair%20in%20('
    opts.supportedCurrencies.forEach(function(code) {
        myURL += '%22USD' + code + '%22%2C%20';
    });
    myURL = myURL.substring(0, myURL.length-6);
    myURL += ')&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=';

    /* Request from Yahoo API */
    http.get(myURL, function (response) {
        var body = '';
        response.on('data', function (line) {
            body += line;
        }).on('end', function () {
            var res = JSON.parse(body);
            var parsedData = res.query.results.rate;
            for (var i = 0; i < parsedData.length; i++) {
                var code = parsedData[i].id.substring(3);
                var rate = parseFloat(parsedData[i].Rate);
                XCRATES.yahoo["rates"][code] = rate;
            }
            var today = new Date();
            XCRATES.yahoo["updated"] = today;
            fs.writeFileSync(__dirname + '/data/xcrates.json', JSON.stringify(XCRATES));
            console.log("Updated Yahoo exchange rates: " + today);
        })
    }).on('error', function (e) {
        console.error("Error retrieving Yahoo exchange rates: " + e.message);
    });
}

/* GET /currency/rates/buy/{from}{to}
 *  Parameters
 *   - {from}: ISO 4217 currency code
 *   - {to}: ISO 4217 currency code
 *  Return
 *   - Response code
 *   - Decimal value
 */
server.on('buying', function (request, response, db) {
    var url = URL.parse(request.url, true).path;
    var temp = url.split('?')[0];
    var temp = temp.split('/');
    var from = temp[temp.length - 2];
    var to = temp[temp.length - 1];

    try {
        var rate = currency.getBuyingRate(from, to, db);
        response.write(JSON.stringify({
            "code": 200,
            "data": {
                "rate": String(rate),
                "source": db.source,
                "updated_at": db[db.source].updated
            }
        }));
        response.end();
    } catch (e) {
        // 400: Bad Request
        response.write(JSON.stringify({
            "code": 400,
            "data": {
                "source": db.source,
                "updated_at": db[db.source].updated,
                "message": e
            }
        }));
        response.end();
    }
});

/* GET /currency/rates/sell/{from}{to}
 *  Parameters
 *   - {from}: ISO 4217 currency code
 *   - {to}: ISO 4217 currency code
 *  Return
 *   - Response code
 *   - Decimal value
 */
server.on('selling', function (request, response, db) {
    var url = URL.parse(request.url, true).path;
    var temp = url.split('?')[0];
    var temp = temp.split('/');
    var from = temp[temp.length - 2];
    var to = temp[temp.length - 1];
    try {
        var rate = currency.getSellingRate(from, to, db);
        response.write(JSON.stringify({
            "code": 200,
            "data": {
                "rate": String(rate),
                "source": db.source,
                "updated_at": db[db.source].updated
            }
        }));
        response.end();
    } catch (e) {
        // 400: Bad Request
        console.log(e);
        response.write(JSON.stringify({
            "code": 400,
            "message": e,
            "data": {
                "source": db.source,
                "updated_at": db[db.source].updated
            }
        }));
        response.end();
    }
});

/* POST /currency/rates/update/{currency}/{rate}
 *  Parameters
 *  - {currency}: ISO 4217 currency code
 *  - {rate}: Decimal value (buying rate in USD)
 *  Return
 *  - Response code
 *  - Decimal value
 */
server.on('update', function (request, response, db) {
    if (request.method == 'POST') {
        var url = URL.parse(request.url, true).path;
        var temp = url.split('?')[0];
        var temp = temp.split('/');
        var currency = temp[temp.length - 2].toUpperCase();
        var rate = parseFloat(temp[temp.length - 1]);
        if (!isNaN(rate)){
            if (supportedCurrencies.includes(currency)){
                db.local.rates[currency] = rate;
                var today = new Date();
                db.local["updated"] = today;
                fs.writeFileSync(__dirname + '/data/xcrates.json', JSON.stringify(db));
                var msg = "Updated Local " + currency + " to " + rate + " " + currency + "/USD";
                response.write(JSON.stringify({
                    "code": 200,
                    "message": msg,
                    "data": {
                        "currency": currency,
                        "rate": String(rate)
                    }
                }));
                response.end();
            } else {
                var msg = "Unable to update local rate. " + currency + " is not a supported currency.";
                response.write(JSON.stringify({
                    "code": 400,
                    "message": msg,
                    "data": {
                        "currency": currency,
                        "supported_currencies": supportedCurrencies
                    }
                }));
                response.end();
            }
        }
    }
});

/* Sync the yahoo rates with yahoo API, the local rates with yahoo rates, or both
 * POST /currency/rates/sync/{source}
 *  Parameters
 *  - {source}: String ("yahoo", "local", or "all")
 *  Return
 *  - Response code
 *  - Decimal value
 */
server.on('sync', function (request, response, db) {
    if (request.method == 'POST') {
        var url = URL.parse(request.url, true).path;
        var temp = url.split('?')[0];
        var temp = temp.split('/');
        var source = temp[temp.length - 1];
        if (source.indexOf("yahoo") != -1) {
            updateRates();
            var msg = "Yahoo rates synced with Yahoo API";
            response.write(JSON.stringify({
                "code": 200,
                "message": msg
            }));
        } else if (source.indexOf("local") != -1) {
            db.local.rates = db.yahoo.rates;
            var today = new Date();
            db.local["updated"] = today;
            fs.writeFileSync(__dirname + '/data/xcrates.json', JSON.stringify(db));
            var msg = "Local rates synced with Yahoo rates";
            response.write(JSON.stringify({
                "code": 200,
                "message": msg
            }));
        } else if (source.indexOf("all") != -1) {
            updateRates();
            db.local.rates = db.yahoo.rates;
            var today = new Date();
            db.local["updated"] = today;
            fs.writeFileSync(__dirname + '/data/xcrates.json', JSON.stringify(db));
            var msg = "All rates synced with Yahoo API";
            response.write(JSON.stringify({
                "code": 200,
                "message": msg
            }));
        } else {
            // 400: Bad Request
            var msg = source + " is an invalid source.";
            response.write(JSON.stringify({
                "code": 400,
                "message": msg
            }));
        }
        response.end();
    }
})

/* GET /currency/rates/modifier
 *  Return
 *  - Response code
 *  - Decimal value
 * POST /currency/rates/modifier/{newValue}
 *  Parameters
 *  - {newValue}: Decimal value
 *  Return
 *  - Response code
 *  - Decimal value
 */
server.on('modifier', function (request, response, db) {
    if (request.method == 'POST') {
        // POST, update the modifier
        var url = URL.parse(request.url, true).path;
        var temp = url.split('?')[0];
        var temp = temp.split('/');
        var newValue = temp[temp.length - 1];
        var val = parseFloat(newValue);
        if (!isNaN(val)) {
            db.modifier = val;
            fs.writeFileSync(__dirname + '/data/xcrates.json', JSON.stringify(db));
            var msg = "Updated modifier to " + val + ".";
            response.write(JSON.stringify({
                "code": 200,
                "message": msg,
                "data": {
                    "modifier": val
                }
            }));
        } else {
            // 400: Bad Request
            var msg = "Expected a number. Currency service modifier is still " + db.modifier + ".";
            response.write(JSON.stringify({
                "code": 400,
                "message": msg
            }));
        }
    } else if (request.method == 'GET') {
        // GET, get the modifier
        response.write(JSON.stringify({
            "code": 200,
            "data": {
                "modifier": String(db.modifier)
            }
        }));
    }
    response.end();
});

/*  GET /currency/rates/source
 *   Return
 *   - Response code
 *   - String
 *  POST /currency/rates/source/{newSource}
 *   Parameters
 *   - String
 *   Return
 *   - Response code
 *   - String
 */
server.on('source', function (request, response, db) {
    if (request.method == 'POST') {
        // POST, update the source of exchange rates
        var url = URL.parse(request.url, true).path;
        var temp = url.split('?')[0];
        var temp = temp.split('/');
        var source = temp[temp.length - 1].toLowerCase();
        var res = {
                "code": 200,
                "data": {},
                "message": undefined
            }
        if (source.indexOf("yahoo") != -1){
            db.source = "yahoo";
            fs.writeFileSync(__dirname + '/data/xcrates.json', JSON.stringify(db));
            res.data.source = db.source;
            res.message = "Currency service is now using Yahoo rates.";
        } else if (source.indexOf("local") != -1){
            db.source = "local";
            fs.writeFileSync(__dirname + '/data/xcrates.json', JSON.stringify(db));
            res.data.source = db.source;
            res.message = "Currency service is now using local rates.";
        } else {
            res.code = 400;
            res.message = "Invalid source specified. Currency service source is still using " + db.source + " rates.";
        }
        response.write(JSON.stringify(res));
    } else if (request.method == 'GET') {
        // GET, get the source of exchange rates
        response.write(JSON.stringify({
            "code": 200,
            "data": {
                "source": db.source
            }
        }));
    }
    response.end();
});