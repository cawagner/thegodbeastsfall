define(["gui", "keyboard-input"], function(gui, input) {
    "use strict";

    var MESSAGE_DELAY = 250;

    function BattleMessageState(messages) {
        this.messageDelay = 0;
        this.currentMessage = "";
        this.messages = messages;

        this.start = function() { };

        this.update = function() {
            this.messageDelay--;
            if (input.wasConfirmPressed() || this.messageDelay < 0) {
                this.advanceMessage();
                this.messageDelay = MESSAGE_DELAY;
            }
            return !this.currentMessage;
        };

        this.advanceMessage = function() {
            return (this.currentMessage = this.messages.shift());
        };

        this.draw = function() {
            if (this.currentMessage) {
                gui.drawTextWindow(10, 10, 300, 20, [this.currentMessage]);
            }
        };
    }

    return BattleMessageState;
});