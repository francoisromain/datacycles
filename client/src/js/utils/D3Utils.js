var d3 = require('d3');

module.exports = {
  // calculate 
    // minimum, maximum x values,
    // minimum, maximum y values
    // size of data set
    // array of xvalues -> x_values
    // array of yvalues -> y_values
  calculatePosition: function(width, height, data, x_key, y_key){

    var min_x = d3.min(data, function(d) { return d[x_key]; })
    var max_x = d3.max(data, function(d) { return d[x_key]; })

    var min_y = d3.min(data, function(d) { return d[y_key]; })
    var max_y = d3.max(data, function(d) { return d[y_key]; })

    var data_size= data.length;

    var y_values = data.map(function(d) { return d[y_key]; })
    var x_values = data.map(function(d) { return d[x_key]; })

    var domain = {
      x: [min_x, max_x],
      y: [min_y, max_y]
    };
    return {domains: domain, data_length: data_size, x_values: x_values, y_values: y_values };
  },
  // create a tooltip for the charts
  setupTooltip: function(parentNode){
    var tooltip = d3.select(parentNode).append("div");
    tooltip.attr("class", "tooltip top-right");
    tooltip.append("div").attr("class", "tooltip-inner");
    tooltip.style("opacity", 0);
    return tooltip;
  },
  // setup d3 color scale
  calculateColor: function(domain, range){
    if(range){
      var color = d3.scale.linear()
      .domain(domain)
      .range(range);  
    } else {
      var color = d3.scale.category10()
      .domain(domain);
    }
    return color;
  },
  // setup d3 radius scale
  calculateRadius: function(domain, range){
    var rScale = d3.scale.linear()
       .domain(domain)
       .range(range);
    return rScale;
  }
};

