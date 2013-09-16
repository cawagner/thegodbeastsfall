define(['rsvp'], function(RSVP) {
    "use strict";

    return {
        loadImage: function(path) {
            return new RSVP.Promise(function(resolve, reject) {
                var image = new Image();
                image.onload = function() {
                    resolve(image);
                };
                image.onerror = function(err) {
                    reject(err);
                };
                image.src = path;
            });
        },
        loadImageSync: function(path) {
            var image = new Image();
            image.src = path;
            return image;
        }
    };
});