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
            name: "Little Girl"
        },
        "earl": {
            name: "Man"
        }
    }
}());

function DialogueState(messages, doneFn) {
    var game = Game.instance,
        lineLength = 30,
        messageIndex = 0,
        lineIndex = 0,
        message = _(messages).first(),
        lines = _.wordWrap(message.text[0], lineLength),
        gui = new GuiRenderer(game.graphics);

    this.previousState = new NoopState();

    var drawPortrait = function(x, y, image, frame) {
        var faceWidth = 48, faceHeight = 48;
        var speakerSrcRect = game.graphics.getRectForFrame(frame, image.width, faceWidth, faceHeight);
        var speakerDestRect = { x: x, y: y, width: faceWidth, height: faceHeight };

        gui.drawWindowRect(speakerDestRect.x, speakerDestRect.y, speakerDestRect.width, speakerDestRect.height);
        game.graphics.drawImageRect(speaker.image, speakerSrcRect, speakerDestRect);
    };

    var drawSpeaker = function(speakerId, x, y) {
        var speaker = SPEAKERS[speakerId];

        if (speaker === undefined)
            return;

        gui.drawWindowRect(x + 5, y - 23, 100, 8);
        game.graphics.setFillColor("#fff");
        game.graphics.drawText(x + 5, y - 23, speaker.name);

        if (speaker.image) {
            drawPortrait(x + 250, y, speaker.image, speaker.frame);
        }
    };

    this.start = function(previousState) {
        this.previousState = previousState;
    };

    this.end = function() {
        doneFn();
    }

    this.draw = function(timeScale) {
        var x = 10, y = 180;

        this.previousState.draw(timeScale);

        game.graphics.setOrigin(0, 0);
        gui.drawWindowRect(x, y, 230, 48);

        drawSpeaker(message.speaker, x, y);

        game.graphics.setFillColor("#fff");

        _(lines).each(function(text, line) {
            game.graphics.drawText(x + 2, y + 2 + line * 16, text);
        });
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
