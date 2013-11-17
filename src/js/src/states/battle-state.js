define([
    "underscore",
    "util/subscription-set",
    "game-state",
    "pawns/pawns",
    "graphics",
    "gui",
    "battle/battle-message-state",
    "battle/battle-menu-state",
    "battle/battle-decision-state",
    "states/composite-state",
    "battle/battle-animations",
    "battle/battle-text-provider"
], function(
    _,
    subscriptionSet,
    gameState,
    pawns,
    graphics,
    gui,
    BattleMessageState,
    BattleMenuState,
    BattleDecisionState,
    CompositeState,
    battleAnimations,
    textProvider
) {
    "use strict";

    var MAX_ENEMIES = 3;

    function BattleState(enemies) {
        var self = this;

        this.playerPawns = _(gameState.party).map(function(character) {
            return new pawns.CharacterPawn(character);
        });

        this.enemyPawns = _(enemies).map(function(enemyId) {
            var pawn = new pawns.EnemyPawn(enemyId);
            pawn.display.effects.push(battleAnimations[pawn.enemy.idle || "slowWiggle"](pawn));
            return pawn;
        });

        this.rootState = new CompositeState();

        this.enqueueState(new BattleMessageState(textProvider.getAggressionText(this.enemyPawns)));
        this.enqueueState(new BattleMenuState(this));
        this.enqueueState(new BattleDecisionState(this));

        this.subscriptions = subscriptionSet();
        this.subscriptions.subscribe("/display/miss", function(pawn) {
            pawn.display.effects.push(battleAnimations.pushUp());
        });
        this.subscriptions.subscribe("/kill", function(pawn) {
            if (pawn.type === 'enemy') {
                pawn.display.effects.push(battleAnimations.shrinkDie(pawn));
            }
        });

        this.rootState.start();
    };

    BattleState.prototype.enqueueFunc = function(fn) {
        this.rootState.enqueueFunc(fn);
    };

    BattleState.prototype.enqueueState = function(state) {
        this.rootState.enqueueState(state);
    };

    BattleState.prototype.update = function() {
        var updatePawnEffects = function(pawn) {
            pawn.display.effects = _(pawn.display.effects).filter(function(effect) {
                return !effect.update();
            });
        };

        this.rootState.update();

        _(this.playerPawns).each(updatePawnEffects);
        _(this.enemyPawns).each(updatePawnEffects);
    };

    BattleState.prototype.end = function() {
        this.subscriptions.unsubscribe();
    };

    // OH NO this is wrong!
    BattleState.prototype.displayDamage = function(pawn, amount, isCritical) {
        // HACK
        var x = pawn.x + (pawn.rect ? pawn.rect.width / 2 : 0);
        var y = pawn.y - 20;
        var life = 30;
        var ym = -3;
        var wiggle = { x: 0, y: 0 };
        amount = amount+"";

        return {
            start: function() {
                pawn.display.effects.push(battleAnimations.pushDown());
            },
            update: function() {
                y = Math.min(pawn.y - 20, y + ym);
                ym += 0.5;
                if (isCritical) {
                    wiggle.x = 6*Math.random() - 3;
                    wiggle.y = 6*Math.random() - 3;
                }
                life--;
                return life < 0;
            },
            draw: function() {
                graphics.drawText(x + wiggle.x, y + wiggle.y, amount);
            }
        };
    };

    BattleState.prototype.displayAttack = function(pawn, effect) {
        return function() {
            pawn.display.effects.push(battleAnimations.wiggleAttack());
        };
    };

    BattleState.prototype.draw = function() {
        graphics.setFillColorRGB(0, 0, 0);
        graphics.drawFilledRect(0, 0, 320, 240);

        this.drawEnemies();
        this.drawAllies();

        this.rootState.draw();
    };

    BattleState.prototype.drawEnemies = function() {
        var margin = 160 - (this.enemyPawns.length-1)*50;

        _(this.enemyPawns).each(function(pawn, i) {
            var dest = {
                x: i * 100 + margin - pawn.rect.width / 2,
                y: 160 - pawn.rect.height,
                width: pawn.rect.width,
                height: pawn.rect.height
            };

            if (!pawn.isHidden) {
                _(pawn.display.effects).each(function(effect) {
                    effect.transform(dest);
                });

                pawn.x = dest.x;
                pawn.y = dest.y;

                graphics.drawImageRect(pawn.image, pawn.rect, dest);
            }
        });
    };

    BattleState.prototype.drawAllies = function() {
        _(this.playerPawns).each(function(pawn, i) {
            pawn.x = 200 + i * 60 + 18;
            pawn.y = 190;

            _(pawn.display.effects).each(function(effect) {
                // careful here...
                effect.transform(pawn);
            });

            gui.drawStatus(pawn.x - 18, pawn.y - 5, pawn);
        });
    };

    BattleState.prototype.wonBattle = function() {
        return _(this.enemyPawns).all(function(pawn) { return !pawn.isAlive(); });
    };

    BattleState.prototype.lostBattle = function() {
        return _(this.playerPawns).all(function(pawn) { return pawn.isDying || !pawn.isAlive(); });
    };

    return BattleState;
});