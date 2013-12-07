define(["graphics", "underscore", "ee", "handjs"], function(graphics, _, EventEmitter) {
    "use strict";

    var controllerImage = new Image();

    var isTouchDevice = window.navigator.msMaxTouchPoints ||
        ('ontouchstart' in document);

    controllerImage.src = "assets/img/controller.png";

    var buttons = [
        {
            name: 'up',
            keyCode: 38,
            left: 22, right: 45, top: 170, bottom: 190
        },
        {
            name: 'down',
            keyCode: 40,
            left: 22, right: 45, top: 212, bottom: 223
        },
        {
            name: 'left',
            keyCode: 37,
            left: 8, right: 28, top: 190, bottom: 212
        },
        {
            name: 'right',
            keyCode: 39,
            left: 45, right: 64, top: 190, bottom: 212
        },
        {
            name: 'confirm',
            keyCode: 90,
            left: 280, right: 310, top: 175, bottom: 205
        },
        {
            name: 'cancel',
            keyCode: 88,
            left: 240, right: 270, top: 200, bottom: 230
        }
    ];

    var normalizedCoordinates = function(e, canvas) {
        var rect = canvas.getBoundingClientRect();
        var x = (e.clientX - rect.left) / ((rect.right - rect.left) / 320);
        var y = (e.clientY - rect.top) / ((rect.bottom - rect.top) / 240);
        return { x: x, y: y};
    };

    var lastTappedLocation = {};

    var controllerImage;

    var touchInput = _(Object.create(EventEmitter.prototype)).extend({
        isEnabled: isTouchDevice,
        init: function(canvas) {
            if (!isTouchDevice)
                return;

            canvas.addEventListener("pointerdown", function(e) {
                var c = normalizedCoordinates(e, canvas);

                lastTappedLocation[e.pointerId] = c;

                buttons.forEach(function(button) {
                    if (c.x >= button.left && c.y >= button.top && c.x <= button.right && c.y <= button.bottom) {
                        if (!button.pressedBy) {
                            button.pressedBy = e.pointerId;
                            document.onkeydown(button);
                        }
                    }
                });
                e.preventDefault();
                return false;
            });
            canvas.addEventListener("pointerup", function(e) {
                var c = normalizedCoordinates(e, canvas);
                var o = lastTappedLocation[e.pointerId];
                if (Math.abs(c.x - o.x) < 10 &&
                    Math.abs(c.y - o.y) < 10) {
                    touchInput.trigger('tap', [c]);
                }

                buttons.forEach(function(button) {
                    if (button.pressedBy === e.pointerId) {
                        document.onkeyup(button);
                        button.pressedBy = null;
                    }
                });
                e.preventDefault();
                return false;
            });
            canvas.addEventListener("pointermove", function(e) {
                var c = normalizedCoordinates(e, canvas);

                buttons.forEach(function(button) {
                    if (button.pressedBy && button.pressedBy !== e.pointerId)
                        return;

                    if (c.x >= button.left && c.y >= button.top && c.x <= button.right && c.y <= button.bottom) {
                        if (!button.pressedBy) {
                            document.onkeydown(button);
                            button.pressedBy = e.pointerId;
                        }
                    } else {
                        if (button.pressedBy) {
                            document.onkeyup(button);
                            button.pressedBy = null;
                        }
                    }
                });
                e.preventDefault();
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