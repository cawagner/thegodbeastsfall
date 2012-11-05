define(["jquery", "underscore", "pubsub"], function($, _) {
    "use strict";

    function Menu(options) {
        options = options || {};
        options.items = options.items || [];

        this.cols = options.cols || 1;
        this.rows = options.rows || options.items.length;
        this.items = options.items;
        this.options = options;

        this.x = 20;
        this.y = 20;

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
        $.publish("/menu/close", [this]);
        return this;
    };

    Menu.prototype.open = function() {
        $.publish("/menu/open", [this]);
        return this;
    };

    return Menu;
});