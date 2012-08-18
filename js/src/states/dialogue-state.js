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
            name: "Old Man",
            image: facesImage,
            frame: 2
        }
    }
}());

function splitLines(str) {
    return str.split('~');
}

function DialogueState(game, messages, doneFn) {
    var messageIndex = 0,
        lineIndex = 0,
        message = _(messages).first(),
        lines = splitLines(message.text[0]);

    var faceWidth = 48;
    var faceHeight = 48;

    this.previousState = new NoopState();

    var drawWindowRect = function(x, y, width, height) {
        game.graphics.setFillColor("#000");
        game.graphics.drawFilledRect(x - 7, y - 7, width + 14, height + 14);
        game.graphics.setFillColor("#fff");
        game.graphics.drawFilledRect(x - 5, y - 5, width + 10, height + 10);
        game.graphics.setFillColor("#000");
        game.graphics.drawFilledRect(x - 3, y - 3, width + 6, height + 6);
    };

    var drawSpeaker = function(speakerId, x, y) {
        var speaker = SPEAKERS[speakerId];
        var speakerImage, speakerSrcRect, speakerDestRect;
        var facesInRow;

        if (speaker === undefined)
            return;

        drawWindowRect(x + 5, y - 23, 100, 8);
        game.graphics.setFillColor("#fff");
        game.graphics.drawText(x + 5, y - 23, speaker.name);

        if (speaker.image) {
            facesInRow = speaker.image.width / faceWidth;
            speakerSrcRect = {
                x: faceWidth * (speaker.frame % facesInRow),
                y: Math.floor(speaker.frame / facesInRow) * faceHeight,
                width: faceWidth,
                height: faceHeight
            };
            speakerDestRect = { x: x + 250, y: y, width: 48, height: 48 };

            drawWindowRect(speakerDestRect.x, speakerDestRect.y, speakerDestRect.width, speakerDestRect.height);
            game.graphics.drawImageRect(speaker.image, speakerSrcRect, speakerDestRect);
        }

        game.graphics.setFillColor("#fff");
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
        drawWindowRect(x, y, 230, 48);

        drawSpeaker(message.speaker, x, y);

        _(lines).each(function(text, line) {
            game.graphics.drawText(x + 2, y + 2 + line * 16, text);
        });
    };

    this.update = function(timeScale) {
        if (game.input.wasConfirmPressed()) {
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
            lines = splitLines(message.text[lineIndex]);
        }

        this.previousState.update(timeScale, false);
    };
}
