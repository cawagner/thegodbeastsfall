function DialogueState(messages, doneFn) {
    var game = Game.instance,
        lineLength = 30,
        messageIndex = 0,
        lineIndex = 0,
        message = _(messages).first(),
        lines = _.wordWrap(message.text[0], lineLength),
        gui = new GuiRenderer(game.graphics);

    this.previousState = new NoopState();

    this.start = function(previousState) {
        this.previousState = previousState;
    };

    this.end = function() {
        doneFn();
    }

    this.draw = function(timeScale) {
        var x = 10, y = 180, speaker = SPEAKERS[message.speaker];

        this.previousState.draw(timeScale);

        if (speaker) {
            gui.drawTextWindow(x + 5, y - 23, 100, 10, [speaker.name]);
            gui.drawPortrait(x + 250, y, speaker.image, speaker.frame, true);
        }

        gui.drawTextWindow(x, y, 230, 48, lines);
    };

    this.advanceText = function() {
        ++lineIndex;
        if (lineIndex >= message.text.length) {
            lineIndex = 0;
            if (messageIndex < messages.length - 1) {
                ++messageIndex;
                message = messages[messageIndex];
            } else {
                game.popState();
            }
        }
        lines = _.wordWrap(message.text[lineIndex], lineLength);
    };

    this.update = function(timeScale) {
        if (game.input.wasConfirmPressed()) {
            this.advanceText();
        }

        this.previousState.update(timeScale, false);
    };
}

SPEAKERS = (function() {
    // TODO: do not load this here, or always assume held is talking...
    var facesImage = new Image();
    facesImage.src = "assets/img/faces1.png";

    // TODO: doesn't go here...
    return {
        "held": {
            name: "Held",
            image: facesImage,
            frame: 0
        },
        "mirv": {
            name: "Mirv",
            image: facesImage,
            frame: 4
        },
        "oldman": {
            name: "Old Man"
        },
        "littlegirl": {
            name: "Little Girl",
            image: facesImage,
            frame: 4
        },
        "earl": {
            name: "Man"
        }
    }
}());
