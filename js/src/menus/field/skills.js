define([
    "underscore",
    "game-state",
    "pubsub",
    "data/skills",
    "menu",
    "pawns/character-pawn"
], function(
    _,
    gameState,
    pubsub,
    skills,
    Menu,
    CharacterPawn
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
                                    pubsub.publish("/npc/talk", [{
                                        text: ["Du hast " + gameState.party[index].name + " gewaehlt!"]
                                    }]);
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