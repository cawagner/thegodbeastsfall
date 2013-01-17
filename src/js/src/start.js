(function() {
    "use strict";

    require.config({
        shim: {
            jquery: { exports: "$" },
            underscore: { exports: "_" }
        },
        paths: {
            "jquery": "../lib/jquery-1.8.2",
            "underscore": "../lib/underscore",
            "pubsub": "../lib/pubsub",
            "text": "../lib/requirejs-plugins/text",
            "image": '../lib/requirejs-plugins/image',
            "json": '../lib/requirejs-plugins/json',
            "noext": '../lib/requirejs-plugins/noext',
            "audio": '../lib/requirejs-plugins/audio',
            "campaign": '../../assets/data/campaign',
            "skills": '../../assets/data/skills',
            "enemies": '../../assets/data/enemies',
            "enemy-families": '../../assets/data/enemy-families',
            "items": '../../assets/data/items',
            "archetypes": '../../assets/data/archetypes',
            "speakers": '../../assets/data/speakers',
            "skill-text-functions": "../../assets/code/skill-text-functions",
            "battle-messages": "../../assets/text/battle-messages"
        },
        urlArgs: "bust=" + Date.now()
    });

    require(["main", "underscore", "util/underscore-mixins", "util/string"], function(main) {
        main.init();
    });
})();