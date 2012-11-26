setupMap(function(map) {

    var Npc = require('actors/npc');
    var clurichaun = null;

    map.npcs.drachma.onTalk = function() {
        map.npcs.drachma.onTalk = function() {};

        this.say([{
            text: [
                "There, on the bookshelf, was a small coin.",
                "There is a small envelope next to it.",
                "It fills Held with an overwhelming sense of rainy days and laughter.",
                "Held feels compelled to takes both."
            ]
        }]);

        clurichaun = new Npc({
            archetype: 'earl',
            behavior: 'stationary'
        });
        map.addActor(clurichaun);
        clurichaun.warpTo(1, 13);
        clurichaun.onTalk = function() {
            var battle = $.subscribe("/battle/won", function() {
                clurichaun.say([
                    { text: ["No! This cannot be!"] }
                ]);
                map.removeActor(clurichaun);
                $.unsubscribe(battle);
            });
            $.publish("/battle/start", [["clurichaun"], { isBoss: true }]);
        };
    };

});