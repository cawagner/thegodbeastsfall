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
                var selectedItem = e.item.item;
                var itemVerbMenu = new Menu({
                    items: [
                        {
                            text: "Use " + selectedItem.name,
                            disabled: !(selectedItem.isFieldUsable || selectedItem.equipment)
                        },
                        "Look"
                    ],
                });
                itemVerbMenu.on('select', function(e) {
                    var oldItem,
                        text,
                        member = gameState.party[0];

                    if (e.index === 0) {
                        // TODO: don't just try to equip it to Held...
                        if (selectedItem.equipment) {
                            oldItem = member.equipment.wear(selectedItem);

                            if (oldItem) {
                                gameState.inventory.addItem(oldItem.id);
                            }
                            gameState.inventory.removeItem(selectedItem.id);

                            text = oldItem
                                ? member.name + " took off " + oldItem.name + " and wore " + selectedItem.name + "."
                                : member.name + " wore " + selectedItem.name + ".";

                            e.sender.close();
                            itemsMenu.close();

                            radio("/npc/talk").broadcast({ text: [text] });
                        }
                    }
                    if (e.index === 1) {
                        radio("/npc/talk").broadcast({ text: [selectedItem.desc] });
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