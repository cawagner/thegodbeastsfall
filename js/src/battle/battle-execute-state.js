define([
    "underscore",
    "jquery",
    "battle/battle-message-state",
    "battle/battle-won-state",
    "battle/battle-action-executor"
], function(_, $, BattleMessageState, BattleWonState, actionExecutor) {
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
            battleState.enqueueFunc(function() { $.publish("/music/play", [name]); });
        };

        var wonBattle = function() {
            return _(battleState.enemyPawns).all(function(pawn) { return !pawn.isAlive(); });
        };

        var lostBattle = function() {
            return _(battleState.playerPawns).all(function(pawn) { return !pawn.isAlive(); });
        };

        var winBattle = function() {
            var xp = xpPerPerson();

            playMusic("victory");

            battleState.enqueueState(new BattleMessageState([
                "All monsters perished!",
                "Got " + xp + "XP each!"
            ]));
            battleState.enqueueState(new BattleWonState(xp));
        };

        var loseBattle = function() {
            playMusic("defeat");

            battleState.enqueueState(new BattleMessageState([
                "It looks like you got your head handed to you.",
                "How regrettable."
            ]));

            battleState.enqueueFunc(function() {
                $.publish("/battle/end");
            });
        }

        this.start = function() {
            var xp;

            _(actions).each(function(action) {
                battleState.enqueueState(actionExecutor[action.type](action, battleState));
            });

            battleState.enqueueFunc(function refresh() {
                _(battleState.playerPawns).each(function(player) {
                    player.refresh();
                });
                _(battleState.enemyPawns).each(function(enemy) {
                    enemy.refresh();
                });
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
        };
        this.update = function() { return true; };
        this.draw = _.noop;
    };
});