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

function splitLines(str) {
    return str.split('~');
}

function wordWrap(str, maxLength) {
    var lines = [], line = "", i;
    _(str.split(' ')).each(function(word) {
        if (line.length + word.length >= maxLength) {
            lines.push(line);
            line = "";
        }
        line += word + " ";
    });
    if (line !== "")
        lines.push(line);

    return lines;
}

function GuiRenderer(graphics) {
    this.graphics = graphics;
}

GuiRenderer.prototype.drawWindowRect = function(x, y, width, height) {
    this.graphics.setFillColor("#000");
    this.graphics.drawFilledRect(x - 7, y - 7, width + 14, height + 14);
    this.graphics.setFillColor("#fff");
    this.graphics.drawFilledRect(x - 5, y - 5, width + 10, height + 10);
    this.graphics.setFillColor("#000");
    this.graphics.drawFilledRect(x - 3, y - 3, width + 6, height + 6);
};

function DialogueState(messages, doneFn) {
    var game = Game.instance,
        lineLength = 30,
        messageIndex = 0,
        lineIndex = 0,
        message = _(messages).first(),
        lines = wordWrap(message.text[0], lineLength),
        gui = new GuiRenderer(game.graphics);

    var faceWidth = 48;
    var faceHeight = 48;

    this.previousState = new NoopState();

    var drawWindowRect = function(x, y, width, height) {

    };

    var drawSpeaker = function(speakerId, x, y) {
        var speaker = SPEAKERS[speakerId];
        var speakerImage, speakerSrcRect, speakerDestRect;
        var facesInRow;

        if (speaker === undefined)
            return;

        gui.drawWindowRect(x + 5, y - 23, 100, 8);
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

            gui.drawWindowRect(speakerDestRect.x, speakerDestRect.y, speakerDestRect.width, speakerDestRect.height);
            game.graphics.drawImageRect(speaker.image, speakerSrcRect, speakerDestRect);
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
            lines = wordWrap(message.text[lineIndex], lineLength);
        }

        this.previousState.update(timeScale, false);
    };
}
