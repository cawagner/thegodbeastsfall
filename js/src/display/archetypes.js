define(["underscore"], function(_) {
    var archetypes = {
        "hero": {
            imagePath: "assets/img/hero.png"
        },
        "heroine": {
            imagePath: "assets/img/heroine.png"
        },
        "oldman": {
            imagePath: "assets/img/oldman.png"
        },
        "littlegirl": {
            imagePath: "assets/img/littlegirl.png"
        },
        "earl": {
            imagePath: "assets/img/earl.png"
        },
        "bgobj": {
            isHidden: true
        }
    };
    _(archetypes).each(function(archetype, key) {
        if (archetype.imagePath !== undefined) {
            archetype.image = new Image();
            archetype.image.src = archetype.imagePath;
        }
    });
    return archetypes;
});