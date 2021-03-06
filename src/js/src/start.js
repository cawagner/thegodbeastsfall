(function() {
    "use strict";

    require.config({
        shim: {
            underscore: { exports: "_" },
            radio: { exports: "radio" }
        },
        paths: {
            "reqwest": "../lib/reqwest",
            "radio": "../lib/radio.min",
            "rsvp": "../lib/rsvp-latest.amd",
            "underscore": "../lib/underscore",
            "handjs": "../lib/hand-1.2.2",
            "ee": "../lib/EventEmitter",
            "text": "../lib/requirejs-plugins/text",
            "image": '../lib/requirejs-plugins/image',
            "json": '../lib/requirejs-plugins/json',
            "noext": '../lib/requirejs-plugins/noext',
            "audio": '../lib/requirejs-plugins/audio',
            "campaign": '../../assets/data/campaign',
            "map": '../../assets/maps',
            "skills": '../../assets/data/skills',
            "enemies": '../../assets/data/enemies',
            "enemy-families": '../../assets/data/enemy-families',
            "items": '../../assets/data/items',
            "archetypes": '../../assets/data/archetypes',
            "speakers": '../../assets/data/speakers',
            "spell-animations": '../../assets/data/spell-animations',
            "skill-text-functions": "../../assets/code/skill-text-functions",
            "battle-messages": "../../assets/text/battle-messages"
        }
    });

    require(["main", "underscore", "util/underscore-mixins", "util/string"], function(main) {
        main.init();
    });
})();