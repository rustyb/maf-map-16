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
        zoom: 2, // starting zoom
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



// related to the functioning of the slider for showing the scenarios

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

var maps = ['final_final_map'];


var types = [['Base Case', 0], ['Sensitivity (1)', 0.3], ['Sensitivity (2)', 0.5]]

var monthLabel = document.getElementById('month');

var label = ['ENS_1', 'lole_1']

function filterBy(type, index) {
    // Clear the popup if displayed.
    popup.remove();



    var filters = [
        "all",
        ["has", "lole_" + (index+1)],
        [">=", ("lole_" + (index+1)), types[index][1]],
        [">=", ("ENS_" + (index+1)), types[index][1]]
    ];

    map.setFilter('polys-map', filters);

    // Set the label to the month
    monthLabel.textContent = types[index][0]
    label = [("ENS_" + (index+1)), ("lole_" + (index+1))]
}

var monthLabel = document.getElementById('month');



function initializeMap() {
  document.body.classList.remove('loading');
  
  
      map.addSource('final-map', {
        "type": "geojson",
        "data": "./data/final_final_map.geojson"
    });

    map.addLayer({
    "id": "polys-map",
    "source": 'final-map',
    "type": "fill",
    "interactive": true,
    "filter": ["all", ["==", "$type", "Polygon"], ["has", 'ENS_1']],
    "paint": {
      "fill-color": "#6e599f",
      "fill-opacity": 0.5,
      "fill-outline-color": "#484896"
    }
  });

  map.addSource('change', {
      "type": "geojson",
      "data": "./data/final_demand.geojson"
  });

  map.addLayer({
        'id': 'countries',
        'source': 'change',
        'type': 'fill',
        'filter': ['has', 'change'],
        'layout': {
          'visibility': 'none'
        },
        'paint': {
            'fill-color': {
                property: 'change',
                stops: [
                    [0, '#F2F12D'],
                    [1.1, '#EED322'],
                    [2.2, '#E6B71E']
                ]
            },
            'fill-opacity': 0.75
        }
    }, 'waterway-label');
    
    var toggelLayer = document.getElementById('toggle');
    console.log(toggelLayer);
toggelLayer.addEventListener('click', function() {
    if (toggelLayer.className == 'button active') {
      map.setLayoutProperty('countries', 'visibility', 'none');
      map.setLayoutProperty('polys-map', 'visibility', 'visible');
      toggelLayer.className = 'button'
    } else {
      map.setLayoutProperty('countries', 'visibility', 'visible');
      map.setLayoutProperty('polys-map', 'visibility', 'none');
      toggelLayer.className = 'button active'
    }
        
    });
// Set filter to first month of the year +
            // Magnitude rating. 0 = January
            filterBy(1, 0);
  // map.addLayer({
  //     "id": "route-hover-"+maps[i],
  //     "type": "fill",
  //     "source": maps[i],
  //     "layout": {},
  //     "paint": {
  //         "fill-color": "rgba(102,103,105,0.75)",
  //         "fill-opacity": 1
  //     },
  //     "filter": ["==", "admin", ""]
  // });
  
      
  //var colours = ['rgba(0,0,0,1)']

    
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


document.getElementById('slider').addEventListener('input', function(e) {
            var month = parseInt(e.target.value, 10);
            filterBy(1, month);
            
        });




map.on("mousemove", function(e) {
  var features = map.queryRenderedFeatures(
                  e.point, { layers: ['polys-map']
                });

  // Change the cursor style as a UI indicator.
  map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';

  // if (features.length) {
  //     map.setFilter("route-hover", ["==", "admin", features[0].properties.admin]);
  //     map.setPaintProperty('route-hover', 'fill-color', 'rgba(102,103,105,0.75)');
  // } else {
  //     map.setFilter("route-hover", ["==", "admin", ""]);
  //     popup.remove();
  //     return;
  // }
  if (!features.length) {
    popup.remove()
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
      .setHTML('<h3>'+p['name']+'</h3><strong>ENS: '+Math.round(p[label[0]]) +'</strong><br>'+'<strong>LOLE: '+p[label[1]].toFixed(1)+'</strong>')
      .addTo(map);

});

map.on('load', initializeMap);
