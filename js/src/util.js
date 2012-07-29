_.mixin({
    each2d: function(width, height, func, self) {
        var x, y, undefined;
        self = (self === undefined) ? window : self;
        for (x = 0; x < width; ++x) {
            for (y = 0; y < height; ++y) {
                func.call(self, x, y);
            }
        }
    }
});