define([], function() {
    "use strict";

    var getter = function(obj, key) {
        return function() {
            return obj[key];
        };
    };

    var KeyboardInput = function() {
        var keys = {
            left: false,
            right: false,
            up: false,
            down: false,
            confirm: false,
            cancel: false
        };
        var pressed = { };

        var isConfirmDown;

        var keyCodesToKeys = {
            37: 'left',
            39: 'right',
            38: 'up',
            40: 'down',
            90: 'confirm',
            88: 'cancel'
        };

        var setKeyTo = function(state) {
            return function(e) {
                if (keyCodesToKeys[e.keyCode]) {
                    keys[keyCodesToKeys[e.keyCode]] = state;
                    pressed[keyCodesToKeys[e.keyCode]] = state;
                }
            };
        };

        var wasPressed = function(key) {
            return function() {
                var result = pressed[key];
                pressed[key] = false;
                return result;
            };
        };

        this.onKeyDown = setKeyTo(true);
        this.onKeyUp = setKeyTo(false);

        this.isLeftDown = getter(keys, 'left');
        this.isRightDown = getter(keys, 'right');
        this.isUpDown = getter(keys, 'up');
        this.isDownDown = getter(keys, 'down');
        this.isConfirmDown = getter(keys, 'confirm');
        this.isCancelDown = getter(keys, 'cancel');

        this.wasConfirmPressed = wasPressed('confirm');
        this.wasCancelPressed = wasPressed('cancel');

        this.wasUpPressed = wasPressed('up');
        this.wasDownPressed = wasPressed('down');
        this.wasLeftPressed = wasPressed('left');
        this.wasRightPressed = wasPressed('right');

        this.init = function() {
            document.onkeydown = this.onKeyDown;
            document.onkeyup = this.onKeyUp;
        };

        this.dirX = function() {
            return this.isRightDown() - this.isLeftDown();
        };

        this.dirY = function() {
            return this.isDownDown() - this.isUpDown();
        };

        this.anyInput = function() {
            // TODO: use lazy.
            for (var key in keys) {
                if (keys[key])
                    return true;
            }
            return false;
        };
    };

    return new KeyboardInput();
});