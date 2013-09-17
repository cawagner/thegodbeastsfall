define(["menu", "radio", "game-state"], function(Menu, radio, gameState) {
    "use strict";

    return {
        text: "Items",
        childMenu: function() {
            var items = gameState.inventory.getItems().map(function(item) {
                return { text: "x" + item.quantity + " " + item.item.name, item: item.item, quantity: item.quantity };
            });
            var itemsMenu = new Menu({
                items: items,
                select: function(index, item) {
                    new Menu({
                        items: [
                            {
                                text: "Use " + item.item.name,
                                disabled: !(item.item.isFieldUsable || item.item.equipment)
                            },
                            "Look"
                        ],
                        select: function(index) {
                            var oldItem, text, member = gameState.party[0];
                            if (index === 0) {
                                // TODO: don't just try to equip it to Held...
                                if (item.item.equipment) {
                                    oldItem = member.equipment.wear(item.item);
                                    // TODO: remove new item from inventory, add old item to inventory

                                    text = oldItem
                                        ? member.name + " took off " + oldItem.name + " and wore " + item.item.name + "."
                                        : member.name + " wore " + item.item.name + ".";

                                    this.close();
                                    itemsMenu.close();

                                    radio("/npc/talk").broadcast({ text: [text] });
                                }
                            }
                            if (index === 1) {
                                radio("/npc/talk").broadcast({ text: [item.item.desc] });
                            }
                        }
                    }).open();
                }
            });
            return itemsMenu;
        },
        disabled: function() {
            return gameState.inventory.getItems().length === 0;
        }
    };
});