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
            pubsub: "../lib/pubsub",
            text: "../lib/requirejs-plugins/text",
            image: '../lib/requirejs-plugins/image',
            json: '../lib/requirejs-plugins/json',
            noext: '../lib/requirejs-plugins/noext',
            audio: '../lib/requirejs-plugins/audio',
            campaign: '../../assets/data/campaign',
            skills: '../../assets/data/skills',
            enemies: '../../assets/data/enemies'
        },
        urlArgs: "bust=" + Date.now()
    });

    require(["main"], function(main) {
        main.init();
    });
})();