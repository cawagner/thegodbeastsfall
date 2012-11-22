define([
    "underscore",
    "battle/battle-message-state",
    "battle/battle-won-state"
], function(_, BattleMessageState, BattleWonState) {
    "use strict";

    // TODO: move
    function BuryTheDeadState(pawn) {
        this.start = function() {
            pawn.isHidden = !pawn.isAlive();
        };
        this.update = function() {
            return true;
        };
        this.draw = function() {
        };
    };

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
                battleState.enqueueState(new BuryTheDeadState(effect.target));
            }
        });

        action.user.useSkill(action.skill);
    };

    return function BattleExecuteState(battleState, actions, nextRound) {
        this.start = function() {
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

            if (_(battleState.enemyPawns).all(function(pawn) { return !pawn.isAlive(); })) {
                var totalXp = 0;
                _(battleState.enemyPawns).each(function(pawn) {
                    totalXp += pawn.xp();
                });
                var xpPerPerson = Math.ceil(totalXp / battleState.playerPawns.length);

                battleState.enqueueState(new BattleMessageState([
                    "All monsters perished!",
                    "Got " + xpPerPerson + "XP each!"
                ]));
                battleState.enqueueState(new BattleWonState(xpPerPerson));
            } else {
                nextRound();
            }
        };
        this.update = function() { return true; };
        this.draw = _.noop;
    };
});