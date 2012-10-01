function StatusState(character) {
    this.character = character;
    this.pawn = new CharacterPawn(this.character);

    this.graphics = Game.instance.graphics;
    this.gui = new GuiRenderer(this.graphics);

    this.input = Game.instance.input;

    this.previousState = new NoopState();
}

StatusState.prototype.start = function(previousState) {
    this.previousState = previousState;
};

StatusState.prototype.update = function() {
    if (this.input.wasCancelPressed()) {
        Game.instance.popState();
    }
};

StatusState.prototype.formatStat = function(fieldName, abbreviation) {
    return abbreviation + " " + this.character[fieldName];
};

StatusState.prototype.formatSkill = function(fieldName, abbreviation) {
    return abbreviation + " " + ("" + _(this.pawn).result(fieldName)).rset(3);
};

StatusState.prototype.draw = function(delta) {
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
            "Defense": "defense",
            "Force  ": "force",
            "Support": "support",
            "Resist ": "resist"
        },
        skillMapping2 = {
            "Hitting": "accuracy",
            "Evasion": "evade",
            "Init.  ": "priority",
            "Panache": "criticalChance",
            "Crit. X": "criticalMultiplier"
        };

    this.previousState.draw(delta);

    this.gui.drawWindowRect(20, top, this.graphics.width() - 40, 3*this.gui.lineHeight);

    statTop = this.gui.drawTextLines(20, top, [
        this.character.name,
        "Level " + this.character.level,
        this.character.title
    ]) + this.gui.lineHeight;

    this.gui.drawTextLines(160, top + this.gui.lineHeight, [
        CHAR.heart + ("" + this.character.hp).rset(3) + "/" + ("" + this.character.maxHp).rset(3),
        CHAR.star + ("" + this.character.mp).rset(3) + "/" + ("" + this.character.maxMp).rset(3),
    ]);
    this.gui.drawPortrait(250, top, this.character.face);

    this.gui.drawWindowRect(20, statTop, 60, 4*this.gui.lineHeight);
    this.gui.drawTextLines(20, statTop, _(statMapping).map(_.bind(this.formatStat, this)));

    this.gui.drawTextWindow(100, statTop, 200, 2*this.gui.lineHeight, [
        "W: SBronze    H: Nothing",
        "B: Nothing    A: Nothing",
    ]);

    statTop += 4 * this.gui.lineHeight;

    this.gui.drawWindowRect(150, statTop, 150, 5*this.gui.lineHeight);
    this.gui.drawTextLines(150, statTop, _(skillMapping).map(_.bind(this.formatSkill, this)));
    xpTop = this.gui.drawTextLines(230, statTop, _(skillMapping2).map(_.bind(this.formatSkill, this))) + this.gui.lineHeight;

    xpTop -= 4 * this.gui.lineHeight

    if (this.character.level < 100) {
        this.gui.drawWindowRect(20, xpTop, this.graphics.width() / 2 - 45, 2 * this.gui.lineHeight);
        this.gui.drawTextLines(20, xpTop, [
            "XP to advance:",
            ("" + (this.character.xp + "/" + this.character.xpNext)).rset(14)
        ]);
    }
};
