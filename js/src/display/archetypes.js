define(["underscore", "json!archetypes.json"], function(_, archetypes) {
    "use strict";

    _(archetypes).each(function(archetype, key) {
        if (archetype.imagePath !== undefined) {
            archetype.image = new Image();
            archetype.image.src = archetype.imagePath;
        }
    });
    return archetypes;
});