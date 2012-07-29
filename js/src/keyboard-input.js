function KeyboardInput() {
    var keys = {
        left: false,
        right: false,
        up: false,
        down: false
    };

    var keyCodesToKeys = {
        37: "left",
        39: "right",
        38: "up",
        40: "down"
    };

    var setKeyTo = function(state) {
        return function(e) {
            var key;
            if (e.keyCode in keyCodesToKeys) {
                key = keyCodesToKeys[e.keyCode];
                keys[key] = state;
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

    this.isLeftDown = function() {
        return keys.left;
    };

    this.isRightDown = function() {
        return keys.right;
    };

    this.isUpDown = function() {
        return keys.up;
    };

    this.isDownDown = function() {
        return keys.down;
    };

    this.dirX = function() {
        return this.isRightDown() - this.isLeftDown();
    };

    this.dirY = function() {
        return this.isDownDown() - this.isUpDown();
    };
}
