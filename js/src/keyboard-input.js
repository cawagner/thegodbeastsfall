function KeyboardInput() {
    var keys = {
        left: false,
        right: false,
        up: false,
        down: false
    };
    var _keys = _(keys);

    var keyCodesToKeys = {
        37: "left",
        39: "right",
        38: "up",
        40: "down"
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

    this.isLeftDown = _keys.getter("left");
    this.isRightDown = _keys.getter("right");
    this.isUpDown = _keys.getter("up");
    this.isDownDown = _keys.getter("down");

    this.dirX = function() {
        return this.isRightDown() - this.isLeftDown();
    };

    this.dirY = function() {
        return this.isDownDown() - this.isUpDown();
    };
}
