Gazetteer Service
=================

This gazetteer service returns information about locations, their corresponding countries, regions, and cities, and their names in different languages. All of the data for this service was parsed from <a href="www.geonames.org/">GeoNames</a>. This gazetteer also provides a currency service. The currency service and endpoints are copied from <a href="https://github.com/kylechua/currencyRateService">this source.</a>

---

### GET /v2/gazetteer/locations
* Queries
    * lang={ISO 639 language code}
    * country={ISO alpha-2 country code}
    * region={GeoNames ID}
    * If country but no region specified, will return a list of regions
    * If country and region specified, will return a list of cities within the region
    * Else returns a list of countries
    * Example: /v2/gazetteer/locations?lang=ko&country=us will fetch a list of states in the USA, with their names in Korean
* Return
    * JSON array of locations
        * id: GeoNames ID
        * key: Default name of location
        * country: ISO alpha-2 country code
        * name: Location name in the given language (if does not exist in data, default name)
    * Response code