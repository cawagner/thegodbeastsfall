define(["json!archetypes.json", "image-loader", "constants"], function(archetypes, imageLoader, constants) {
    "use strict";

    // TODO: doesn't really live here...
    var archetypeImages = {};
    _(archetypes).each(function(archetype, key) {
        if (archetype.imagePath !== undefined) {
            archetypeImages[archetype.imagePath] = imageLoader.loadImageSync(archetype.imagePath);
        }
    });

    return function ActorRenderer(graphics) {
        var walkFrames = [1,0,1,2];

        var destRect = { x: 0, y: 0, width: constants.ACTOR_WIDTH, height: constants.ACTOR_HEIGHT };

        this.drawActor = function(actor) {
            var frameToDraw,
                srcRect,
                archetype = archetypes[actor.archetype],
                image = archetypeImages[archetype.imagePath];

            if (!archetype.isHidden) {
                frameToDraw = actor.direction * 3 + walkFrames[actor.frame|0];

                srcRect = graphics.getRectForFrame(frameToDraw + (archetype.startFrame || 0), image.width, constants.ACTOR_WIDTH, constants.ACTOR_HEIGHT);

                destRect.x = actor.x * constants.TILE_SIZE;
                destRect.y = actor.y * constants.TILE_SIZE - constants.ACTOR_HEAD;

                graphics.drawImageRect(image, srcRect, destRect);
            }
        };
    };
});