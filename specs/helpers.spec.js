(function(d3, _, helpers) {

  describe('helpers', function() {
    describe('property', function() {
      var property = helpers.property;
      var instance;
      beforeEach(function() {
        instance = {name: 'Chart'};
      });

      it('should get and set value', function() {
        instance.message = property('message');

        expect(instance.message()).toBeUndefined();
        instance.message('Hello');
        expect(instance.message()).toEqual('Hello');
      });

      it('should use default values', function() {
        instance.message = property('message', {
          defaultValue: 'Howdy!'
        });

        expect(instance.message()).toEqual('Howdy!');
        instance.message('Hello');
        expect(instance.message()).toEqual('Hello');
        instance.message(null);
        expect(instance.message()).toEqual(null);
        instance.message(undefined);
        expect(instance.message()).toEqual('Howdy!');
      });

      it('should expose defaultValue on property', function() {
        instance.message = property('message', {
          defaultValue: 'Howdy!'
        });

        expect(instance.message.defaultValue).toEqual('Howdy!');
        instance.message.defaultValue = 'Goodbye!';
        expect(instance.message()).toEqual('Goodbye!');
      });

      it('should evaluate get if type is not function', function() {
        instance.message = property('message');

        instance.message(function() { return 'Howdy!'; });
        expect(instance.message()).toEqual('Howdy!');

        instance.message = property('message', {type: 'function'});
        instance.message(function() { return 'Howdy!'; });
        expect(typeof instance.message()).toEqual('function');
        expect(instance.message()()).toEqual('Howdy!');
      });

      it('should evaluate get with context of object', function() {
        instance.message = property('message');
        instance.message(function() { return 'Howdy from ' + this.name; });
        expect(instance.message()).toEqual('Howdy from Chart');
      });

      it('should store set values on object at propKey', function() {
        instance.message = property('message', {propKey: 'properties'});
        instance.message('Howdy!');
        expect(instance.properties.message).toEqual('Howdy!');
      });

      it('should expose isProperty and setFromOptions on property', function() {
        instance.message = property('message', {setFromOptions: false});
        expect(instance.message._isProperty).toEqual(true);
        expect(instance.message.setFromOptions).toEqual(false);
      });

      describe('get()', function() {
        it('should be used for return value', function() {
          instance.message = property('message', {
            get: function(value) {
              return value + '!';
            }
          });

          instance.message('Howdy');
          expect(instance.message()).toEqual('Howdy!');
        });

        it('should use context of object by default', function() {
          instance.message = property('message', {
            get: function(value) {
              return value + ' from ' + this.name + '!';
            }
          });

          instance.message('Howdy');
          expect(instance.message()).toEqual('Howdy from Chart!');
        });

        it('should use context if set', function() {
          instance.message = property('message', {
            get: function(value) {
              return value + ' from ' + this.name + '!';
            },
            context: {name: 'Context'}
          });

          instance.message('Howdy');
          expect(instance.message()).toEqual('Howdy from Context!');
        });
      });

      describe('set()', function() {
        it('should pass previous to set', function() {
          var args;
          instance.message = property('message', {
            set: function(value, previous) {
              args = [value, previous];
            }
          });

          instance.message('Hello');
          expect(args).toEqual(['Hello', undefined]);
          instance.message('Howdy');
          expect(args).toEqual(['Howdy', 'Hello']);
        });

        it('should override set', function() {
          instance.message = property('message', {
            set: function(value, previous) {
              if (value === 'Hate')
                return {override: 'Love'};
            }
          });

          instance.message('Hello');
          expect(instance.message()).toEqual('Hello');
          instance.message('Hate');
          expect(instance.message()).toEqual('Love');
        });

        it('should call after() override', function() {
          var before, after;
          function getValue() {
            return instance.message();
          }
          instance.message = property('message', {
            set: function(value, previous) {
              before = getValue();
              return {
                override: 'Overridden',
                after: function() {
                  after = getValue();
                }
              };
            }
          });

          instance.message('Message');
          expect(before).toEqual('Message');
          expect(after).toEqual('Overridden');
        });

        it('should use context of object by default', function() {
          instance.message = property('message', {
            set: function(value, previous) {
              return {
                override: value + ' from ' + this.name + '!'
              };
            }
          });

          instance.message('Hello');
          expect(instance.message()).toEqual('Hello from Chart!');
        });

        it('should use context if set', function() {
          instance.message = property('message', {
            set: function(value, previous) {
              return {
                override: value + ' from ' + this.name + '!'
              };
            },
            context: {name: 'Context'}
          });

          instance.message('Hello');
          expect(instance.message()).toEqual('Hello from Context!');
        });
      });
    });

    describe('dimensions', function() {

    });

    describe('transform', function() {
      describe('translate', function() {
        it('should create from separate arguments or object', function() {
          expect(helpers.transform.translate(10, 15)).toEqual('translate(10, 15)');
          expect(helpers.transform.translate({x: 12, y: 17})).toEqual('translate(12, 17)');
        });

        it('should default to (0, 0)', function() {
          expect(helpers.transform.translate()).toEqual('translate(0, 0)');
          expect(helpers.transform.translate(10)).toEqual('translate(10, 0)');
          expect(helpers.transform.translate({y: 10})).toEqual('translate(0, 10)');
        });
      });
    });

    describe('createScaleFromOptions', function() {
      it('should create scale using type, domain, and range', function() {
        var options = {
          type: 'linear',
          range: [0, 500],
          domain: [0, 100]
        };

        var scale = helpers.createScaleFromOptions(options);
        expect(scale.domain()).toEqual([0, 100]);
        expect(scale.range()).toEqual([0, 500]);
      });

      it('should return original if scale is passed in (as function)', function() {
        var scale = function() {};
        expect(helpers.createScaleFromOptions(scale)).toBe(scale);
      });

      it('should use any special passed-in options (e.g. rangeBands) and pass in as arguments array', function() {
        var options = {
          type: 'ordinal',
          domain: ['a', 'b', 'c', 'd', 'e'],
          rangeRoundBands: [[0, 100], 0.1, 0.05]
        };

        var scale = helpers.createScaleFromOptions(options);
        expect(scale.domain()).toEqual(options.domain);
        expect(scale.range()).toEqual([1, 21, 41, 61, 81]);
      });

      it('should allow time scales', function() {
        var options = {
          type: 'time',
          domain: [new Date('1/1/2000 0:00'), new Date('1/1/2000 12:00')],
          range: [0, 100]
        };

        var scale = helpers.createScaleFromOptions(options);
        expect(scale(new Date('1/1/2000 6:00'))).toEqual(50);
        expect(scale.invert(50).getHours()).toEqual(6);
      });
    });

    describe('stack', function() {

    });

    describe('style', function() {
      it('should create style string from object', function() {
        var styles = {
          color: 'blue',
          border: 'solid 1px #ccc',
          'border-radius': '4px',
          'stroke-dasharray': '4,4'
        };
        var expected = 'color:blue;border:solid 1px #ccc;border-radius:4px;stroke-dasharray:4,4;';

        expect(helpers.style(styles)).toEqual(expected);
      });
    });

    describe('getValue', function() {
      it('should get search for keys in objects, finding first key in first object', function() {
        var obj1 = {a: 'b', c: 'd'};
        var obj2 = {c: 4, e: 6, g: null};

        expect(helpers.getValue(['a', 'b'], obj1, obj2)).toEqual('b');
        expect(helpers.getValue(['b', 'c'], obj1, obj2)).toEqual('d');
        expect(helpers.getValue(['e', 'f'], obj1, obj2)).toEqual(6);
        expect(helpers.getValue('g', obj2)).toEqual(null);
        expect(helpers.getValue(['y', 'z'], obj1, obj2)).toEqual(undefined);
      });
    });

    describe('di', function() {
      var wrapped, spy, instance;
      beforeEach(function() {
        spy = jasmine.createSpy('callback');
        wrapped = helpers.di(spy);

        instance = {};
        instance.x = wrapped;
        helpers.bindAllDi(instance);
      });

      it('should call callback when bound di is called', function() {
        instance.x();
        expect(spy).toHaveBeenCalled();
      });

      it('should pass through d, i, and j to callback', function() {
        instance.x('data', 1, 2);
        var args = spy.calls.mostRecent().args;
        expect(args[1]).toEqual('data');
        expect(args[2]).toEqual(1);
        expect(args[3]).toEqual(2);
      });

      it('should expose isDi property', function() {
        expect(wrapped._isDi).toEqual(true);
      });

      it('should pass in chart instance to bound di', function() {
        instance.x('data', 1, 2);
        var args = spy.calls.mostRecent().args;
        expect(args[0]).toBe(instance);
      });
    });

    describe('getParentData', function() {
      it('should get data from parent', function() {
        var element = {
          parentNode: {
            data: function() {
              return [[1,2,3]];
            }
          }
        };
        spyOn(d3, 'select').and.callFake(function(element) { return element; });

        expect(helpers.getParentData(element)).toEqual([1,2,3]);
      });
    });

    describe('resolveChart', function() {
      d3.chart('TEST-AxisSpecial', {});
      
      // chart type - type - component
      // 1. Values - Line - Chart -> LineValues
      // 2. XY - Line - Chart -> Line
      // 3. XY - Special - Axis -> AxisSpecial
      // 4. Values - Inset - Legend -> InsetLegend
      // 5. Values - Unknown - Axis -> AxisValues

      it('should find by type + chart type first', function() {
        expect(helpers.resolveChart('Line', 'Chart', 'Values')).toBe(d3.chart('LineValues'));
      });

      it('should then find by type', function() {
        expect(helpers.resolveChart('Line', 'Chart', 'XY')).toBe(d3.chart('Line'));
      });

      it('should then find by type + component', function() {
        expect(helpers.resolveChart('Special', 'TEST-Axis', 'XY')).toBe(d3.chart('TEST-AxisSpecial'));
      });

      it('should then find by component + type', function() {
        expect(helpers.resolveChart('Inset', 'Legend', 'Values')).toBe(d3.chart('InsetLegend'));
      });

      it('should then find by chart type + component', function() {
        expect(helpers.resolveChart('Unknown', 'Axis', 'Values')).toBe(d3.chart('AxisValues'));
      });

      it('should throw if not chart is found', function() {
        expect(helpers.resolveChart).toThrow();
      });
    });

    describe('mixin', function() {
      
    });
  });

})(d3, _, d3.chart.helpers);