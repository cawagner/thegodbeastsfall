define([
    "underscore",
    "game-state",
    "pawns/pawns",
    "gui",
    "battle/battle-message-state",
    "battle/battle-menu-state",
    "battle/battle-decision-state",
    "battle/battle-composite-state"
], function(
    _,
    gameState,
    pawns,
    GuiRenderer,
    BattleMessageState,
    BattleMenuState,
    BattleDecisionState,
    BattleCompositeState
) {
    "use strict";

    var PI_180 = Math.PI / 180;

    var battleAnimations = {
        pushDown: function() {
            var pushingDown = 4;
            var pushDown = 1;
            return {
                update: function() {
                    pushDown += pushingDown;
                    pushingDown -= 0.5;
                    return pushDown <= 0;
                },
                transform: function(dest) {
                    dest.y += pushDown;
                }
            };
        },
        pushUp: function(pawn) {
            var pushUp = 1;
            var pushingUp = 4;
            return {
                update: function() {
                    pushUp += pushingUp;
                    pushingUp -= 0.5;
                    return pushUp <= 0;
                },
                transform: function(dest) {
                    dest.y -= pushUp;
                }
            };
        },
        wiggleAttack: function(pawn) {
            var wave = 0;
            return {
                transform: function(dest) {
                    dest.x += Math.sin(wave) * 8;
                    dest.y += Math.abs(Math.sin(wave)) * 2;
                },
                update: function() {
                    wave += Math.PI / 10;
                    return wave >= 2*Math.PI;
                }
            };
        }
    };

    function BattleState(enemies) {
        var self = this;

        this.gui = new GuiRenderer(Game.instance.graphics);

        this.playerPawns = _(gameState.party).map(function(character) {
            return new pawns.CharacterPawn(character);
        });

        this.enemyPawns = _(enemies).map(function(enemy) {
            return new pawns.EnemyPawn(enemy);
        });

        this.rootState = new BattleCompositeState();

        this.enqueueState(new BattleMessageState(_(this.enemyPawns).map(_.template("Aggressed by {{name}}!"))));
        this.enqueueState(new BattleMenuState(this));
        this.enqueueState(new BattleDecisionState(this));

        this.rootState.start();
    };

    BattleState.prototype.enqueueFunc = function(fn) {
        this.rootState.enqueueFunc(fn);
    };

    BattleState.prototype.enqueueState = function(state) {
        this.rootState.enqueueState(state);
    };

    BattleState.prototype.update = function() {
        this.rootState.update();

        _(this.playerPawns).each(function(pawn) {
            pawn.display.effects = _(pawn.display.effects).filter(function(effect) {
                return !effect.update();
            });
        });
        _(this.enemyPawns).each(function(pawn) {
            if (pawn.isHidden) {
                pawn.dying = pawn.dying || 0;
                pawn.dying += 0.5 + pawn.dying / 4;
            }
            if (Math.random() < 0.025) {
                pawn.wander.x = Math.floor(Math.random() * 2) - 2;
                pawn.wander.y = Math.floor(Math.random() * 2) - 2;
            }
            pawn.display.effects = _(pawn.display.effects).filter(function(effect) {
                return !effect.update();
            });
        });
    };

    // OH NO this is wrong!
    BattleState.prototype.displayDamage = function(pawn, amount, isCritical) {
        // HACK
        var x = pawn.x;
        if (pawn.rect) {
            x += pawn.rect.width / 2;
        }
        var y = pawn.y - 20;
        var life = 40;
        var ym = -2;
        amount = amount+"";

        return {
            start: function() {
                pawn.display.effects.push(battleAnimations.pushDown());
            },
            update: function() {
                y = Math.min(pawn.y - 20, y + ym);
                ym += 0.25;
                if (isCritical) {
                    x += Math.random()*2 - 1;
                }
                life--;
                return life < 0;
            },
            draw: function() {
                Game.instance.graphics.drawText(x, y, amount);
            }
        };
    };

    BattleState.prototype.displayMiss = function(pawn) {
        return function() {
            pawn.display.effects.push(battleAnimations.pushUp());
        };
    };

    BattleState.prototype.displayAttack = function(pawn, effect) {
        return function() {
            pawn.display.effects.push(battleAnimations.wiggleAttack());
        };
    };

    BattleState.prototype.draw = function() {
        Game.instance.graphics.setFillColorRGB(0, 0, 0);
        Game.instance.graphics.drawFilledRect(0, 0, 320, 240);

        // draw enemies
        this.drawEnemies();
        this.drawAllies();

        this.rootState.draw();
    };

    BattleState.prototype.drawEnemies = function() {
        var MAX_ENEMIES = 3;
        var i, pawn, dest, margin = 160 - (this.enemyPawns.length-1)*50;

        for (i = 0; i < this.enemyPawns.length; ++i) {
            pawn = this.enemyPawns[i];
            if (pawn.isHidden) {
                if (pawn.dying >= pawn.rect.width / 2) {
                    continue;
                }
            }
            dest = {
                x: i * 100 + margin - pawn.rect.width / 2 + (pawn.dying || pawn.wander.x),
                y: 160 - pawn.rect.height + pawn.wander.y,
                width: pawn.rect.width - 2*(pawn.dying || 0),
                height: pawn.rect.height
            };

            // TODO: move effects out!
            _(pawn.display.effects).each(function(effect) {
                effect.transform(dest);
            });

            pawn.x = dest.x;
            pawn.y = dest.y;

            Game.instance.graphics.drawImageRect(pawn.image, pawn.rect, dest);
        }
    };

    BattleState.prototype.drawAllies = function() {
        var i, pawn;
        for (i = 0; i < this.playerPawns.length; ++i) {
            var pawn = this.playerPawns[i];
            pawn.x = 200 + i * 60 + 18;
            pawn.y = 190;

            _(pawn.display.effects).each(function(effect) {
                // careful here...
                effect.transform(pawn);
            });

            this.gui.drawStatus(pawn.x - 18, pawn.y - 5, pawn);
        }
    }

    return BattleState;
});