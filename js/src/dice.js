define([], function() {
    /** @constructor */
    function Dice(dieCollection) {
        this.dieCollection = function() { return dieCollection; };
        this.die = function(i) { return dieCollection[i]; }
    }

    /** @constructor */
    Dice.Die = function(times, sides, scalar) {
        this.times = function() { return times; };
        this.scalar = function() { return scalar; };
        this.sides = function() { return sides; };
        this.roll = function(roller) {
            var value = 0;
            var i;
            for (i = 0; i < times; ++i) {
                value += roller(sides, scalar);
            }
            return scalar * value;
        };
        this.toString = function() {
            return ((scalar != 1) ? (scalar+"x") : "") + times + "d" + sides;
        }
        return this;
    }

    /** @constructor */
    Dice.Choose = function(times, sides, choose, scalar) {
        var die = new Dice.Die(times, sides, scalar);
        die.choose = function() { return choose; };
        die.roll = function(roller) {
            var values = [];
            var i;
            for (i = 0; i < times; ++i) {
                values.push(roller(sides, scalar));
            }
            values.sort();
            values.reverse();

            var value = 0;
            for (i = 0; i < choose; ++i) {
                value += values[i];
            }
            return scalar * value;
        };
        die.toString = function() {
            return ((scalar != 1) ? (scalar+"x") : "") + times + "d" + sides + "k" + choose;
        }
        return die;
    }

    /** @constructor */
    Dice.Constant = function(k) {
        this.value = function() { return k; };
        this.roll = this.value;
        this.toString = this.value;
    }

    Dice.prototype.toString = function() {
        var result = '';
        var i;
        for (i = 0; i < this.dieCollection().length; ++i) {
            if (i > 0) result += ' + ';
            result += this.die(i).toString();
        }
        return result;
    }

    Dice.prototype.roll = function(roller) {
        roller = roller || Dice.defaultRoller;
        var value = 0;
        var i;
        for (i = 0; i < (this.dieCollection()).length; ++i) {
            var die = (this.dieCollection())[i];
            value += die.roll(roller);
        }
        return value;
    }

    Dice.prototype.times = function(times, callback, roller) {
        if (times <= 0) {
            throw "what does this mean";
        }
        for (var i = 0; i < times; ++i) {
            callback(this.roll(roller));
        }
    }

    Dice.prototype.min = function() {
        return this.roll(Dice.minRoller);
    }

    Dice.prototype.max = function() {
        return this.roll(Dice.maxRoller);
    }

    Dice.defaultRoller = function(sides) {
        return 1 + Math.floor(Math.random()*sides);
    }

    Dice.minRoller = function(sides, scalar) {
        return (scalar < 0) ? sides : 1;
    }

    Dice.maxRoller = function(sides, scalar) {
        return (scalar > 0) ? sides : 1;
    }

    Dice.midRoller = function(sides, scalar) {
        return Math.floor(sides / 2);
    }

    Dice.parse = function(str) {
        str = str.toLowerCase();
        str = str.replace(/\s*/g, '');
        str = str.replace('+-', '-').replace('*', 'x');

        if (!str.match(/(?:\d+x)?\d*(?:d\d+(?:k\d+)?)?(?:(?:\+|-)(?:\d+x)?\d*(?:d\d+(?:k\d+))?)*/)) {
            throw "Error in dice notation";
        }

        var times = '';
        var constant = '';
        var dice = [];
        var scalar = 1;
        var choose = void(undefined);

        var reset = function() {
            times = '';
            constant = '';
            scalar = 1;
            choose = void(undefined);
        };

        var append = function() {
            if (!times) {
                dice.push(new Dice.Constant(scalar * parseInt(constant, 10)));
            } else {
                if (choose === void(undefined)) {
                    dice.push(new Dice.Die(parseInt(times, 10), parseInt(constant, 10), scalar));
                } else {
                    dice.push(new Dice.Choose(parseInt(times, 10), parseInt(constant, 10), choose, scalar));
                }
            }
            reset();
        };

        for (var i = 0; i < str.length; ++i) {
            if (str[i].match(/\d/)) {
                constant += str[i];
            } else if (str[i] === '%') {
                constant = '100';
            } else if (str[i] === 'x') {
                scalar *= parseInt(constant, 10);
                constant = '';
            } else if(str[i] === 'd') {
                if (constant === '')
                    constant = 1;
                times = constant;
                constant = '';
            } else if (str[i] === 'k') {
                choose = '';
                while (i + 1 < str.length && str[i+1].match(/\d/)) {
                    choose += str[i+1];
                    ++i;
                }
                choose = parseInt(choose, 10);
            } else if(str[i] === '+') {
                append();
            } else if (str[i] === '-') {
                append();
                scalar = -1;
            }
        }
        append();

        return new Dice(dice);
    }

    return Dice;
});