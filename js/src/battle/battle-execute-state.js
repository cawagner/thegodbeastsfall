define([
    "underscore",
    "jquery",
    "battle/battle-message-state",
    "battle/battle-won-state"
], function(_, $, BattleMessageState, BattleWonState) {
    "use strict";

    // TODO: this whole file is a mess... lol 3:00AM

    var executeUseSkillAction = function(action, battleState) {
        var msg = function(m, s) {
            battleState.enqueueState(new BattleMessageState([m], s));
        };

        if (!action.user.isAlive()) {
            return;
        }

        msg(action.user.name + " used " + action.skill.name + "!");

        _(action.effects).each(function(effect) {
            var targetWasAlive = effect.target.isAlive();

            if (!targetWasAlive) {
                msg(effect.target.name + " was already gone!");
                return;
            }

            if (effect.missed) {
                msg("...missed " + effect.target.name + "!", "miss");
            } else {
                if (effect.critical) {
                    msg("A mighty blow!");
                }
                msg(effect.target.name + " took " + effect.amount + " damage!", effect.critical ? "critical" : "hit");
                effect.target.takeDamage(effect.amount);
            }

            if (targetWasAlive && !effect.target.isAlive()) {
                msg(effect.target.name + " falls!");
                battleState.enqueueFunc(function() {
                    effect.target.isHidden = true;
                });
            }
        });

        action.user.useSkill(action.skill);
    };

    return function BattleExecuteState(battleState, actions, nextRound) {

        var wonBattle = function() {
            return _(battleState.enemyPawns).all(function(pawn) { return !pawn.isAlive(); });
        };

        var lostBattle = function() {
            return _(battleState.playerPawns).all(function(pawn) { return !pawn.isAlive(); });
        };

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
                // TODO: do something besides just reviving players and ending the battle...
                _(battleState.playerPawns).each(function(player) {
                    player.restoreHp(1);
                });
                $.publish("/battle/end");
            });
        }

        this.start = function() {
            var xp;

            console.log(actions);
            _(actions).each(function(action) {
                executeUseSkillAction(action, battleState);
            });

            _(battleState.playerPawns).each(function(player) {
                player.refresh();
            });
            _(battleState.enemyPawns).each(function(enemy) {
                enemy.refresh();
            });

            if (wonBattle()) {
                winBattle();
            } else if (lostBattle()) {
                loseBattle();
            } else {
                nextRound();
            }
        };
        this.update = function() { return true; };
        this.draw = _.noop;
    };
});