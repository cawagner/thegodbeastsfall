define(["json!archetypes.json", "image-loader", "constants"], function(archetypes, imageLoader, constants) {
    "use strict";

    // TODO: doesn't really live here...
    var archetypeImages = {};
    _(archetypes).each(function(archetype, key) {
        if (archetype.imagePath !== undefined) {
            archetypeImages[archetype.imagePath] = imageLoader.loadImageSync(archetype.imagePath);
        }
    });

    var ActorRenderer = function(graphics) {
        var walkFrames = [1,0,1,2];

        var destRect = { x: 0, y: 0, width: 16, height: 18 };

        this.drawActor = function(actor, frame) {
            var frameToDraw,
                srcRect,
                archetype = archetypes[actor.archetype],
                image = archetypeImages[archetype.imagePath];

            if (!archetype.isHidden) {
                frameToDraw = actor.direction * 3 + walkFrames[frame|0];

                srcRect = graphics.getRectForFrame(frameToDraw + (archetype.startFrame || 0), image.width, 16, 18);

                destRect.x = actor.x * constants.TILE_SIZE;
                destRect.y = actor.y * constants.TILE_SIZE - 4;

                graphics.drawImageRect(image, srcRect, destRect);
            }
        };
    };

    return ActorRenderer;
});