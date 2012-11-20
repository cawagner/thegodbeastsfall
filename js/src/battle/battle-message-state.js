define(["underscore", "gui", "keyboard-input"], function(_, GuiRenderer, input) {
    var MESSAGE_DELAY = 250;

    function BattleMessageState(messages) {
        this.gui = new GuiRenderer(Game.instance.graphics);

        this.messageDelay = 0;
        this.currentMessage = "";
        this.messages = messages;

        this.start = _.noop;

        this.update = function() {
            // TODO: work smarter, not harder
            // this is the "message phase..."
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
            this.gui.drawTextWindow(10, 10, 300, 20, [this.currentMessage]);
        };
    }

    return BattleMessageState;
});