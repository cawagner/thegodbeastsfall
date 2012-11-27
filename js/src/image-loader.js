define(['jquery'], function($) {
    "use strict";

    return {
        loadImage: function(path) {
            var d = $.Deferred()
            var image = new Image();
            image.onload = function() {
                d.resolve(image);
            };
            image.src = path;
            return d.promise();
        },
        loadImageSync: function(path) {
            var image = new Image();
            image.src = path;
            return image;
        }
    };
});