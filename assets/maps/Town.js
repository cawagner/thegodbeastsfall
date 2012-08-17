setupMap(function(map) {
    map.npcs["oldman"].onTalk = function(hero) {
        var message = {
            speaker: "oldman",
            text: [
                "Mirv is appealing to me"
            ]
        };
        haveConversation([message], hero, this);
    };
});
