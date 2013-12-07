define(["radio", "underscore", "game", "graphics", "gui", "sound", "keyboard-input", "states/noop-state"], function(radio, _, game, graphics, gui, sound, input, NoopState) {
    "use strict";

    function EventArgs(options) {
        _(this).extend(options || {});
        this.defaultPrevented = false;
    }
    EventArgs.prototype.preventDefault = function() {
        this.defaultPrevented = true;
    };

    function MenuState(menu) {
        this.menu = menu;
        this.previousState = new NoopState();
        this.selectionIndex = 0;

        this.openProgress = 0.0;

        this.isPaused = false;

        radio("/menu/close").subscribe(function closeMenu(menuToClose) {
            if (menuToClose === menu) {
                radio("/menu/close").unsubscribe(closeMenu);
                game.popState();
            }
        });
    }

    MenuState.prototype.start = function(previousState) {
        this.previousState = previousState;
    };

    MenuState.prototype.update = function() {
        var e;
        this.openProgress = Math.min(1, this.openProgress + 0.2);

        if (!this.isPaused) {
            if (input.wasUpPressed()) {
                this.selectionIndex = Math.max(0, this.selectionIndex - this.menu.cols);
            }
            if (input.wasDownPressed()) {
                this.selectionIndex = Math.min(this.menu.items.length - 1, this.selectionIndex + this.menu.cols);
            }
            if (input.wasLeftPressed()) {
                this.selectionIndex = Math.max(0, this.selectionIndex - 1);
            }
            if (input.wasRightPressed()) {
                this.selectionIndex = Math.min(this.menu.items.length - 1, this.selectionIndex + 1);
            }
            if (input.wasConfirmPressed()) {
                if (!_(this.menu.items[this.selectionIndex]).result("disabled")) {
                    this.menu.trigger('select', [{
                        sender: this.menu,
                        index: this.selectionIndex,
                        item: this.menu.items[this.selectionIndex]
                    }]);
                    sound.playSound("confirm");
                }
            }
            if (input.wasCancelPressed()) {
                e = new EventArgs({ sender: this.menu });
                this.menu.trigger('cancel', [e]);
                if (!e.defaultPrevented) {
                    this.menu.close();
                }
                sound.playSound("cancel");
            }
        }

        this.previousState.update();
    };

    MenuState.prototype.draw = function(delta) {
        var i, x, y, item, colWidth = this.menu.colWidth, disabled;

        if (this.menu.options.captureDraw) {
            if (this.menu.options.draw) {
                this.menu.options.draw(this.menu.items[this.selectionIndex], this.menu, this.selectionIndex);
            }
            return;
        }

        this.previousState.draw(delta);

        gui.drawWindowRect(this.menu.x, this.menu.y, this.menu.cols * colWidth * this.openProgress, this.menu.rows * gui.lineHeight * this.openProgress);

        for (i = 0; i < this.menu.items.length; ++i) {
            item = this.menu.items[i] instanceof String ? this.menu.items[i] : this.menu.items[i].text || this.menu.items[i].toString();
            x = i % this.menu.cols;
            y = Math.floor(i / this.menu.cols);
            disabled = _(this.menu.items[i]).result("disabled");
            graphics.drawText(this.menu.x + x * colWidth + 12, 4 + this.menu.y + y * gui.lineHeight, item, disabled ? "disabled" : null);
        }

        x = this.selectionIndex % this.menu.cols;
        y = Math.floor(this.selectionIndex / this.menu.cols);

        gui.drawPointer(this.menu.x + x * colWidth, this.menu.y + y * gui.lineHeight);

        if (this.menu.options.draw) {
            this.menu.options.draw(this.menu.items[this.selectionIndex], this.menu, this.selectionIndex);
        }
    };

    MenuState.prototype.suspend = function() {
        this.isPaused = true;
    };

    MenuState.prototype.reactivate = function() {
        this.isPaused = false;
    };

    return MenuState;
});