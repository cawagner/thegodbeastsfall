define(["underscore"], function(_) {
    "use strict";

    _.mixin({
        each2d: function(width, height, func, self) {
            var x, y, undefined;
            self = (self === undefined) ? window : self;
            for (y = 0; y < height; ++y) {
                for (x = 0; x < width; ++x) {
                    func.call(self, x, y);
                }
            }
        },
        noop: function() {},
        give: function(value) {
            return function() { return value; };
        },
        boundWithin: function(number, min, max) {
            return Math.min(Math.max(min, number), max);
        },
        sum: function(collection, field) {
            if (field === undefined) {
                return _(collection).reduce(function(memo, num) { return memo + num; }, 0);
            } else {
                return _(collection).reduce(function(memo, item) { return memo + _(item).result(field); }, 0);
            }
        },
        pluckResult: function(collection, field) {
            return _(collection).map(function(item) { return _(item).result(field); });
        },
        valuesOfPropertiesStartingWith: function(obj, initial) {
            var result = [];
            _(obj).each(function(value, key) {
                if (key.startsWith(initial)) {
                    result.push(value);
                }
            });
            return result;
        }
    });
});