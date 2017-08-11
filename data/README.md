Files in this folder:
geonames_data.sql -- Database of locations with their geonameIDs and names in other languages
listoflanguages.txt -- List of supported languages
parser.js, index.js -- The scripts I wrote to parse the data

Data was parsed from:
http://download.geonames.org/export/dump/

Included in the database are any locations which are a part of the geonames hierarchy directory, and fit into one of the following categories as defined here:
http://www.geonames.org/export/codes.html

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
