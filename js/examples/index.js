/* global d3, d3c, _, examples */
/* eslint no-new-func:0, no-use-before-define:0 */
(function(examples) {

  function sequence(range, step) {
    var sequenced = [];

    for (var i = range[0]; i < range[1]; i += step) {
      sequenced.push(i);
    }
    sequenced.push(range[1]);

    return sequenced;
  }

  function generate(values, fn) {
    return values.map(function(x, i) {
      return {
        x: x,
        y: fn(x, i, values)
      };
    });
  }

  function random(range) {
    return Math.round(range[0] + Math.random() * (range[1] - range[0]));
  }

  function randomize(range) {
    return function() {
      return random(range);
    };
  }

  function increasing(min, step) {
    var value = min || 0;
    step = step || 10;

    return function() {
      value = random([value - (step / 4), value + (step / 4 * 3)]);
      return value;
    };
  }

  examples.data = {
    single: {
      series: [
        {
          key: 'a', name: 'A', values: generate(sequence([0, 100], 10), randomize([0, 25]))
        },
        {
          key: 'b', name: 'B', values: generate(sequence([0, 100], 10), function(x) { return 100 - 0.03 * Math.pow(x - 50, 2); })
        }
      ]
    },
    combined: {
      series: {
        input: [
          {
            key: 'input',
            name: 'Input',
            values: generate(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'], increasing(150, 25))
          }
        ],
        output: [
          {
            key: 'a',
            name: 'A',
            values: generate(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'], randomize([0, 25]))
          },
          {
            key: 'b',
            name: 'B',
            values: generate(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'], randomize([0, 75]))
          }
        ]
      }
    }
  };

  //
  // Lines
  //

  examples.lines = {
    generate: function(options) {
      var fn = buildFn(function() {
        var scales = {
          x: {data: options.data, key: 'x'},
          y: {data: options.data, key: 'y'}
        };

        var charts = [
          d3c.lines('results', {
            data: options.data,
            xScale: scales.x,
            yScale: scales.y
          })
        ];

        var title = d3c.title(options.title.text);
        var xAxis = d3c.axis('xAxis', {scale: scales.x, ticks: 5});
        var yAxis = d3c.axis('yAxis', {scale: scales.y, ticks: 5});

        return [
          title,
          [yAxis, d3c.layered(charts)],
          xAxis
        ];
      });

      return {
        output: wrapFn(fn),
        fn: new Function('options', fn)
      };
    },

    options: {
      include: {
        xy: {
          name: 'Use d3.compose.xy',
          default_value: false
        },

        title: {
          name: 'Title',
          default_value: true,

          options: {
            text: {
              name: 'Chart Title Text',
              type: 'text',
              default_value: 'Lines Chart'
            }
          }
        }
      }
    },

    data: examples.data.single
  };

  //
  // Bars
  //

  examples.bars = {
    generate: function(options) {
      var fn = buildFn(function() {
        var scales = {
          x: {type: 'ordinal', data: options.data, key: 'x', adjacent: true},
          y: {domain: [0, 120]}
        };

        var charts = [
          d3c.bars('results', {
            data: options.data,
            xScale: scales.x,
            yScale: scales.y
          })
        ];

        var title = d3c.title(options.title.text);
        var xAxis = d3c.axis('xAxis', {scale: scales.x, ticks: 5});
        var yAxis = d3c.axis('yAxis', {scale: scales.y, ticks: 5});
        var legend = d3c.legend({charts: ['results']});

        return [
          title,
          [yAxis, d3c.layered(charts), legend],
          xAxis
        ];
      });

      return {
        output: wrapFn(fn),
        fn: new Function('options', fn)
      };
    },

    options: {
      include: {
        title: {
          name: 'Title',
          default_value: true,

          options: {
            text: {
              name: 'Chart Title Text',
              type: 'text',
              default_value: 'Bars Chart'
            }
          }
        }
      }
    },

    data: examples.data.single
  };

  //
  // Stacked Bars
  //

  examples['stacked-bars'] = {
    generate: function(options) {
      var fn = buildFn(function() {
        var scales = {
          x: {type: 'ordinal', data: options.data, key: 'x', adjacent: false},
          y: {domain: [0, 120]}
        };

        var charts = [
          d3c.stackedBars('results', {
            data: options.data,
            xScale: scales.x,
            yScale: scales.y
          })
        ];

        var title = d3c.title('Stacked Bars');
        var xAxis = d3c.axis('xAxis', {scale: scales.x, ticks: 5});
        var yAxis = d3c.axis('yAxis', {scale: scales.y, ticks: 5});
        var legend = d3c.legend({charts: ['results']});

        return [
          title,
          [yAxis, d3c.layered(charts), legend],
          xAxis
        ];
      });

      return {
        output: wrapFn(fn),
        fn: new Function('options', fn)
      };
    },

    options: {
      include: {
        title: {
          name: 'Title',
          default_value: true,

          options: {
            text: {
              name: 'Chart Title Text',
              type: 'text',
              default_value: 'Bars Chart'
            }
          }
        }
      }
    },
    data: examples.data.single
  };

  //
  // Horizontal Bars
  //

  examples['horizontal-bars'] = {
    generate: function(options) {
      var fn = buildFn(function() {
        var scales = {
          x: {type: 'ordinal', data: options.data, key: 'x', adjacent: true},
          y: {domain: [0, 120]}
        };

        var charts = [
          d3c.horizontalBars('results', {
            data: options.data,
            xScale: scales.x,
            yScale: scales.y,
            duration: 1000
          })
        ];

        var title = d3c.title(options.title.text);
        var xAxis = d3c.axis('xAxis', {scale: scales.x, ticks: 5, duration: 1000});
        var yAxis = d3c.axis('yAxis', {scale: scales.y, ticks: 5, duration: 1000});

        return [
          title,
          [xAxis, d3c.layered(charts)],
          yAxis
        ];
      });

      return {
        output: wrapFn(fn),
        fn: new Function('options', fn)
      };
    },

    options: {
      include: {
        title: {
          name: 'Title',
          default_value: true,

          options: {
            text: {
              name: 'Chart Title Text',
              type: 'text',
              default_value: 'Horizontal Bars'
            }
          }
        }
      }
    },

    data: examples.data.single
  };

  //
  // Horizontal Stacked Bars
  //

  examples['horizontal-stacked-bars'] = {
    generate: function(options) {
      var fn = buildFn(function() {
        var scales = {
          x: {type: 'ordinal', data: options.data, key: 'x', adjacent: false},
          y: {domain: [0, 120]}
        };

        var charts = [
          d3c.horizontalStackedBars('results', {
            data: options.data,
            xScale: scales.x,
            yScale: scales.y
          })
        ];

        var title = d3c.title('Stacked Bars');
        var xAxis = d3c.axis('xAxis', {scale: scales.x, ticks: 5});
        var yAxis = d3c.axis('yAxis', {scale: scales.y, ticks: 5});

        return [
          title,
          [xAxis, d3c.layered(charts)],
          yAxis
        ];
      });

      return {
        output: wrapFn(fn),
        fn: new Function('options', fn)
      };
    },

    options: {},
    data: examples.data.single
  };

  //
  // Lines and Bars
  //

  examples['lines-and-bars'] = {
    // TODO Giving legend key of "legend" causes weird issues
    generate: function(options) {
      var fn = buildFn(function() {
        var input = options.data.input;
        var output = options.data.output;
        var scales = {
          x: {type: 'ordinal', data: output, key: 'x', adjacent: true},
          y: {data: input, key: 'y'},
          y2: {domain: [0, 100]}
        };

        var charts = [
          d3c.lines('input', {
            data: input,
            xScale: scales.x,
            yScale: scales.y,
            duration: 1000
          }),
          d3c.bars('output', {
            data: output,
            xScale: scales.x,
            yScale: scales.y2,
            duration: 1000
          })
        ];

        var title = d3c.title('Multiple Charts');
        var xAxis = d3c.axis('xAxis', {scale: scales.x, duration: 1000});
        var xAxisTitle = d3c.axisTitle('Trial');
        var yAxis = d3c.axis('yAxis', {scale: scales.y, duration: 1000});
        var yAxisTitle = d3c.axisTitle('Input');
        var y2Axis = d3c.axis('y2Axis', {scale: scales.y2, duration: 1000});
        var y2AxisTitle = d3c.axisTitle('Output');
        var legend = d3c.legend({charts: ['input', 'output'], centered: true});

        return [
          title,
          [yAxisTitle, yAxis, d3c.layered(charts), y2Axis, y2AxisTitle],
          xAxis,
          xAxisTitle,
          legend
        ];
      });

      return {
        output: wrapFn(fn),
        fn: new Function('options', fn)
      };
    },

    data: examples.data.combined,
    options: {}
  };

  //
  // Custom Chart
  //

  examples['custom-chart'] = {
    generate: function(options) {
      var fn = buildFn(function() {
        var scales = {
          x: {data: options.data, key: 'x'},
          y: {data: options.data, key: 'y'}
        };

        var charts = [
          d3c.lines('input', {
            data: options.data,
            xScale: scales.x,
            yScale: scales.y
          }),
          {
            type: 'Dots',
            id: 'dots',
            data: options.data,
            xScale: scales.x,
            yScale: scales.y,
            rValue: 5
          }
        ];

        var title = d3c.title('Custom Chart');
        var xAxis = d3c.axis('xAxis', {scale: scales.x, ticks: 5});
        var yAxis = d3c.axis('yAxis', {scale: scales.y, ticks: 5});

        return [
          title,
          [yAxis, d3c.layered(charts)],
          xAxis
        ];
      });

      return {
        output: fnBody(dependencies.dots) + '\n\n' + wrapFn(fn),
        fn: new Function('options', fn)
      };
    },

    data: examples.data.single,
    options: {}
  };

  //
  // Custom Component
  //

  examples['custom-component'] = {
    generate: function(options) {
      var fn = buildFn(function() {
        var scales = {
          x: {data: options.data, key: 'x'},
          y: {data: options.data, key: 'y'}
        };

        var charts = [
          d3c.lines('input', {
            data: options.data,
            xScale: scales.x,
            yScale: scales.y
          }),
          d3c.labels('label', {
            data: [{x: 14.5, y: 100, label: 'x = 14.5'}],
            xScale: scales.x,
            yScale: scales.y,
            position: 'right',
            offset: {x: 5, y: 5}
          })
        ];

        var title = d3c.title('Custom Component');
        var xAxis = d3c.axis('xAxis', {scale: scales.x, ticks: 5});
        var yAxis = d3c.axis('yAxis', {scale: scales.y, ticks: 5});
        var overlay = {
          type: 'OverlayLine',
          value: 14.5,
          orientation: 'vertical',
          xScale: scales.x,
          yScale: scales.y
        };

        return [
          title,
          [yAxis, d3c.layered(charts)],
          xAxis,
          overlay
        ];
      });

      return {
        output: fnBody(dependencies.overlay) + '\n\n' + wrapFn(fn),
        fn: new Function('options', fn)
      };
    },

    data: examples.data.single,
    options: {}
  };

  //
  // Getting Started: Masthead
  //

  examples.masthead = [{
    generate: function() {
      var fn = buildFn(function() {
        var scales = {
          x: {type: 'ordinal', data: options.data, key: 'x', adjacent: true},
          y: {domain: [0, 120]}
        };

        var charts = [
          d3c.bars('bars', {
            data: options.data,
            xScale: scales.x,
            yScale: scales.y,
            duration: 1000
          })
        ];

        var title = d3c.title('d3.compose');
        var xAxis = d3c.axis('xAxis', {scale: scales.x, ticks: 5, duration: 1000});
        var xAxisTitle = d3c.axisTitle('Input');
        var yAxis = d3c.axis('yAxis', {scale: scales.y, ticks: 5, duration: 1000});
        var yAxisTitle = d3c.axisTitle('Output');
        var legend = d3c.legend({charts: ['bars']});

        return [
          title,
          [yAxisTitle, yAxis, d3c.layered(charts), legend],
          xAxis,
          xAxisTitle
        ];
      });

      return {
        output: wrapFn(fn),
        fn: new Function('options', fn)
      };
    },

    data: examples.data.single,
    options: {}
  }, examples['lines-and-bars'], {
    generate: function() {
      var fn = buildFn(function() {
        var scales = {
          x: {domain: [-10, 110]},
          y: {domain: [0, 120]}
        };

        var charts = [
          d3c.lines('lines', {
            data: options.data,
            xScale: scales.x,
            yScale: scales.y,
            labels: true,
            duration: 1000
          })
        ];

        var title = d3c.title('Labels');
        var xAxis = d3c.axis('xAxis', {scale: scales.x, duration: 1000});
        var xAxisTitle = d3c.axisTitle('Input');
        var yAxis = d3c.axis('yAxis', {scale: scales.y, duration: 1000});
        var yAxisTitle = d3c.axisTitle('Output');
        var legend = d3c.legend({charts: ['lines']});

        return [
          title,
          [yAxisTitle, yAxis, d3c.layered(charts), legend],
          xAxis,
          xAxisTitle
        ];
      });

      return {
        output: wrapFn(fn),
        fn: new Function('options', fn)
      };
    },

    data: examples.data.single,
    options: {}
  }, examples['horizontal-bars']];

  //
  // Getting Started: Steps
  //

  examples['getting-started-2'] = {
    generate: function() {
      var fn = buildFn(function() {
        var charts = [
          d3c.lines('results', {data: options.data})
        ];

        return [
          d3c.layered(charts)
        ];
      });

      return {
        output: wrapFn(fn),
        fn: new Function('options', fn)
      };
    },

    data: {series: examples.data.single.series[1].values},
    options: {}
  };

  examples['getting-started-3'] = {
    generate: function() {
      var fn = buildFn(function() {
        var charts = [
          d3c.lines('results', {data: options.data})
        ];

        var yAxis = d3c.axis('yAxis', {
          scale: {domain: [0, 100]}
        });

        return [
          [yAxis, d3c.layered(charts)]
        ];
      });

      return {
        output: wrapFn(fn),
        fn: new Function('options', fn)
      };
    },

    data: {series: examples.data.single.series[1].values},
    options: {}
  };

  examples['getting-started-4'] = {
    generate: function() {
      var fn = buildFn(function() {
        var scales = {
          x: {data: options.data, key: 'x'},
          y: {domain: [0, 120]}
        };

        var charts = [
          d3c.lines('results', {
            data: options.data,
            xScale: scales.x,
            yScale: scales.y
          })
        ];

        var xAxis = d3c.axis('xAxis', {scale: scales.x});
        var yAxis = d3c.axis('yAxis', {scale: scales.y});

        return [
          [yAxis, d3c.layered(charts)],
          xAxis
        ];
      });

      return {
        output: wrapFn(fn),
        fn: new Function('options', fn)
      };
    },

    data: {series: examples.data.single.series[1].values},
    options: {}
  };

  examples['getting-started-5'] = {
    generate: function() {
      var fn = buildFn(function() {
        var scales = {
          x: {data: options.data, key: 'x'},
          y: {domain: [0, 120]}
        };

        var charts = [
          d3c.lines('results', {
            data: options.data,
            xScale: scales.x,
            yScale: scales.y
          })
        ];

        var xAxis = d3c.axis('xAxis', {scale: scales.x});
        var yAxis = d3c.axis('yAxis', {scale: scales.y});

        return [
          [yAxis, d3c.layered(charts)],
          xAxis
        ];
      });

      return {
        output: wrapFn(fn),
        fn: new Function('options', fn)
      };
    },

    data: examples.data.single,
    options: {}
  };

  examples['getting-started-6'] = {
    generate: function() {
      var fn = buildFn(function() {
        var scales = {
          x: {data: options.data, key: 'x'},
          y: {domain: [0, 120]}
        };

        var charts = [
          d3c.lines('results', {
            data: options.data,
            xScale: scales.x,
            yScale: scales.y
          })
        ];

        var xAxis = d3c.axis('xAxis', {scale: scales.x});
        var yAxis = d3c.axis('yAxis', {scale: scales.y});
        var legend = d3c.legend({charts: ['results']});

        return [
          [yAxis, d3c.layered(charts), legend],
          xAxis
        ];
      });

      return {
        output: wrapFn(fn),
        fn: new Function('options', fn)
      };
    },

    data: examples.data.single,
    options: {}
  };

  examples['getting-started-7'] = {
    generate: function() {
      var fn = buildFn(function() {
        var scales = {
          x: {data: options.data, key: 'x'},
          y: {domain: [0, 120]}
        };

        var charts = [
          d3c.lines('results', {
            data: options.data,
            xScale: scales.x,
            yScale: scales.y
          })
        ];

        var xAxis = d3c.axis('xAxis', {scale: scales.x});
        var yAxis = d3c.axis('yAxis', {scale: scales.y});
        var legend = d3c.legend({charts: ['results']});
        var title = d3c.title('d3.compose');
        var xAxisTitle = d3c.axisTitle('Input');
        var yAxisTitle = d3c.axisTitle('Results');

        return [
          title,
          [yAxisTitle, yAxis, d3c.layered(charts), legend],
          xAxis,
          xAxisTitle
        ];
      });

      return {
        output: wrapFn(fn),
        fn: new Function('options', fn)
      };
    },

    data: examples.data.single,
    options: {}
  };

  examples['getting-started-1'] = examples['getting-started-8'] = {
    generate: function() {
      var fn = buildFn(function() {
        var scales = {
          x: {type: 'ordinal', data: options.data, key: 'x', adjacent: true},
          y: {domain: [0, 120]}
        };

        var charts = [
          d3c.bars('results', {
            data: options.data,
            xScale: scales.x,
            yScale: scales.y
          })
        ];

        var xAxis = d3c.axis('xAxis', {scale: scales.x});
        var yAxis = d3c.axis('yAxis', {scale: scales.y});
        var legend = d3c.legend({charts: ['results']});
        var title = d3c.title('d3.compose');
        var xAxisTitle = d3c.axisTitle('Input');
        var yAxisTitle = d3c.axisTitle('Results');

        return [
          title,
          [yAxisTitle, yAxis, d3c.layered(charts), legend],
          xAxis,
          xAxisTitle
        ];
      });

      return {
        output: wrapFn(fn),
        fn: new Function('options', fn)
      };
    },

    data: examples.data.single,
    options: {}
  };

  //
  // dependencies
  //

  /* eslint-disable no-unused-vars */
  var dependencies = {
    dots: function() {
      var helpers = d3.compose.helpers;
      var mixins = d3.compose.mixins;

      var Mixed = helpers.mixin(d3.chart('Chart'), mixins.Series, mixins.XY);
      Mixed.extend('Dots', {
        initialize: function(options) {
          Mixed.prototype.initialize.call(this, options);
          var base = this.base.append('g').attr('class', 'chart-dots');

          // seriesLayer wraps series functionality
          // so that standard layer approach can be used
          this.seriesLayer('Dots', base, {
            dataBind: function(data) {
              return this.selectAll('circle')
                .data(data, this.chart().key);
            },
            insert: function() {
              return this.append('circle');
            },
            events: {
              merge: function() {
                var chart = this.chart();
                this
                  .attr('cx', chart.x)
                  .attr('cy', chart.y)
                  .attr('r', chart.r);
              }
            }
          });
        },

        // helpers.property creates get/set property
        // that is set automatically from Compose options
        rValue: helpers.property({
          default_value: 2
        }),

        // helpers.di binds chart to "di" functions
        // so that "this" refers to the element (as expected)
        r: helpers.di(function(chart, d, i) {
          return chart.rValue();
        })
      });
    },

    overlay: function() {
      var helpers = d3.compose.helpers;
      var mixins = d3.compose.mixins;

      var Mixed = helpers.mixin(d3.chart('Component'), mixins.XY);
      Mixed.extend('OverlayLine', {
        initialize: function(options) {
          Mixed.prototype.initialize.call(this, options);
          var base = this.base.append('g').attr('class', 'chart-overlay');
          this.line = d3.svg.line().x(this.x).y(this.y);

          this.layer('Overlay', base, {
            dataBind: function() {
              return this.selectAll('path').data([0]);
            },
            insert: function() {
              return this.append('path')
                .style('stroke', '#999');
            },
            events: {
              merge: function() {
                var chart = this.chart();
                this.attr('d', function(d, i) {
                  return chart.line(chart.points.call(this, d, i));
                });
              }
            }
          });
        },

        // helpers.property creates get/set property
        // that is set automatically from Compose options
        value: helpers.property(),

        orientation: helpers.property({
          default_value: 'vertical',
          validate: function(value) {
            return value == 'vertical' || value == 'horizontal';
          }
        }),

        // helpers.di binds chart to "di" functions
        // so that "this" refers to the element (as expected)
        points: helpers.di(function(chart) {
          var points = [{}, {}];

          if (chart.orientation() == 'horizontal') {
            points[0].y = points[1].y = chart.value();
            points[0].x = chart.xScale().domain()[0];
            points[1].x = chart.xScale().domain()[1];
          }
          else {
            points[0].x = points[1].x = chart.value();
            points[0].y = chart.yScale().domain()[0];
            points[1].y = chart.yScale().domain()[1];
          }

          return points;
        }),

        // Position overlay as chart layer,
        // skipping standard component layout
        skip_layout: true
      }, {
        layer_type: 'chart'
      });
    }
  };
  /* eslint-enable */

  _.each(dependencies, function(dependency) {
    dependency();
  });

  //
  // helpers
  //

  function buildFn() {
    var parts = _.toArray(arguments);
    var fn = fnBody(parts[0]);

    return '  ' + fn.replace(/\n/g, '\n  ');
  }

  function fnBody(fn) {
    var lines = fn.toString().split('\n').slice(1, -1);
    var leading_spaces = lines[0].split(/[^ \t\r\n]/)[0].length;

    return _.map(lines, function(line) {
      return line.substring(leading_spaces);
    }).join('\n');
  }

  function wrapFn(fn) {
    return 'd3.select(\'#chart\').chart(\'Compose\', function(options) {\n' + fn + '\n});';
  }

})(examples);
