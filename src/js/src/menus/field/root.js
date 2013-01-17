define([
    "menu",
    "game-state",
    "gui",
    "menus/field/status",
    "menus/field/skills",
    "menus/field/items",
    "menus/field/system"
], function(
    Menu,
    gameState,
    gui,
    statusMenu,
    skillsMenu,
    itemsMenu,
    systemMenu
) {
    "use strict";

    return new Menu({
        rows: 2,
        cols: 2,
        hierarchical: true,
        items: [
            statusMenu,
            skillsMenu,
            itemsMenu,
            systemMenu
        ],
        draw: function() {
            var party = gameState.party,
                x = 260 - 60 * (party.length - 1),
                i;

            for (i = 0; i < party.length; ++i) {
                gui.drawStatus(x, 180, party[i]);
                x += 60;
            }
        }
    });
});