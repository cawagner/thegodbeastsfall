define(["json!items.json"], function(items) {
    "use strict";

    for (var key in items) {
        if (items.hasOwnProperty(key)) {
            items[key].id = key;
        }
    }

    return items;
});