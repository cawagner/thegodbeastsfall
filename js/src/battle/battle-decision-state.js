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

    var useSkill = function(user, skill, targets) {
        var skillEffect = skillEffects[skill.effect];
        return skillEffect(skill, user, targets)
    };

    return function BattleDecisionState(battleState) {
        this.start = function(commands) {
            var actions = [];

            _(commands).each(function(command) {
                if (command.action === "skill") {
                    actions.push(useSkill(battleState.playerPawns[command.partyIndex], command.param.skill, command.param.targets));
                }
            });

            // Right now, all enemies will each just use their first attack on the player...
            _(battleState.enemyPawns).each(function(enemy) {
                actions.push(useSkill(enemy, skills[enemy.usableSkills()[0]], [battleState.playerPawns[0]]));
            });

            actions.sort(function(a, b) {
                return b.priority - a.priority;
            });

            _(actions).each(function(action) {
                var messages = [ action.user.name + " used " + action.skill.name + "!" ];

                _(action.effects).each(function(effect) {
                    if (effect.missed) {
                        messages.push("...missed " + effect.target.name + "!");
                    } else {
                        if (effect.critical) {
                            messages.push("A mighty blow!");
                        }
                        messages.push(effect.target.name + " took " + effect.amount + " damage!");
                    }
                });

                battleState.enqueueState(new BattleMessageState(messages));
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