define(["pubsub", "underscore", "gui", "chars", "states/noop-state", "pubsub"], function(pubsub, _, GuiRenderer, chars, NoopState) {
    "use strict";

    function MenuState(menu) {
        var game = Game.instance;

        this.menu = menu;
        this.graphics = game.graphics;
        this.gui = new GuiRenderer(this.graphics);
        this.previousState = new NoopState();
        this.selectionIndex = 0;
        this.input = game.input;

        this.openProgress = 0.0;

        this.isPaused = false;

        var subscription = pubsub.subscribe("/menu/close", function(menuToClose) {
            if (menuToClose === menu) {
                pubsub.unsubscribe(subscription);
                game.popState();
            }
        });
    }

    MenuState.prototype.start = function(previousState) {
        this.previousState = previousState;
    };

    MenuState.prototype.update = function() {
        this.openProgress = Math.min(1, this.openProgress + 0.2);

        if (!this.isPaused) {
            if (this.input.wasUpPressed()) {
                this.selectionIndex = Math.max(0, this.selectionIndex - this.menu.cols);
            }
            if (this.input.wasDownPressed()) {
                this.selectionIndex = Math.min(this.menu.items.length - 1, this.selectionIndex + this.menu.cols);
            }
            if (this.input.wasLeftPressed()) {
                this.selectionIndex = Math.max(0, this.selectionIndex - 1);
            }
            if (this.input.wasRightPressed()) {
                this.selectionIndex = Math.min(this.menu.items.length - 1, this.selectionIndex + 1);
            }
            if (this.input.wasConfirmPressed()) {
                if (!_(this.menu.items[this.selectionIndex]).result("disabled")) {
                    this.menu.triggerSelect(this.selectionIndex, this.menu.items[this.selectionIndex]);
                    pubsub.publish("/sound/play", ["confirm"]);
                }
            }
            if (this.input.wasCancelPressed()) {
                this.menu.triggerCancel();
                pubsub.publish("/sound/play", ["cancel"]);
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

        this.gui.drawWindowRect(this.menu.x, this.menu.y, this.menu.cols * colWidth * this.openProgress, this.menu.rows * this.gui.lineHeight * this.openProgress);
        this.graphics.setFillColor("#fff");

        for (i = 0; i < this.menu.items.length; ++i) {
            item = this.menu.items[i] instanceof String ? this.menu.items[i] : this.menu.items[i].text || this.menu.items[i].toString();
            x = i % this.menu.cols;
            y = Math.floor(i / this.menu.cols);
            disabled = _(this.menu.items[i]).result("disabled");
            if (disabled) {
                this.graphics.setAlpha(0.5);
            }
            this.graphics.drawText(this.menu.x + x * colWidth + 12, 4 + this.menu.y + y * this.gui.lineHeight, item);
            if (disabled) {
                this.graphics.setAlpha(1);
            }
        }

        x = this.selectionIndex % this.menu.cols;
        y = Math.floor(this.selectionIndex / this.menu.cols);

        this.graphics.drawText(this.menu.x + x * colWidth, 4 + this.menu.y + y * this.gui.lineHeight, chars.POINTER);

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