define(["data/items"], function(items) {
    "use strict";

    function Equipment(wearing) {
        this.slots = {};
        this.populateFromJSON(wearing);
    };

    Equipment.prototype.populateFromJSON = function(wearing) {
        var slot;
        for (slot in wearing) {
            if (wearing.hasOwnProperty(slot)) {
                this.slots[slot] = items[wearing[slot]];
            }
        }
    };

    Equipment.prototype.get = function(slot) {
        return this.slots[slot];
    };

    Equipment.prototype.wear = function(item) {
        var oldItem = this.slots[item.equipment.slot];
        this.slots[item.equipment.slot] = item;
        return oldItem;
    };

    Equipment.prototype.calc = function(stat) {
        var sum = 0;
        var slot, item;
        for (slot in this.slots) {
            item = this.slots[slot];
            sum += item.equipment[stat] || 0;
        }
        return sum;
    };

    Equipment.prototype.toJSON = function() {
        var obj = {};
        var slot;
        for (slot in this.slots) {
            if (this.slots.hasOwnProperty(slot)) {
                obj[slot] = this.slots[slot].id;
            }
        }
        return obj;
    };

    return Equipment;
});