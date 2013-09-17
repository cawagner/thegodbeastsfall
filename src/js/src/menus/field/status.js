define(["radio", "game-state", "menu"], function(radio, gameState, Menu) {
    "use strict";
    return {
        text: "Status",
        childMenu: function() {
            return new Menu({
                items: gameState.party.map(function(member) {
                    return { text: member.name, member: member };
                }),
                select: function(index, menuItem) {
                    radio("/status/show").broadcast(menuItem.member);
                }
            });
        }
    };
});