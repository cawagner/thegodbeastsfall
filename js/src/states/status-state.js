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
    return abbreviation + " " + _(this.pawn).result(fieldName);
};

StatusState.prototype.draw = function(delta) {
    var top = 20,
        lines = 0,
        statTop,
        self = this,
        statMapping = {
            STR: "strength",
            AGI: "agility",
            INT: "intelligence",
            LUK: "luck"
        },
        skillMapping = {
            "Atk. ": "attack",
            "Def. ": "defense",
            "Force": "force",
            "Helps": "support",
            "M.Def": "resist"
        },
        skillMapping2 = {
            "Acc. ": "accuracy",
            "Evade": "evade",
            "Init.": "priority",
            "Crit%": "criticalChance",
            "CritX": "criticalMultiplier"
        };

    this.previousState.draw(delta);

    this.gui.drawWindowRect(20, top, this.graphics.width() - 40, this.graphics.height() - 80);

    statTop = this.gui.drawTextLines(20, top, [
        this.character.name,
        "Level " + this.character.level,
        this.character.title
    ]) + this.gui.lineHeight;

    this.gui.drawTextLines(20, statTop, _(statMapping).map(_.bind(this.formatStat, this)));

    this.gui.drawTextLines(120, statTop, _(skillMapping).map(_.bind(this.formatSkill, this)));
    this.gui.drawTextLines(220, statTop, _(skillMapping2).map(_.bind(this.formatSkill, this)));
};
