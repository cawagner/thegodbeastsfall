define(["gui", "display/speakers", "states/noop-state"], function(GuiRenderer, speakers, NoopState) {
    "use strict";

    var LINE_LENGTH = 38;

    function DialogueState(messages, doneFn) {
        var messageIndex = 0,
            lineIndex = 0,
            message = messages[0],
            lines = message.text[0].wordWrap(LINE_LENGTH),
            gui = new GuiRenderer(Game.instance.graphics);

        this.previousState = new NoopState();

        this.start = function(previousState) {
            this.previousState = previousState;
        };

        this.end = function() {
            doneFn();
        };

        this.draw = function(timeScale) {
            var x = 10, y = 180, speaker = speakers[message.speaker];

            this.previousState.draw(timeScale);

            if (speaker) {
                gui.drawTextWindow(x + 5, y - 23, 100, 10, [speaker.name]);
            }
            gui.drawPortrait(x + 250, y, message.speaker, true);

            gui.drawTextWindow(x, y, 230, 48, lines);
        };

        this.advanceMessage = function() {
            lineIndex = 0;
            if (messageIndex < messages.length - 1) {
                ++messageIndex;
                message = messages[messageIndex];
            } else {
                Game.instance.popState();
            }
        };

        this.advanceText = function() {
            ++lineIndex;
            if (lineIndex >= message.text.length) {
                this.advanceMessage();
            }
            lines = message.text[lineIndex].wordWrap(LINE_LENGTH);
        };

        this.update = function(timeScale) {
            if (Game.instance.input.wasConfirmPressed()) {
                this.advanceText();
            }

            this.previousState.update(timeScale, false);
        };
    }

    return DialogueState;
});