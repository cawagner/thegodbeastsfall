define([], function() {
    "use strict";

    var getter = function(obj, key) {
        return function() {
            return obj[key];
        };
    };

    var keys = {
        left: false,
        right: false,
        up: false,
        down: false,
        confirm: false,
        cancel: false
    };

    var pressed = { };

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

    var keys;
    return {
        isLeftDown: getter(keys, 'left'),
        isRightDown: getter(keys, 'right'),
        isUpDown: getter(keys, 'up'),
        isDownDown: getter(keys, 'down'),
        isConfirmDown: getter(keys, 'confirm'),
        isCancelDown: getter(keys, 'cancel'),

        wasConfirmPressed: wasPressed('confirm'),
        wasCancelPressed: wasPressed('cancel'),

        wasUpPressed: wasPressed('up'),
        wasDownPressed: wasPressed('down'),
        wasLeftPressed: wasPressed('left'),
        wasRightPressed: wasPressed('right'),

        init: function() {
            document.onkeydown = setKeyTo(true);
            document.onkeyup = setKeyTo(false);
        },
        dirX: function() {
            return this.isRightDown() - this.isLeftDown();
        },
        dirY: function() {
            return this.isDownDown() - this.isUpDown();
        },
        anyInput: function() {
            // TODO: use lazy.
            for (var key in keys) {
                if (keys[key])
                    return true;
            }
            return false;
        }
    };
});