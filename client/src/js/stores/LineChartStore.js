var assign = require('object-assign');
var EventEmitter = require('events').EventEmitter;
var D3Dispatcher = require('../dispatcher/D3Dispatcher');
// var ThreadStore = require('./ThreadStore');
var Constants = require('../constants/D3Constants.js');
var d3 = require('d3');
var _messages = {};
var actions = Constants.actions;
var CHANGE_EVENT = "change";

var parseDate = d3.time.format("%m/%d/%Y %H:%M").parse;

function _addMessages(data_for, msgs){

  var activity = msgs.map(function(station) {
    return {
      name: station.key,
      values: station.activity_per_hour.buckets.map(function(d) {
        return {date: parseDate(d.key_as_string), activity: +d.doc_count};
      }),
      visible: true
    };
  });

  _messages[data_for] = {
      raw_data: msgs,
      activity: activity
  };

}

var LineChartStore = assign({}, EventEmitter.prototype, {
  
  emitChange: function(id){
    this.emit(CHANGE_EVENT, id);
  },
  addChangeListener: function(callback){
    this.on(CHANGE_EVENT, callback);
  },
  removeChangeListener: function(callback){
    this.removeListener(CHANGE_EVENT, callback);
  },
  getAll: function(id){
    return _messages[id];
  }

});


LineChartStore.dispatchToken = D3Dispatcher.register(function(action){
  switch(action.type){

    case actions.RECEIVE_LINE_DATA:
      _addMessages(action.data_for, action.data);
      LineChartStore.emitChange(action.data_for);
      break;

    default:
      // do nothing
  }
});

module.exports = LineChartStore;