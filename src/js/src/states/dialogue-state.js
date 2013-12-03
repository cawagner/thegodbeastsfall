define([
    "radio",
    "gui",
    "game",
    "keyboard-input",
    "json!speakers.json",
    "states/noop-state"
], function(
    radio,
    gui,
    game,
    input,
    speakers,
    NoopState
) {
    "use strict";

    var LINE_LENGTH = 38;

    var processMessage = function(text) {
        text = text.replace(/%([A-Za-z0-9-_]+)\b/g, function(match, name) {
            return name in speakers ? speakers[name].name : match;
        });
        return text.wordWrap(LINE_LENGTH);
    };

    function DialogueState(message, doneFn) {
        var messageIndex = 0,
            lineIndex = 0,
            charactersRevealed = 0,
            charactersToReveal = message.text[0].length,
            lines = processMessage(message.text[0]),
            openProgress = 0.0;

        this.previousState = new NoopState();

        this.start = function(previousState) {
            this.previousState = previousState;
        };

        this.end = function() {
            doneFn();
            setTimeout(function() {
                radio("/npc/talk/done").broadcast();
            }, 1);
        };

        this.draw = function(timeScale) {
            var x = 10, y = 180, speaker = speakers[message.speaker];

            this.previousState.draw(timeScale);

            gui.drawTextWindow(x, y + 240*(1-openProgress), 230, 48, lines, { font: message.font }, charactersRevealed);

            if (speaker) {
                gui.drawPortrait(x + 250, y, message.speaker, true);

                gui.drawWindowRect(x - 3 - 64*(1-openProgress), y - 13, speaker.name.length * 6 + 6, 5);
                gui.drawTextLines(x - 3 - 64*(1-openProgress), y - 13 - 5, [speaker.name]);
            }
        };

        this.advanceText = function() {
            if (charactersRevealed < charactersToReveal) {
                charactersRevealed = charactersToReveal;
                return;
            }
            ++lineIndex;
            if (lineIndex >= message.text.length) {
                game.popState();
            } else {
                lines = processMessage(message.text[lineIndex]);
                charactersRevealed = 0;
                charactersToReveal = message.text[lineIndex].length;
            }
        };

        this.update = function(timeScale) {
            if (input.wasConfirmPressed() || input.wasCancelPressed()) {
                this.advanceText();
            }

            openProgress = Math.min(1, openProgress + 0.1);

            if (charactersRevealed < charactersToReveal) {
                charactersRevealed += 2;
            }

            this.previousState.update(timeScale, false);
        };
    }

    return DialogueState;
});