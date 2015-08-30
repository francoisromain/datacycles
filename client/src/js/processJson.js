var bikeRoutes = require('../json/bikeRoutesJson');
var Docks = require('../json/docksPositionJson');

module.exports = {
  calcDockHash: function () {
    var i;
    var tripHash = {};
    var mins = 0;
    var hours = 0;
    for (i = 0; i < 1440; i++) {
      var time = this.countTime(hours, mins);
      hours = time[0];
      mins = time[1];
      time = time.join(":");
      tripHash[time] = {
        "starting_trips": [],
        "ending_trips": []
      };
    };
    return tripHash;
  },

  countTime: function (hours, mins) {
    var countHours, countMins;
    mins++;
    if (mins === 60) {
      hours++;
      mins = 0;
      if (hours === 24) {
        hours = 0;
      }
    }

    countHours = hours;

    if (mins < 10) {
      countMins = "0" + mins;
    } else {
      countMins = "" + mins;
    }
    return [countHours, countMins];
  },

  buildDocksHash: function (tripJson, dockInit) {
    var hits = tripJson.length;
    var dockHash = this.calcDockHash();
    var docks = new Docks();

    for (var i = 0; i < hits; i++) {
      var trip = tripJson[i];

      if (trip) {
        var startTime = trip.start_date.split(" ")[1];
        var endTime = trip.end_date.split(" ")[1];

        dockHash[startTime].starting_trips.push(trip.start_terminal);

        if (trip.start_date.split(" ")[0] === trip.end_date.split(" ")[0]) {
          dockHash[endTime].ending_trips.push(trip.end_terminal);
        }
      }
    };

    for (var k = 0; k < docks.docksJson.features.length; k++) {
      if (dockInit[k]) {
        docks.docksJson.features[k].properties.activity.push({
          "time": "0:00",
          "bikes_available": parseInt(dockInit[k].bikes_available)
        });
      } else {
        docks.docksJson.features[k].properties.activity.push({
          "time": "0:00",
          "bikes_available": parseInt(docks.docksJson.features[k].properties.places)
        });
      }
    };

    for (var key in dockHash) {
      if (dockHash[key].starting_trips.length) {
        for (var l = 0; l < dockHash[key].starting_trips.length; l++) {
          for (var m = 0; m < docks.docksJson.features.length; m++) {
            if (parseInt(dockHash[key].starting_trips[l]) === docks.docksJson.features[m].properties.id) {
              var bikes = parseInt(docks.docksJson.features[m].properties.activity[docks.docksJson.features[m].properties.activity.length - 1].bikes_available);
              bikes = bikes - 1 > 0 ? bikes - 1 : 0
              docks.docksJson.features[m].properties.activity.push({
                "time": key,
                "bikes_available": bikes
              })
            }
          }
        }
      }
      if (dockHash[key].ending_trips.length) {
        for (var l = 0; l < dockHash[key].ending_trips.length; l++) {
          for (var m = 0; m < docks.docksJson.features.length; m++) {
            if (parseInt(dockHash[key].ending_trips[l]) === docks.docksJson.features[m].properties.id) {
              docks.docksJson.features[m].properties.activity.push({
                "time": key,
                "bikes_available": parseInt(docks.docksJson.features[m].properties.activity[docks.docksJson.features[m].properties.activity.length - 1].bikes_available) + 1
              })
            }
          }
        }
      }
    };
    return docks.docksJson;
  },

  buildBikesJson: function(json) {
    var hits = json.length;
    var bikesJson = {
      "type": "FeatureCollection",
      "features": []
    };
    for (var i = 0; i < hits; i++) {
      var trip = json[i];
      if (trip) {
        var duration = trip["trip_duration"];
        var startTerminal = trip["start_terminal"];
        var startStation = trip["start_station"];
        var endTerminal = trip["end_terminal"];
        var endStation = trip["end_station"];
        var bikeID = trip["bike_id"];
        var tempStart = trip["start_date"].split(" ");
        var tempEnd = trip["end_date"].split(" ");
        var startDate = tempStart[0];
        var startTime = tempStart[1];
        var endDate = tempEnd[0];
        var endTime = tempEnd[1];
        var bikeJson = this.buildBikeJson(duration, startTerminal, startDate, startTime, endTerminal, endDate, endTime, bikeID, i, startStation, endStation);
        if (bikeJson) {
          bikesJson.features.push(bikeJson);
        }
      }
    };
    return bikesJson;
  },

  buildBikeJson: function(duration, startTerminal, startDate, startTime, endTerminal, endDate, endTime, bikeID, tripID, startStation, endStation) {
    var coordinates = bikeRoutes[startTerminal + "-" + endTerminal];
    var geoJson = null;
    if (!coordinates) {
      if (duration <= 240) {
        var coordinates = bikeRoutes[startTerminal + "-" + endTerminal + "s"];
      } else if (duration > 240 && duration <= 600) {
        var coordinates = bikeRoutes[startTerminal + "-" + endTerminal + "m"];
      } else if (duration > 600) {
        var coordinates = bikeRoutes[startTerminal + "-" + endTerminal + "l"];
      }
    }
    if (coordinates) {
      geoJson = {
        "type": "Feature",
        "properties": {
          "duration": duration,
          "id": tripID,
          "bikeID": bikeID,
          "startDate": startDate,
          "startTime": startTime,
          "endDate": endDate,
          "endTime": endTime,
          "startTerminal": startTerminal,
          "endTerminal": endTerminal,
          "startStation": startStation,
          "endStation": endStation
        },
        "geometry": {
          "type": "LineString",
          "coordinates": coordinates.geometry.coordinates
        }
      };
    } else console.log('coords not found', startTerminal, " and ", endTerminal)
    return geoJson;
  }
}
