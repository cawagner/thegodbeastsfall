define([
    "underscore",
    "battle/battle-message-state",
    "battle/battle-menu-state",
    'battle/battle-execute-state',
    "json!skills.json",  // TODO: move handling the skill doing into another place...
    "skill-effects"
], function(
    _,
    BattleMessageState,
    BattleMenuState,
    BattleExecuteState,
    skills,
    skillEffects
) {
    "use strict";

    var createUseSkillAction = function(user, skill, targets) {
        var skillEffect = skillEffects[skill.effect];
        var result = skillEffect(skill, user, targets)
        result.type = "skill";
        return result;
    };

    return function BattleDecisionState(battleState) {
        this.start = function(commands) {
            var actions = [];
            _(commands).each(function(command) {
                var pawn = battleState.playerPawns[command.partyIndex];
                if (command.action === "skill") {
                    actions.push(createUseSkillAction(pawn, command.param.skill, command.param.targets));
                } else if (command.action === "item") {
                    /// guess I've got brain problems!
                } else {
                    actions.push({
                        type: command.action,
                        user: pawn,
                        priority: pawn.priority() + (command.param.priorityBoost||0)
                    });
                }
            });

            // Right now, all enemies will each just use their first attack on the player...
            _(battleState.enemyPawns).each(function(enemy) {
                var usableSkills = enemy.usableSkills();
                var skill = usableSkills[Math.floor(Math.random() * usableSkills.length)];
                actions.push(createUseSkillAction(enemy, skills[skill], [battleState.playerPawns[0]]));
            });

            actions.sort(function(a, b) {
                return b.priority - a.priority;
            });

            battleState.enqueueState(new BattleExecuteState(battleState, actions, function() {
                battleState.enqueueState(new BattleMenuState(battleState));
                battleState.enqueueState(new BattleDecisionState(battleState));
            }));
        }
        this.update = function() {
            return true;
        };
        this.draw = function() {

        };
    };
});