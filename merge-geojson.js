'use strict';
var fs = require('fs'),
	path = require('path'),
	indexBy = require('101/index-by'),
	assign = require('101/assign')

// data
var againstData = JSON.parse(fs.readFileSync(path.join(__dirname, '/data/map1.json'), 'utf8'));
var cons = JSON.parse(fs.readFileSync(path.join(__dirname, '/data/ee_countries.geojson'), 'utf8'));

var against = indexBy(againstData, "country");

var outfeautres = []
cons.features.forEach(function(feature) {
    var geojsonVal = feature.properties["iso_a2"];
	var match = against[geojsonVal];
	if (match) {
        assign(feature.properties, match);
    } else {
        console.error('found no match for geojsonField=%s', geojsonVal);
    }
    outfeautres.push(feature);
  });

var geojson = {
	"type":"FeatureCollection",
	"features": outfeautres
}

var dataLayer = JSON.stringify(geojson)

console.log(dataLayer);