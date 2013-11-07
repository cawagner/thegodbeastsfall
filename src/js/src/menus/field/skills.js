define([
    "underscore",
    "game-state",
    "radio",
    "data/skills",
    "menu",
    "pawns/character-pawn",
    "states/composite-state",
    "battle/effect-executor",
    "battle/skill-user"
], function(
    _,
    gameState,
    radio,
    skills,
    Menu,
    CharacterPawn,
    CompositeState,
    EffectExecutor,
    skillUser
) {
    "use strict";

    return {
        text: "Magic",
        childMenu: function() {
            var partyMembers = _(gameState.party).map(function(member) {
                var pawn = new CharacterPawn(member);
                var fieldSkills = _(member.skills["Magic"]).chain().filter(function(skill) {
                    return skills[skill].isFieldUsable;
                }).map(function(skill) {
                    return { text: skills[skill].name, skill: skills[skill], disabled: !pawn.canUseSkill(skills[skill]) };
                }).value();

                return {
                    text: member.name,
                    childMenu: new Menu({
                        items: fieldSkills,
                        hierarchical: true,
                        select: function(index) {
                            var skillMenu = this;
                            var fieldSkill = fieldSkills[index];
                            var targetMenu = new Menu({
                                items: _(gameState.party).pluck("name"),
                                select: function(index) {
                                    var targetPawn = gameState.party[index] === member ? pawn : new CharacterPawn(gameState.party[index]);
                                    var messages = [];
                                    var executor = new EffectExecutor({
                                        state: new CompositeState(),
                                        action: {
                                            user: pawn,
                                            skill: fieldSkill.skill,
                                            targets: [targetPawn]
                                        },
                                        displayMessage: function(msg) {
                                            messages.push(msg);
                                        },
                                        displayDamage: function() {
                                            // TODO: implement
                                        }
                                    });
                                    skillUser.useSkill(executor);
                                    debugger
                                    executor.state.runAll();
                                    radio("/npc/talk").broadcast({
                                        text: messages
                                    });
                                }
                            }).open();
                        }
                    }),
                    disabled: !fieldSkills.length,
                    hierarchical: true
                };
            });
            return new Menu({
                items: partyMembers,
                hierarchical: true
            });
        }
    };
});