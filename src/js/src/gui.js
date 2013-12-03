define(["underscore",
    "constants",
    "graphics",
    "direction",
    "display/actor-renderer",
    "json!speakers.json",
    "image!assets/img/faces.png"
], function(_, constants, graphics, direction, actorRenderer, speakers, facesImage) {
    "use strict";

    var STATUS_WINDOW_WIDTH = 36, STATUS_WINDOW_HEIGHT = 44;

    var renderer = {
        lineHeight: 16,
        drawWindowRect: function(x, y, width, height, bgColor) {
            graphics.setFillColor(constants.WINDOW_OB_COLOR);
            graphics.drawFilledRect(x - 7, y - 7, width + 14, height + 14);
            graphics.setFillColor(constants.WINDOW_IB_COLOR);
            graphics.drawFilledRect(x - 5, y - 5, width + 10, height + 10);
            graphics.setFillColor(bgColor || constants.WINDOW_BG_COLOR);
            graphics.drawFilledRect(x - 3, y - 3, width + 6, height + 6);
        },
        drawTextWindow: function(x, y, width, height, lines, charactersRevealed, font, bgColor) {
            renderer.drawWindowRect(x, y, width, height, bgColor);
            renderer.drawTextLines(x, y, lines, charactersRevealed, font);
        },
        drawTextLines: function(x, y, lines, charactersRevealed, font) {
            var charsSoFar = 0, charsInLine;
            _(lines).each(function(text, i) {
                if (charactersRevealed === undefined || charactersRevealed >= charsSoFar + text.length) {
                    graphics.drawText(x + 2, y + 2 + i * renderer.lineHeight, text, font);
                    charsSoFar += text.length;
                } else {
                    charsInLine = charactersRevealed - charsSoFar;
                    if (charsInLine > 0) {
                        graphics.drawText(x + 2, y + 2 + i * renderer.lineHeight, text.substring(0, charsInLine), font);
                    }
                    charsSoFar += charsInLine;
                }
            });
            return y + 2 + lines.length * renderer.lineHeight;
        },
        drawPortrait: function(x, y, name, withBorder) {
            var speaker = speakers[name] || {};
            var speakerSrcRect, speakerDestRect;
            if (speaker.frame !== undefined) {
                speakerSrcRect = graphics.getRectForFrame(speaker.frame, facesImage.width, constants.FACE_WIDTH, constants.FACE_HEIGHT);
                speakerDestRect = { x: x, y: y, width: constants.FACE_WIDTH, height: constants.FACE_HEIGHT };

                if (withBorder) {
                    renderer.drawWindowRect(speakerDestRect.x, speakerDestRect.y, speakerDestRect.width, speakerDestRect.height);
                }
                graphics.drawImageRect(facesImage, speakerSrcRect, speakerDestRect);
            }
        },
        drawStatus: function(x, y, ally) {
            var color = ally.isActive ? constants.HILIGHT_WINDOW_BG_COLOR : null;
            color = _(ally).result("hp") > 0 ? color : constants.DEAD_WINDOW_BG_COLOR;

            actorRenderer.drawArchetypeFrame(ally.archetype, 0, direction.DOWN, x, y - constants.ACTOR_HEIGHT);
            renderer.drawTextWindow(x, y, STATUS_WINDOW_WIDTH, STATUS_WINDOW_HEIGHT, [
                _(ally).result("name").toUpperCase(),
                constants.chars.HEART + (""+_(ally).result("hp")).rset(4),
                constants.chars.STAR + (""+_(ally).result("mp")).rset(4)
            ], undefined, 'normal', color);
        },
        drawPointer: function(x, y) {
            graphics.drawText(x, y + 4, constants.chars.POINTER);
        }
    };
    return renderer;
});