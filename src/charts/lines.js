import d3 from 'd3';
import {
  assign,
  isUndefined
} from '../utils';
import {
  types,
  createPrepare,
  connect
} from '../helpers';
import {
  createSeriesDraw,
  properties as seriesProperties
} from '../mixins/series';
import {
  getValue,
  prepare as xyPrepare,
  properties as xyProperties
} from '../mixins/xy';
import chart from '../chart';

/**
  Lines chart for single or series xy data.

  @example
  ```js
  // Automatic scaling
  lines({data: [1, 2, 3]});

  // Full example
  lines({
    // Series values
    data: [
      {values: [{a: 1, b: 10}, {a: 2, b: 20}, {a: 3, b: 30}]},
      {values: [{a: 1, b: 30}, {a: 2, b: -10}, {a: 3, b: 10}]}
    ],

    xValue: d => d.a,
    yValue: d => d.b,
    xScale: d3.scale.linear().domain([1, 3]),
    yScale: d3.scale.linear().domain([-30, 30]),
    interpolate: 'cardinal',
    tension: 0.5
  });
  ```
  @class Lines
*/
export const Lines = createSeriesDraw({
  prepare: createPrepare(xyPrepare),

  select({seriesValues, key}) {
    return this.selectAll('path')
      .data((d, i, j) => {
        return [seriesValues.call(this, d, i, j)];
      }, key);
  },

  enter() {
    this.append('path');
  },

  merge({xValue, xScale, yValue, yScale, interpolate, tension}) {
    const line = d3.svg.line()
      .x((d, i, j) => getValue(xValue, xScale, d, i, j))
      .y((d, i, j) => getValue(yValue, yScale, d, i, j));

    if (interpolate) {
      line.interpolate(interpolate);
    }
    if (!isUndefined(tension)) {
      line.tension(tension);
    }

    this.attr('d', (d) => line(d));
  }
});

Lines.properties = assign({},
  seriesProperties,
  xyProperties,
  {
    /**
      Set interpolation mode for line

      - See [line.interpolate](https://github.com/mbostock/d3/wiki/SVG-Shapes#line_interpolate)
      - Set to `null` or `'linear'` for no interpolation

      @property interpolate
      @type String|Function
      @default monotone
    */
    interpolate: {
      type: types.any,
      getDefault: () => 'monotone'
    },

    /**
      Set tension (Cardinal spline interpolation tension) for line

      - See [line.tension](https://github.com/mbostock/d3/wiki/SVG-Shapes#line_tension)

      @property tension
      @type Number
      @default d3.line default (0.7)
    */
    tension: {
      type: types.number,
      getDefault: () => null
    }
  }
);

// Connection
// ----------

// TODO Connect to dispatch closest points
export const connection = connect();

// lines
const lines = chart(connection(Lines));
export default lines;
