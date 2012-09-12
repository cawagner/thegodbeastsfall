function installMixins() {
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
        }
    });

    String.prototype.repeat = function(times) {
        return new Array(times + 1).join(this);
    };

    String.prototype.rset = function(length) {
        if (this.length < length) {
            return " ".repeat(length - this.length) + this;
        }
        return this;
    };
};

CHAR = {
    heart: "\u2665",
    star: "\u2605"
};

direction = {
    UP: 0,
    RIGHT: 1,
    DOWN: 2,
    LEFT: 3,
    oppositeOf: function(d) {
        switch(d) {
            case direction.UP: return direction.DOWN;
            case direction.RIGHT: return direction.LEFT;
            case direction.DOWN: return direction.UP;
            case direction.LEFT: return direction.RIGHT;
        }
    },
    getFromXY: function(x, y) {
        switch(true) {
            // y directions appear first so those take precedence when walking
            // (face toward / away from camera when walking on diagonals)
            case y > 0: return direction.DOWN;
            case y < 0: return direction.UP;
            case x < 0: return direction.LEFT;
            case x > 0: return direction.RIGHT;
        }
    },
    convertToXY: function(d) {
        switch (d) {
            case direction.UP: return { x: 0, y: -1 };
            case direction.RIGHT: return { x: 1, y: 0 };
            case direction.DOWN: return { x: 0, y: 1 };
            case direction.LEFT: return { x: -1, y: 0 };
            default: return { x: 0, y: 0 };
        }
    },
    fromName: function(name) {
        switch (name.toLowerCase()) {
            case "up": return direction.UP;
            case "down": return direction.DOWN;
            case "left": return direction.LEFT;
            case "right": return direction.RIGHT;
        }
    }
};

// TODO: move somewhere better.
var TILE_SIZE = 16;