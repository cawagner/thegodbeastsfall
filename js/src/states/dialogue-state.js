define([
    "pubsub",
    "gui",
    "game",
    "keyboard-input",
    "json!speakers.json",
    "states/noop-state"
], function(
    pubsub,
    gui,
    game,
    input,
    speakers,
    NoopState
) {
    "use strict";

    var LINE_LENGTH = 38;

    function DialogueState(message, doneFn) {
        var messageIndex = 0,
            lineIndex = 0,
            lines = message.text[0].wordWrap(LINE_LENGTH),
            openProgress = 0.0;

        this.previousState = new NoopState();

        this.start = function(previousState) {
            this.previousState = previousState;
        };

        this.end = function() {
            doneFn();
            setTimeout(function() {
                pubsub.publish("/npc/talk/done");
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

        this.advanceText = function() {
            ++lineIndex;
            if (lineIndex >= message.text.length) {
                game.popState();
            } else {
                lines = message.text[lineIndex].wordWrap(LINE_LENGTH);
            }
        };

        this.update = function(timeScale) {
            if (input.wasConfirmPressed() || input.wasCancelPressed()) {
                this.advanceText();
            }

            openProgress = Math.min(1, openProgress + 0.1);

            this.previousState.update(timeScale, false);
        };
    }

    return DialogueState;
});