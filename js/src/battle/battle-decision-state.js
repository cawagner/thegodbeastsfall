define([
    "underscore",
    "battle/battle-message-state",
    "battle/battle-menu-state",
    "skill-effects"
], function(
    _,
    BattleMessageState,
    BattleMenuState,
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

            _(battleState.enemyPawns).each(function(enemy) {

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