define(["menu", "radio", "game-state"], function(Menu, radio, gameState) {
    "use strict";

    return {
        text: "Items",
        childMenu: function() {
            var items = gameState.inventory.getItems().map(function(item) {
                return {
                    text: "x" + item.quantity + " " + item.item.name,
                    item: item.item,
                    quantity: item.quantity
                };
            });
            var itemsMenu = new Menu({items: items});
            itemsMenu.on('select', function(e) {
                var itemVerbMenu = new Menu({
                    items: [
                        {
                            text: "Use " + e.item.item.name,
                            disabled: !(e.item.item.isFieldUsable || e.item.item.equipment)
                        },
                        "Look"
                    ],
                });
                itemVerbMenu.on('select', function(e) {
                    var oldItem,
                        text,
                        member = gameState.party[0],
                        newItem = e.item.item;
                    if (e.index === 0) {
                        // TODO: don't just try to equip it to Held...
                        if (newItem.equipment) {
                            oldItem = member.equipment.wear(newItem);
                            // TODO: remove new item from inventory, add old item to inventory

                            text = oldItem
                                ? member.name + " took off " + oldItem.name + " and wore " + newItem.name + "."
                                : member.name + " wore " + newItem.name + ".";

                            e.sender.close();
                            itemsMenu.close();

                            radio("/npc/talk").broadcast({ text: [text] });
                        }
                    }
                    if (e.index === 1) {
                        radio("/npc/talk").broadcast({ text: [item.item.desc] });
                    }
                });
                itemVerbMenu.open();
            });
            return itemsMenu;
        },
        disabled: function() {
            return gameState.inventory.getItems().length === 0;
        }
    };
});