define([
    "underscore",
    "pubsub",
    "battle/battle-message-state",
    "battle/battle-won-state",
    "battle/battle-action-executor",
    "battle/battle-text-provider"
], function(_, pubsub, BattleMessageState, BattleWonState, actionExecutor, textProvider) {
    "use strict";

    // TODO: this whole file is a mess... lol 3:00AM

    return function BattleExecuteState(battleState, actions, nextRound) {
        var xpPerPerson = function() {
            var totalXp = 0;
            _(battleState.enemyPawns).each(function(pawn) {
                totalXp += pawn.xp();
            });
            return Math.ceil(totalXp / battleState.playerPawns.length);
        };

        var playMusic = function(name) {
            battleState.enqueueFunc(function() { pubsub.publish("/music/play", [name]); });
        };

        var wonBattle = function() {
            return _(battleState.enemyPawns).all(function(pawn) { return !pawn.isAlive(); });
        };

        var lostBattle = function() {
            return _(battleState.playerPawns).all(function(pawn) { return pawn.isDying || !pawn.isAlive(); });
        };

        var winBattle = function() {
            var xp = xpPerPerson();
            var drops = {};

            // get spoils
            _(battleState.enemyPawns).each(function(pawn) {
                _(pawn.enemy.drops || {}).each(function(chance, item) {
                    if (Math.random() <= chance) {
                        if (item in drops) {
                            drops[item]++;
                        } else {
                            drops[item] = 1;
                        }
                    }
                });
            });

            playMusic("victory");

            battleState.enqueueState(new BattleMessageState([
                textProvider.getMessage("wonBattle"),
                "Got " + xp + "XP each!"
            ]));
            battleState.enqueueState(new BattleWonState(xp, drops));
        };

        var loseBattle = function() {
            playMusic("defeat");

            battleState.enqueueState(new BattleMessageState([
                "It looks like you got your head handed to you...."
            ]));

            battleState.enqueueFunc(function() {
                pubsub.publish("/battle/end", [{ won: false }]);
            });
        }

        this.start = function() {
            var xp;

            _(actions).each(function(action) {
                battleState.enqueueState(actionExecutor[action.type](action, battleState));
            });

            battleState.enqueueFunc(function refresh() {
                _(battleState.playerPawns).each(function(player) {
                    var refresh = player.refresh();
                    battleState.enqueueState(actionExecutor.refresh({ effects: refresh, targets: [player] }, battleState));
                });
                _(battleState.enemyPawns).each(function(enemy) {
                    var refresh = enemy.refresh();
                    battleState.enqueueState(actionExecutor.refresh({ effects: refresh, targets: [enemy] }, battleState));
                });
                battleState.enqueueFunc(function() {
                    if (wonBattle()) {
                        winBattle();
                    } else if (lostBattle()) {
                        loseBattle();
                    } else {
                        nextRound();
                    }
                });
            });
        };
        this.update = function() { return true; };
        this.draw = _.noop;
    };
});