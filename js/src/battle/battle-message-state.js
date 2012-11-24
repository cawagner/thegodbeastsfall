define(["jquery", "underscore", "gui", "keyboard-input"], function($, _, GuiRenderer, input) {
    var MESSAGE_DELAY = 250;

    function BattleMessageState(messages, sound) {
        this.gui = new GuiRenderer(Game.instance.graphics);

        this.messageDelay = 0;
        this.currentMessage = "";
        this.messages = messages;

        this.start = function() {
            if (sound) {
                $.publish("/sound/play", [sound]);
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
                this.gui.drawTextWindow(10, 10, 300, 20, [this.currentMessage]);
            }
        };
    }

    return BattleMessageState;
});