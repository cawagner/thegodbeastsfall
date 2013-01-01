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
        getter: function(obj, key) {
            return function() {
                return obj[key];
            };
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
        randomElement: function(collection) {
            return collection[Math.floor(collection.length * Math.random())];
        },
        valuesOfPropertiesStartingWith: function(obj, initial) {
            var result = [];
            _(obj).each(function(value, key) {
                if (key.startsWith(initial)) {
                    result.push(value);
                }
            });
            return result;
        },
        formatList: function(collection) {
            var slice = Array.prototype.slice.call(collection, 0);
            if (slice.length > 1) {
                slice[slice.length - 1] = "and " + slice[slice.length - 1];
            }
            return slice.length > 2 ? slice.join(", ") : slice[0] + " " + slice[1];
        }
    });
});