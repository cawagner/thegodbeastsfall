define(["menu", "radio", "game-state"], function(Menu, radio, gameState) {
    "use strict";

    return {
        text: "System",
        childMenu: function() {
            return new Menu({
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
                        select: function(e) {
                            e.sender.on("closed", function() {
                                gameState.load(0);
                            });
                            e.sender.close();
                        }
                    }
                ],
                select: function(e) {
                    e.item.select(e);
                }
            });
        }
    };
});