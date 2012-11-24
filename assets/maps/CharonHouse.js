setupMap(function(map) {

    map.npcs.drachma.onTalk = function() {
        // we'll flesh this out over time...
        $.publish("/battle/start", [["clurichaun"], { isBoss: true }]);
    };

});