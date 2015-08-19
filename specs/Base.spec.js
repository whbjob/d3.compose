(function(d3, helpers) {

  describe('Base', function() {
    var Base = d3.chart('Base');

    it('should set properties from options', function() {
      var HasProperties = Base.extend({
        a: helpers.property()
      });
      var base = new HasProperties();
      base.options({a: 123, b: 456});

      expect(base.a()).toEqual(123);
      expect(base.options().b).toEqual(456);
    });

    it('should clear existing properties for new options', function() {
      var HasProperties = Base.extend({
        a: helpers.property(),
        b: helpers.property()
      });
      var base = new HasProperties();
      base.options({a: 123, b: 456});

      expect(base.a()).toEqual(123);
      expect(base.b()).toEqual(456);

      base.options({a: 789});

      expect(base.a()).toEqual(789);
      expect(base.b()).toEqual(undefined);
    });

    it('should store fully-transformed data', function() {
      var A = Base.extend({
        transform: function(data) {
          return data.map(function(value) {
            value += 10;
            return value;
          });
        }
      });
      var B = A.extend({
        transform: function(data) {
          data = A.prototype.transform.call(this, data);
          return data.map(function(value) {
            value += 20;
            return value;
          });
        }
      });

      var base = new B();
      base.draw([1, 2, 3]);

      expect(base.data()).toEqual([31, 32, 33]);
    });

    it('should trigger before:draw and draw events on draw', function() {
      var base = new Base();
      var onBeforeDraw = jasmine.createSpy('onBeforeDraw');
      var onDraw = jasmine.createSpy('onDraw');

      base.on('before:draw', onBeforeDraw);
      base.on('draw', onDraw);
      base.draw([1, 2, 3]);

      expect(onBeforeDraw).toHaveBeenCalledWith([1, 2, 3]);
      expect(onDraw).toHaveBeenCalledWith([1, 2, 3]);
    });
  });

})(d3, d3.compose.helpers);
