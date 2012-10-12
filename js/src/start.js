(function() {
    "use strict";

    require.config({
        shim: {
            jquery: { exports: "$" },
            underscore: { exports: "_" },
            pubsub: {
                deps: [ "jquery" ]
            }
        },
        paths: {
            jquery: "../lib/jquery-1.8.2",
            underscore: "../lib/underscore",
            pubsub: "../lib/pubsub"
        }
    });

    require(["main"], function(main) {
        main.init();
    });
})();