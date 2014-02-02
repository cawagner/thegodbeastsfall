define(["graphics", "underscore", "ee"], function(graphics, _, EventEmitter) {
    "use strict";

    var canvas;

    var controllerImage = new Image();

    var isTouchDevice = true; /*window.navigator.msMaxTouchPoints ||
        ('ontouchstart' in document);*/

    controllerImage.src = "assets/img/controller.png";

    var buttons = [
        {
            name: 'up',
            keyCode: 38,
            left: 20, right: 47, top: 160, bottom: 190
        },
        {
            name: 'down',
            keyCode: 40,
            left: 20, right: 47, top: 212, bottom: 233
        },
        {
            name: 'left',
            keyCode: 37,
            left: 0, right: 28, top: 185, bottom: 217
        },
        {
            name: 'right',
            keyCode: 39,
            left: 45, right: 72, top: 185, bottom: 217
        },
        {
            name: 'confirm',
            keyCode: 90,
            left: 275, right: 320, top: 165, bottom: 215
        },
        {
            name: 'cancel',
            keyCode: 88,
            left: 230, right: 275, top: 190, bottom: 240
        }
    ];

    var normalizedCoordinates = function(e, canvas) {
        //var rect = canvas.getBoundingClientRect();
        var x = e.pageX / (window.innerWidth / 320);
        var y = e.pageY / (window.innerHeight / 240);
        return { x: x, y: y};
    };

    var lastTappedLocation = {};

    var controllerImage;

    var touchInput = _(Object.create(EventEmitter.prototype)).extend({
        isEnabled: isTouchDevice,
        init: function(canvas) {
            if (!isTouchDevice)
                return;

            canvas.addEventListener("touchstart", function(event) {
                event.changedTouches.forEach(function(e) {
                    var c = normalizedCoordinates(e, canvas);

                    lastTappedLocation[e.identifier] = c;

                    buttons.forEach(function(button) {
                        if (c.x >= button.left && c.y >= button.top && c.x <= button.right && c.y <= button.bottom) {
                            if (!button.pressedBy) {
                                button.pressedBy = e.identifier;
                                document.onkeydown(button);
                            }
                        }
                    });
                });
                event.preventDefault();
                return false;
            });
            canvas.addEventListener("touchend", function(event) {
                event.changedTouches.forEach(function(e) {
                    var c = normalizedCoordinates(e, canvas);
                    var o = lastTappedLocation[e.identifier];
                    if (Math.abs(c.x - o.x) < 10 &&
                        Math.abs(c.y - o.y) < 10) {
                        touchInput.trigger('tap', [c]);
                    }

                    buttons.forEach(function(button) {
                        if (button.pressedBy === e.identifier) {
                            document.onkeyup(button);
                            button.pressedBy = null;
                        }
                    });
                });
                event.preventDefault();
                return false;
            });
            canvas.addEventListener("touchmove", function(event) {
                event.targetTouches.forEach(function(e) {
                    var c = normalizedCoordinates(e, canvas);

                    buttons.forEach(function(button) {
                        if (button.pressedBy && button.pressedBy !== e.identifier)
                            return;

                        if (c.x >= button.left && c.y >= button.top && c.x <= button.right && c.y <= button.bottom) {
                            if (!button.pressedBy) {
                                document.onkeydown(button);
                                button.pressedBy = e.identifier;
                            }
                        } else {
                            if (button.pressedBy) {
                                document.onkeyup(button);
                                button.pressedBy = null;
                            }
                        }
                    });
                });
                event.preventDefault();
                return false;
            });
        },
        draw: function(ctx) {
            if (isTouchDevice) {
                graphics.setAlpha(0.2);
                graphics.drawImage(controllerImage, 0, 0);
                graphics.setAlpha(1);
            }
        }
    });
    return touchInput;
});
