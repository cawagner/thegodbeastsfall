define(["underscore", "json!archetypes.json", "image-loader", "graphics", "constants"], function(_, archetypes, imageLoader, graphics, constants) {
    "use strict";

    // TODO: doesn't really live here...
    var archetypeImages = {};
    _(archetypes).each(function(archetype, key) {
        if (archetype.imagePath !== undefined) {
            archetypeImages[archetype.imagePath] = imageLoader.loadImageSync(archetype.imagePath);
        }
    });

    var walkFrames = [1,0,1,2];

    var destRect = { x: 0, y: 0, width: constants.ACTOR_WIDTH, height: constants.ACTOR_HEIGHT };

    var renderer = {
        drawArchetypeFrame: function(archetypeName, frame, direction, x, y) {
            var archetype = archetypes[archetypeName];
            var frameToDraw = direction * 3 + walkFrames[frame];
            var srcRect;
            var image = archetypeImages[archetype.imagePath];

            if (!archetype.isHidden) {
                frameToDraw = direction * 3 + walkFrames[frame|0];

                srcRect = graphics.getRectForFrame(frameToDraw + (archetype.startFrame || 0), image.width,
                    constants.ACTOR_WIDTH,
                    constants.ACTOR_HEIGHT);

                destRect.x = x;
                destRect.y = y;

                graphics.drawImageRect(image, srcRect, destRect);
            }
        },
        drawActor: function(actor) {
            renderer.drawArchetypeFrame(
                actor.archetype,
                actor.frame,
                actor.direction,
                actor.x * constants.TILE_SIZE,
                actor.y * constants.TILE_SIZE - constants.ACTOR_HEAD
            );
        }
    };
    return renderer;
});