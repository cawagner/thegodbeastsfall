define([
    "underscore", "game", "keyboard-input", "pawns/character-pawn", "gui", "constants", "states/noop-state"
], function (_, game, input, CharacterPawn, gui, constants, NoopState) {
    "use strict";

    function StatusState(character) {
        this.character = character;
        this.pawn = new CharacterPawn(this.character);

        this.previousState = new NoopState();
    }

    StatusState.prototype.start = function(previousState) {
        this.previousState = previousState;
    };

    StatusState.prototype.update = function() {
        if (input.wasCancelPressed()) {
            game.popState();
        }
    };

    StatusState.prototype.formatStat = function(fieldName, abbreviation) {
        return abbreviation + " " + this.character[fieldName];
    };

    StatusState.prototype.formatSkill = function(fieldName, abbreviation) {
        return abbreviation + " " + ("" + _(this.pawn).result(fieldName)).rset(3);
    };

    StatusState.prototype.draw = function(delta) {
        var empty = { name: "Nothing" };
        var top = 20,
            lines = 0,
            statTop, xpTop,
            self = this,
            statMapping = {
                "STR": "strength",
                "AGI": "agility",
                "INT": "intelligence",
                "LUK": "luck"
            },
            skillMapping = {
                "Attack ": "attack",
                "Force  ": "force",
                "Support": "support",
                "Resist ": "resist",
                "DmgAbsb": "damageAbsorption"
            },
            skillMapping2 = {
                "Hitting": "accuracy",
                "Evasion": "evade",
                "Init.  ": "priority",
                "Panache": "criticalChance",
                "DmgRedu": "damageReduction"
            };

        this.previousState.draw(delta);

        gui.drawWindowRect(20, top, constants.GAME_WIDTH - 40, 3 * gui.lineHeight);

        statTop = gui.drawTextLines(20, top, [
            this.character.name,
            "Level " + this.character.level,
            this.character.title
        ]) + gui.lineHeight;

        gui.drawTextLines(160, top + gui.lineHeight, [
            constants.chars.HEART + ("" + this.character.hp).rset(3) + "/" + ("" + this.character.maxHp).rset(3),
            constants.chars.STAR + ("" + this.character.mp).rset(3) + "/" + ("" + this.character.maxMp).rset(3),
        ]);
        gui.drawPortrait(250, top, this.character.face);

        gui.drawWindowRect(20, statTop, 60, 4*gui.lineHeight);
        gui.drawTextLines(20, statTop, _(statMapping).map(_.bind(this.formatStat, this)));

        gui.drawTextWindow(100, statTop, 200, 2*gui.lineHeight, [
            //"W: Nothing    H: Nothing",
            "W: " + (this.character.equipment.get("weapon") || empty).name.lset(10),
            "B: " + (this.character.equipment.get("body") || empty).name.lset(10),
        ]);

        statTop += 4 * gui.lineHeight;

        gui.drawWindowRect(150, statTop, 150, 5*gui.lineHeight);
        gui.drawTextLines(150, statTop, _(skillMapping).map(_.bind(this.formatSkill, this)));
        xpTop = gui.drawTextLines(230, statTop, _(skillMapping2).map(_.bind(this.formatSkill, this))) + gui.lineHeight;

        xpTop -= 4 * gui.lineHeight

        if (this.character.level < 100) {
            gui.drawWindowRect(20, xpTop, constants.GAME_WIDTH / 2 - 45, 2 * gui.lineHeight);
            gui.drawTextLines(20, xpTop, [
                "XP to advance:",
                ("" + (this.character.xp + "/" + this.character.xpNext)).rset(14)
            ]);
        }
    };

    return StatusState;
});