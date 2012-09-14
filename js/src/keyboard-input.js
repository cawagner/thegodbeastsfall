function KeyboardInput() {
    var keys = {
        left: false,
        right: false,
        up: false,
        down: false,
        confirm: false,
        cancel: false
    };
    var pressed = {
    };
    var uKeys = _(keys);

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
            if (e.keyCode in keyCodesToKeys) {
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

    this.setup = function() {
        document.onkeydown = this.onKeyDown;
        document.onkeyup = this.onKeyUp;
        return this;
    };

    this.isLeftDown = uKeys.getter('left');
    this.isRightDown = uKeys.getter('right');
    this.isUpDown = uKeys.getter('up');
    this.isDownDown = uKeys.getter('down');
    this.isConfirmDown = uKeys.getter('confirm');
    this.isCancelDown = uKeys.getter('cancel');

    this.wasConfirmPressed = wasPressed('confirm');
    this.wasCancelPressed = wasPressed('cancel');

    this.wasUpPressed = wasPressed('up');
    this.wasDownPressed = wasPressed('down');
    this.wasLeftPressed = wasPressed('left');
    this.wasRightPressed = wasPressed('right');

    this.dirX = function() {
        return this.isRightDown() - this.isLeftDown();
    };

    this.dirY = function() {
        return this.isDownDown() - this.isUpDown();
    };

    this.anyInput = function() {
        return uKeys.any(function(value) { return value === true });
    };
}
