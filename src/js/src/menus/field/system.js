define(["menu", "radio", "game-state"], function(Menu, radio, gameState) {
    "use strict";

    return {
        text: "System",
        childMenu: new Menu({
            items: [
                {
                    text: "Save",
                    select: function() {
                        gameState.save(0);
                        radio("/npc/talk").broadcast({ text: ["Game saved!"] });
                    }
                },
                {
                    text: "Load",
                    disabled: function() { return !localStorage.getItem("saveGame0"); },
                    select: function(menu) {
                        gameState.load(0);
                        menu.close();
                        // TODO: close parent menu again...
                        // self.menu.close();
                    }
                }
            ],
            select: function(index, item) {
                item.select(this);
            }
        }),
    };
});