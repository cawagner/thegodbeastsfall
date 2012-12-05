define(["pubsub", "underscore", "gui", "keyboard-input"], function(pubsub, _, gui, input) {
    "use strict";

    var MESSAGE_DELAY = 250;

    function BattleMessageState(messages, sound) {
        this.messageDelay = 0;
        this.currentMessage = "";
        this.messages = messages;

        this.start = function() {
            if (sound) {
                pubsub.publish("/sound/play", [sound]);
            }
        };

        this.update = function() {
            this.messageDelay--;
            if (input.wasConfirmPressed() || this.messageDelay < 0) {
                if (this.advanceMessage()) {
                    this.messageDelay = MESSAGE_DELAY;
                } else {
                    return true;
                }
            }
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