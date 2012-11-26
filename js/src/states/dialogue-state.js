define([
    "jquery",
    "gui",
    "display/speakers",
    "states/noop-state"
], function(
    $,
    GuiRenderer,
    speakers,
    NoopState
) {
    "use strict";

    var LINE_LENGTH = 38;

    function DialogueState(messages, doneFn) {
        var messageIndex = 0,
            lineIndex = 0,
            message = messages[0],
            lines = message.text[0].wordWrap(LINE_LENGTH),
            gui = new GuiRenderer(Game.instance.graphics),
            openProgress = 0.0;

        this.previousState = new NoopState();

        this.start = function(previousState) {
            this.previousState = previousState;
            $.publish("/sound/play", ["message"]);
        };

        this.end = function() {
            doneFn();
            setTimeout(function() {
                $.publish("/npc/talk/done");
            }, 1);
        };

        this.draw = function(timeScale) {
            var x = 10, y = 180, speaker = speakers[message.speaker];

            this.previousState.draw(timeScale);

            gui.drawTextWindow(x, y + 240*(1-openProgress), 230, 48, lines);

            if (speaker) {
                gui.drawPortrait(x + 250, y, message.speaker, true);

                gui.drawWindowRect(x - 3 - 64*(1-openProgress), y - 13, speaker.name.length * 6 + 6, 5);
                gui.drawTextLines(x - 3 - 64*(1-openProgress), y - 13 - 5, [speaker.name]);
            }
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
            $.publish("/sound/play", ["message"]);
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

            openProgress = Math.min(1, openProgress + 0.05);

            this.previousState.update(timeScale, false);
        };
    }

    return DialogueState;
});