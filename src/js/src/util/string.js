define([], function() {
    "use strict";

    String.prototype.repeat = function(times) {
        return new Array(times + 1).join(this);
    };

    String.prototype.lset = function(length) {
        if (this.length < length) {
            return this + " ".repeat(length - this.length);
        }
        return this;
    };

    String.prototype.rset = function(length) {
        if (this.length < length) {
            return " ".repeat(length - this.length) + this;
        }
        return this;
    };

    String.prototype.wordWrap = function(maxLength) {
        var str = this, lines = [], line = "", i;

        str.split(' ').forEach(function(word) {
            if (line.length + word.length >= maxLength) {
                lines.push(line);
                line = "";
            }
            line += word + " ";
        });
        if (line !== "") {
            lines.push(line);
        }

        return lines;
    };

    String.prototype.startsWith = function(start) {
        return this.substr(0, start.length) === start;
    };
});