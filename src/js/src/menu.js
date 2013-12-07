define(["radio", "underscore", "ee"], function(radio, _, EventEmitter) {
    "use strict";

    function Menu(options) {
        options = options || {};
        options.items = options.items || [];

        this.cols = options.cols || 1;
        this.rows = options.rows || options.items.length;
        this.items = options.items;
        this.colWidth = options.colWidth || 80;
        this.options = options;

        this.x = options.x === undefined ? 20 : options.x;
        this.y = options.y === undefined ? 20 : options.y;
        this.position = options.position || "relative";

        if (this.options.hierarchical) {
            this.on('select', function(e) {
                var child = _(e.item).result("childMenu");
                if (child instanceof Menu) {
                    child.open();
                }
            });
        }

        if (this.options.select) {
            this.on('select', this.options.select);
        }

        if (this.options.cancel) {
            this.on('cancel', this.options.cancel);
        }
    }
    Menu.prototype = Object.create(EventEmitter.prototype);

    Menu.prototype.close = function() {
        radio("/menu/close").broadcast(this);
        return this;
    };

    Menu.prototype.open = function() {
        radio("/menu/open").broadcast(this);
        return this;
    };

    return Menu;
});