define(["underscore", "pubsub", "game-state", "menu"], function(_, pubsub, gameState, Menu) {
    "use strict";
    return {
        text: "Status",
        childMenu: function() {
            return new Menu({
                items: _(gameState.party).map(function(member) {
                    return { text: member.name, member: member };
                }),
                select: function(index, menuItem) {
                    pubsub.publish("/status/show", [menuItem.member]);
                }
            });
        }
    };
});