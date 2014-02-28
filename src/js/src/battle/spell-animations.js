define([
    "underscore",
    "rsvp",
    "graphics",
    "image-loader",
    "json!spell-animations.json"
], function(_,
    RSVP,
    graphics,
    imageLoader,
    spellAnimations
) {
    "use strict";

    var files = {};
    var images = {};

    return {
        loadImages: function() {
            _(spellAnimations).each(function(animation, name) {
                if (animation.file in files)
                    return;
                if (animation.type === "column") {
                    files[name] = imageLoader.loadImage("assets/img/" + animation.file).then(function(image) {
                        images[name] = image;
                    });
                }
            });
            return RSVP.hash(files);
        },
        createAnimation: function(type, target) {
            var settings = spellAnimations[type];
            if (!settings) {
                throw "couldn't find animation: " + type;
            }
            if (settings.type !== "column") {
                throw "unimplemented animation type " + settings.type;
            }
            var image = images[type];
            var frameIndex = 0;
            var frameDelay = -1;
            var sourceRect;
            var updateFrame = function() {
                sourceRect = graphics.getRectForFrame(frameIndex, image.width, settings.width, settings.height);
            };
            var destRect = {
                x: target.x + (target.rect ? target.rect.width / 2 : 0) - image.width / 2 + settings.offset.x,
                y: target.y + settings.offset.y,
                width: settings.width,
                height: settings.height
            };
            updateFrame();
            return {
                update: function() {
                    if (frameIndex >= settings.frameCount)
                        return true;
                    ++frameDelay;
                    if (frameDelay >= settings.frameDelay) {
                        ++frameIndex;
                        if (frameIndex < settings.frameCount) {
                            updateFrame();
                        }
                        frameDelay = 0;
                    }
                    return false;
                },
                draw: function() {
                    if (frameIndex < settings.frameCount) {
                        graphics.drawImageRect(image, sourceRect, destRect);
                    }
                }
            }
        }
    }
});