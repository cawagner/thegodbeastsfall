define(["display/archetypes", "constants"], function(archetypes, constants) {
    "use strict";

    var ActorRenderer = function(graphics) {
        var walkFrames = [1,0,1,2];

        var destRect = { x: 0, y: 0, width: 16, height: 18 };

        this.drawActor = function(actor, frame) {
            var frameToDraw, srcRect, archetype = archetypes[actor.archetype];

            if (archetype.isHidden)
                return;

            frameToDraw = actor.direction * 3 + walkFrames[Math.floor(frame)];

            srcRect = graphics.getRectForFrame(frameToDraw, archetype.image.width, 16, 18);

            destRect.x = actor.x * constants.TILE_SIZE;
            destRect.y = actor.y * constants.TILE_SIZE - 4;

            graphics.drawImageRect(archetype.image, srcRect, destRect);
        };
    };

    return ActorRenderer;
});