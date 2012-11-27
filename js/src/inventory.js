define(["underscore", "json!items.json"], function(_, items) {
    "use strict";

    var MAX_ITEMS_OF_TYPE = 5;

    function Inventory() {
        this.items = {};
    };

    // returns how many of an item was really added.
    Inventory.prototype.addItem = function(itemId, quantityToAdd) {
        var item  = this.items[itemId] || {
            quantity: 0,
            item: items[itemId]
        };
        var previousQuantity = item.quantity;
        item.quantity = Math.min(MAX_ITEMS_OF_TYPE, item.quantity + (quantityToAdd || 0));
        this.items[itemId] = item;

        return item.quantity - previousQuantity;
    };

    // returns how many of an item were really removed.
    Inventory.prototype.removeItem = function(itemId, quantityToRemove) {
        var item, previousQuantity;
        if (itemId in this.items) {
            item = this.items[itemId];
            previousQuantity = item.quantity;
            item.quantity = Math.max(0, item.quantity - quantityToRemove);
            if (item.quantity === 0) {
                delete this.items[itemId];
            }
            return Math.min(quantityToRemove, previousQuantity);
        } else {
            return 0;
        }
    };

    Inventory.prototype.hasItem = function(itemId) {
        return itemId in this.items && this.items[itemId].quantity > 0;
    };

    Inventory.prototype.getItems = function(flag) {
        var self = this;
        return _(Object.keys(this.items)).map(function(key) {
            return { itemId: key, item: self.items[key].item, quantity: self.items[key].quantity };
        });
    };

    Inventory.prototype.hasBattleUsableItems = function() {
        return false;
    };

    return Inventory;
});