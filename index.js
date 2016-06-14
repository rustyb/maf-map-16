'use strict';
mapboxgl.accessToken = 'pk.eyJ1IjoiZW50c29lIiwiYSI6ImNpb2xnNHcydTAwMXF3YW1iZmJjNXh1OGsifQ.frc5MlZWaMjTMbtaJbRZPw';

// Node modules that browserify supports
var fs = require('fs');
var path = require('path');
var groupBy = require('lodash.groupby');

// data
var cos = JSON.parse(fs.readFileSync(path.join(__dirname, '/data/colour-desc.js'), 'utf8'));

var map = new mapboxgl.Map({
        container: 'map', // container id
        style: 'mapbox://styles/entsoe/ciolfu1af0095djknovvmez43', //stylesheet location
        center: [19.56,52.41], // starting position
        zoom: 3, // starting zoom
        hash: true,
        maxZoom: 3.42,
        minZoom: 2.5,
        attributionControl: false
    });

if (window.location.search.indexOf('embed') !== -1) map.scrollZoom.disable();

// add a nav control
map.addControl(new mapboxgl.Navigation({position: 'top-left'}));
// disable map rotation using right click + drag
map.dragRotate.disable();

var colours = [
      ["1", 'rgba(99,150,138,1)'], 
      ["2", 'rgba(80,160,171,1)'], 
      ["3", 'rgba(29,56,103,1)'],
      ["4", 'rgba(229,91,37,1)']
    ]

var legend = document.getElementById('map-legend');

var list = document.createElement('div');

cos.forEach(function(layer, i) {

  var item = document.createElement('div');
  var title = document.createElement('div');
  item.className = 'pad0';
  item.style.backgroundColor = colours[i][1];
  
  title.textContent = layer['desc']
  title.className = 'dark pad0';

  item.appendChild(title);
  list.appendChild(item);
});

legend.appendChild(list);

function initializeMap() {
  document.body.classList.remove('loading');
  map.addSource("ee_countries", {
      "type": "geojson",
      "data": "./data/nc.geojson"
  });

  
    
  //var colours = ['rgba(0,0,0,1)']

  for(var i=0; i < colours.length; i++) {
    var volt = i;
    map.addLayer({
      "id": "polys-"+volt,
      "source": "ee_countries",
      "type": "fill",
      "interactive": true,
      "filter": ["all", ["==", "$type", "Polygon"],["==", "colour", colours[i][0]]],
      "paint": {
        "fill-color": colours[i][1],
        "fill-opacity": 0.5,
        "fill-outline-color": colours[i][1]
      }
    });
  }

  map.addLayer({
      "id": "route-hover",
      "type": "fill",
      "source": "ee_countries",
      "layout": {},
      "paint": {
          "fill-color": "rgba(102,103,105,0.75)",
          "fill-opacity": 1
      },
      "filter": ["==", "admin", ""]
  });
}

// When the user moves their mouse over the page, we look for features
// at the mouse position (e.point) and within the states layer (states-fill).
// If a feature is found, then we'll update the filter in the route-hover
// layer to only show that state, thus making a hover effect.


// Create a popup, but don't add it to the map yet.
var popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
});

map.on("mousemove", function(e) {
  var features = map.queryRenderedFeatures(
                  e.point, { layers: colours.map(function(colours, i) {
                    return 'polys-' + i;
                  }) 
                });

  // Change the cursor style as a UI indicator.
  map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';

  if (features.length) {
      map.setFilter("route-hover", ["==", "admin", features[0].properties.admin]);
      map.setPaintProperty('route-hover', 'fill-color', 'rgba(102,103,105,0.75)');
  } else {
      map.setFilter("route-hover", ["==", "admin", ""]);
      popup.remove();
      return;
  }
  
  var feature = features[0];
  var p = feature.properties;
  var popupContainer = document.createElement('div');

  // Look up proper decsription for each
  cos.forEach(function(c) {
    p.desc = p.colour == c["colour"] ? c.desc : p.desc;
  });


  [[p.ENS, p.LOLE]].forEach(function(d) {
    var item = document.createElement('div');
    var label = document.createElement('div');
    label.className = 'space-right0 keyline-bottom pad1';
    label.textContent = 'ENS (MWh) - Average 4 MAPS (all tools): ' + parseFloat(d[0]).toFixed(2);
    
    var value = document.createElement('div');
      value.className = 'keyline-bottom pad1';
      value.textContent = 'LOLE - Average 4 MAPS (all tools): ' + parseFloat(d[1]).toFixed(2);

      item.appendChild(label);
      item.appendChild(value);
      popupContainer.appendChild(item);
  });
  
  // Populate the popup and set its coordinates
  // based on the feature found.
  popup.setLngLat(map.unproject(e.point))
      .setHTML(popupContainer.innerHTML)
      .addTo(map);

});

map.on('load', initializeMap);
