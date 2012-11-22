define([
    "underscore",
    "battle/battle-message-state",
    "battle/battle-menu-state",
    "json!skills.json",  // TODO: move handling the skill doing into another place...
    "skill-effects"
], function(
    _,
    BattleMessageState,
    BattleMenuState,
    skills,
    skillEffects
) {
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

    var createUseSkillAction = function(user, skill, targets) {
        var skillEffect = skillEffects[skill.effect];
        return skillEffect(skill, user, targets)
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

    return function BattleDecisionState(battleState) {
        this.start = function(commands) {
            var actions = [];

            _(commands).each(function(command) {
                if (command.action === "skill") {
                    actions.push(createUseSkillAction(battleState.playerPawns[command.partyIndex], command.param.skill, command.param.targets));
                }
                if (command.action === "inspect") {

                }
            });

            // Right now, all enemies will each just use their first attack on the player...
            _(battleState.enemyPawns).each(function(enemy) {
                var skill = skills[enemy.usableSkills()[0]];
                actions.push(createUseSkillAction(enemy, skills[enemy.usableSkills()[0]], [battleState.playerPawns[0]]));
            });

            actions.sort(function(a, b) {
                return b.priority - a.priority;
            });

            _(actions).each(function(action) {
                executeUseSkillAction(action, battleState);
            });

            console.log(actions);

            battleState.enqueueState(new BattleMenuState(battleState));
            battleState.enqueueState(new BattleDecisionState(battleState));
        }
        this.update = function() {
            return true;
        };
        this.draw = function() {

        };
    };
});