define([
    "underscore",
    "battle/battle-message-state"
], function(_, BattleMessageState) {
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
            if (effect.missed) {
                msg("...missed " + effect.target.name + "!", "miss");
            } else {
                if (effect.critical) {
                    msg("A mighty blow!");
                }
                msg(effect.target.name + " took " + effect.amount + " damage!", effect.critical ? "critical" : "hit");
                effect.target.takeDamage(effect.amount);
            }

            if (!effect.target.isAlive()) {
                msg(effect.target.name + " falls!");
                battleState.enqueueState(new BuryTheDeadState(effect.target));
            }
        });
    };

    return function BattleExecuteState(battleState, actions, nextRound) {
        this.start = function() {
            console.log(actions);
            _(actions).each(function(action) {
                executeUseSkillAction(action, battleState);
            });

            // if not won..
            nextRound();
        };
        this.update = function() { return true; };
        this.draw = _.noop;
    };
});