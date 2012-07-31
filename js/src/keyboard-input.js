function KeyboardInput() {
    var keys = {
        left: false,
        right: false,
        up: false,
        down: false
    };
    var uKeys = _(keys);

    var keyCodesToKeys = {
        37: 'left',
        39: 'right',
        38: 'up',
        40: 'down'
    };

    var setKeyTo = function(state) {
        return function(e) {
            if (e.keyCode in keyCodesToKeys) {
                keys[keyCodesToKeys[e.keyCode]] = state;
            }
        };
    }

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

    this.dirX = function() {
        return this.isRightDown() - this.isLeftDown();
    };

    this.dirY = function() {
        return this.isDownDown() - this.isUpDown();
    };
}
