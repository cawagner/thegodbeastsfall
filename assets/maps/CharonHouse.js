setupMap(function(map) {

    var Npc = require('actors/npc');
    var clurichaun = null;

    map.npcs.drachma.onTalk = function() {
        map.npcs.drachma.onTalk = function() {};

        this.say([
            "There, on the bookshelf, was a small coin.",
            "There is a small envelope next to it.",
            "It fills Helt with an overwhelming sense of rainy days and laughter.",
            "Helt feels compelled to takes both."
        ]);

        clurichaun = new Npc({
            archetype: 'earl',
            behavior: 'stationary'
        });
        map.addActor(clurichaun);
        clurichaun.warpTo(1, 13);
        clurichaun.onTalk = function() {
            clurichaun.onTalk = function(){};
            var battle = $.subscribe("/battle/won", function() {
                $.unsubscribe(battle);
                clurichaun.say([
                    "Fine... beat up a helpless faerie.",
                    "Look at you with your big, strong human muscles.",
                    "I hope you're really proud of yourself."
                ]).done(function() {
                    map.removeActor(clurichaun);
                });
            });
            this.say([
                "Hey, man... that's MY drachma.",
                "Dude.",
                "No.",
                "Seriously.",
                "I need that.",
                "You don't even know how flippin' rare those are these days.",
                "I tell you, it's enough to make any leprechaun take up drinking.",
                "What? You're... fine, you villain, take what's coming to you!"
            ]).done(function() {
                $.publish("/battle/start", [["clurichaun"], { isBoss: true }]);
            });
        };
    };

});