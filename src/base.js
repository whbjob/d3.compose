(function(d3, _, helpers, extensions) {
  var property = helpers.property;
  
  /**
    Base
    Shared functionality between all charts, components, and containers

    Properties:
    - {Object|Array} data Store fully-transformed data
    - {Object} style Overall style of chart/component
  */
  d3.chart('Base', {
    initialize: function(options) {
      this.options = options || {};

      // Call any setters that match options
      _.each(this.options, function(value, key) {
        if (this[key] && this[key]._isProperty && this[key].setFromOptions)
          this[key](value);
      }, this);

      // Bind all di-functions to this chart
      helpers.bindAllDi(this);
    },

    data: property('data', {
      set: function(data) {
        // This trigger is relied on by other components
        // and must be called even when the data doesn't necessarily change
        // TODO Look into why it needs to called every time (even on no change)
        this.trigger('change:data', data);
      }
    }),
    style: property('style', {
      get: function(value) {
        return helpers.style(value) || null;
      }
    }),

    width: function width() {
      return helpers.dimensions(this.base).width;
    },
    height: function height() {
      return helpers.dimensions(this.base).height;
    },

    transform: function(data) {
      // Base is last transform to be called,
      // so stored data has been fully transformed
      this.data(data || []);
      return data || [];
    }
  });

  /**
    Chart: Foundation for building charts with series data
  */
  d3.chart('Base').mixin(extensions.Series).extend('Chart');

  /**
    Container

    Foundation for chart and component placement
  */
  d3.chart('Base').extend('Container', {
    initialize: function() {
      this.charts = [];
      this.chartsById = {};
      this.components = [];
      this.componentsById = {};

      // Overriding transform in init jumps it to the top of the transform cascade
      // Therefore, data coming in hasn't been transformed and is raw
      // (Save raw data for redraw)
      this.transform = function(data) {
        this.rawData(data);
        return data;
      };

      this.base.classed('chart', true);
      this.chartBase(this.base.append('g').classed('chart-base', true));

      this.on('change:dimensions', function() {
        this.redraw();
      });
    },

    draw: function(data) {
      // Explicitly set width and height of container
      this.base
        .attr('width', this.width())
        .attr('height', this.height());

      // Pre-draw for accurate dimensions for layout
      this._preDraw(data);

      // Layout now that components' dimensions are known
      this.updateLayout();

      // Full draw now that everything has been laid out
      d3.chart().prototype.draw.call(this, data);
    },

    redraw: function() {
      // Using previously saved rawData, redraw chart      
      if (this.rawData())
        this.draw(this.rawData());
    },

    attachChart: function(id, chart) {
      chart.id = id;
      this.attach(id, chart);
      this.charts.push(chart);
      this.chartsById[id] = chart;
    },

    attachComponent: function(id, component) {
      component.id = id;
      this.attach(id, component);
      this.components.push(component);
      this.componentsById[id] = component;

      component.on('change:position', function() {
        this.trigger('change:dimensions');
      });
    },

    componentBase: function() {
      // Return new group so that "this.base" can be translated within component
      return this.base.append('g').attr('class', 'chart-component');
    },

    updateLayout: function() {
      var layout = this._extractLayout();
      this._updateChartMargins(layout);
      this._positionChartBase();
      this._positionComponents(layout);
    },

    rawData: property('rawData'),
    chartBase: property('chartBase'),

    // Chart margins from Container edges ({top, right, bottom, left})
    chartMargins: property('chartMargins', {
      get: function(values) {
        values = (values && typeof values == 'object') ? values : {};
        values = _.defaults(values, {top: 0, right: 0, bottom: 0, left: 0});

        return values;
      },
      set: function(values, previous) {
        values = (values && typeof values == 'object') ? values : {};
        values = _.defaults(values, previous, {top: 0, right: 0, bottom: 0, left: 0});

        return {
          override: values,
          after: function() {
            this.trigger('change:dimensions');
          }
        };
      }
    }),
    
    chartWidth: function() {
      var margins = this._chartMargins();
      return this.width() - margins.left - margins.right;
    },
    chartHeight: function() {
      var margins = this._chartMargins();
      return this.height() - margins.top - margins.bottom;
    },

    width: property('width', {
      defaultValue: function() {
        return helpers.dimensions(this.base).width;
      },
      set: function(value) {
        this.trigger('change:dimensions');
      }
    }),
    height: property('height', {
      defaultValue: function() {
        return helpers.dimensions(this.base).height;
      },
      set: function(value) {
        this.trigger('change:dimensions');
      }
    }),

    _preDraw: function(data) {
      _.each(this.componentsById, function(component, id) {
        if (!component.skipLayout)
          component.draw(this.demux ? this.demux(id, data) : data);
      }, this);
    },

    _positionChartBase: function() {
      var margins = this._chartMargins();

      this.chartBase()
        .attr('transform', helpers.transform.translate(margins.left, margins.top))
        .attr('width', this.chartWidth())
        .attr('height', this.chartHeight());
    },

    _positionComponents: function(layout) {
      var margins = this._chartMargins();
      var width = this.width();
      var height = this.height();
      var chartWidth = this.chartWidth();
      var chartHeight = this.chartHeight();

      _.reduce(layout.top, function(previous, part, index, parts) {
        var y = previous - part.offset;
        setLayout(part.component, margins.left, y, {width: chartWidth});
        
        return y;
      }, margins.top);

      _.reduce(layout.right, function(previous, part, index, parts) {
        var previousPart = parts[index - 1] || {offset: 0};
        var x = previous + previousPart.offset;
        setLayout(part.component, x, margins.top, {height: chartHeight});

        return x;
      }, width - margins.right);

      _.reduce(layout.bottom, function(previous, part, index, parts) {
        var previousPart = parts[index - 1] || {offset: 0};
        var y = previous + previousPart.offset;
        setLayout(part.component, margins.left, y, {width: chartWidth});

        return y;
      }, height - margins.bottom);

      _.reduce(layout.left, function(previous, part, index, parts) {
        var x = previous - part.offset;
        setLayout(part.component, x, margins.top, {height: chartHeight});

        return x;
      }, margins.left);

      function setLayout(component, x, y, options) {
        if (component && _.isFunction(component.setLayout))
          component.setLayout(x, y, options);
      }
    },

    // Update margins from components layout
    _updateChartMargins: function(layout) {
      var margins = this.chartMargins();
      _.each(layout, function(parts, key) {
        _.each(parts, function(part) {
          margins[key] += part.offset || 0;
        });
      });
      this._chartMargins(margins);

      return margins;
    },

    // Extract layout from components
    _extractLayout: function() {
      var layout = {top: [], right: [], bottom: [], left: []};
      _.each(this.components, function(component) {
        if (component.skipLayout)
          return;

        var position = component.layoutPosition();
        if (!_.contains(['top', 'right', 'bottom', 'left'], position))
          return;

        var offset;
        if (position == 'top' || position == 'bottom')
          offset = component.layoutHeight();
        else
          offset = component.layoutWidth();
        

        layout[position].push({
          offset: offset,
          component: component
        });
      });

      return layout;
    },

    // Internal chart margins to separate from user-defined margins
    _chartMargins: property('_chartMargins', {
      defaultValue: function() {
        return _.extend({}, this.chartMargins());
      }
    }),
  });
  

})(d3, _, d3.chart.helpers, d3.chart.extensions);
