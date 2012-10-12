define(["jquery", "underscore", "pubsub"], function($, _) {
    "use strict";

    function Menu(options) {
        this.cols = 1;
        this.rows = options.length;
        this.options = options;

        this.x = 20;
        this.y = 20;

        this.selectHandlers = [];
        this.cancelHandlers = [];
    }

    Menu.prototype.position = function(x, y) {
        this.x = x;
        this.y = y;
        return this;
    };

    Menu.prototype.size = function(rows, cols) {
        this.rows = rows;
        this.cols = cols || this.cols;
        return this;
    };

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