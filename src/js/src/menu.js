define(["radio", "underscore"], function(radio, _) {
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

        this.selectHandlers = [];
        this.cancelHandlers = [];

        if (this.options.hierarchical) {
            this.select(function(index, item) {
                var child = _(item).result("childMenu");
                if (child instanceof Menu) {
                    child.open();
                }
            });
        }

        if (this.options.select) {
            this.select(this.options.select);
        }

        if (this.options.cancel) {
            this.cancel(this.options.cancel);
        }
    }

    Menu.prototype.select = function(fn) {
        this.selectHandlers.push(fn);
        return this;
    };

    Menu.prototype.triggerSelect = function(selectionIndex, item) {
        var self = this;
        _(this.selectHandlers).each(function(f) {
            f.call(self, selectionIndex, item);
        });
    };

    Menu.prototype.cancel = function(fn) {
        this.cancelHandlers.push(fn);
        return this;
    };

    Menu.prototype.triggerCancel = function() {
        var self = this, suppressClose;
        _(this.cancelHandlers).each(function(f) {
            suppressClose = suppressClose || (f.call(self) === false);
        });
        if (!suppressClose) {
            self.close();
        }
    }

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