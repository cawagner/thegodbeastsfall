define([], function() {
    "use strict";

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
            name: "Old Fogy"
        },
        "littlegirl": {
            name: "Little Girl"
        },
        "earl": {
            name: "Man"
        },
        "oldwoman": {
            name: "Crone"
        }
    };
});
