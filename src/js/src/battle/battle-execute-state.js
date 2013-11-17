define([
    "underscore",
    "radio",
    "sound",
    "battle/battle-message-state",
    "battle/battle-won-state",
    "battle/battle-action-executor",
    "battle/battle-text-provider"
], function(_, radio, sound, BattleMessageState, BattleWonState, actionExecutor, textProvider) {
    "use strict";

    // TODO: this whole file is a mess... lol 3:00AM

    return function BattleExecuteState(battleState, actions, nextRound) {
        var xpPerPerson = function() {
            var totalXp = 0;
            battleState.enemyPawns.forEach(function(pawn) {
                totalXp += pawn.xp();
            });
            return Math.ceil(totalXp / battleState.playerPawns.length);
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
            battleState.enemyPawns.forEach(function(pawn) {
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

            sound.playMusic("victory");

            battleState.enqueueState(new BattleMessageState([
                textProvider.getMessage("wonBattle"),
                "Got " + xp + "XP each!"
            ]));
            battleState.enqueueState(new BattleWonState(xp, drops));
        };

        var loseBattle = function() {
            sound.playMusic("defeat");

            battleState.enqueueState(new BattleMessageState([
                "It looks like you got your head handed to you...."
            ]));

            battleState.enqueueFunc(function() {
                radio("/battle/end").broadcast({ won: false });
            });
        }

        this.start = function() {
            var xp;

            actions.forEach(function(action) {
                battleState.enqueueState(actionExecutor[action.type](action, battleState));
            });

            battleState.enqueueFunc(function refresh() {
                battleState.playerPawns.forEach(function(player) {
                    var isDying = player.isDying;
                    var refresh = player.refresh();
                    battleState.enqueueState(actionExecutor.refresh({ effects: refresh, targets: [player] }, battleState));

                    if (isDying && player.isDead) {
                        battleState.enqueueState(new BattleMessageState([
                            player.name + " collapsed!"
                        ]));
                    }
                });
                battleState.enemyPawns.forEach(function(enemy) {
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
        this.draw = function() { };
    };
});