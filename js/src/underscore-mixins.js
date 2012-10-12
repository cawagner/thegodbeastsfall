define(["underscore"], function(_) {
    "use strict";

    _.mixin({
        each2d: function(width, height, func, self) {
            var x, y, undefined;
            self = (self === undefined) ? window : self;
            for (x = 0; x < width; ++x) {
                for (y = 0; y < height; ++y) {
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
        wordWrap: function(str, maxLength) {
            var lines = [], line = "", i;
            _(str.split(' ')).each(function(word) {
                if (line.length + word.length >= maxLength) {
                    lines.push(line);
                    line = "";
                }
                line += word + " ";
            });
            if (line !== "")
                lines.push(line);

            return lines;
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
        disjunction: function(a, b) {
            return function() {
                return a.apply(null, arguments) || b.apply(null, arguments);
            };
        },
        conjunction: function(a, b) {
            return function() {
                return a.apply(null, arguments) && b.apply(null, arguments);
            };
        }
    });
});