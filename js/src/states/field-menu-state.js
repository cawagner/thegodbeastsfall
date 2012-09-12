function FieldMenuState(menu) {
    var self = this;

    var getPartyMenu = function() {
         var options = _(GameState.instance.party).map(function(member){
            return { text: member.name, member: member };
        });
        return new Menu(options);
    };

    this.menu = new Menu([
        {
            text: "Status",
            childMenu: function() {
                return getPartyMenu().select(function(menuItem) {
                    Game.instance.pushState(new StatusState(menuItem.member));
                });
            }
        },
        "Zauber",
        "Items",
        {
            text: "System",
            childMenu: new Menu([
                "Save",
                "Load",
                "Options"
            ])
        }
    ]).select(function(index, item) {
        if (item.childMenu) {
            _(item).result("childMenu").open();
        } else {
            this.close();
        }
    }).size(2, 2);

    this.menuState = new MenuState(this.menu);
    this.gui = this.menuState.gui;
    this.previousState = new NoopState();
}

FieldMenuState.prototype.start = function(previousState) {
    this.previousState = previousState;
};

FieldMenuState.prototype.update = function(delta) {
    this.previousState.update(delta);
    this.menuState.update(delta);
};

FieldMenuState.prototype.draw = function(delta) {
    var party = GameState.instance.party;

    this.previousState.draw(delta);
    this.menuState.draw(delta);

    this.gui.drawTextWindow(260, 180, 36, 44, ["HELD", "\u2665" + (""+party[0].hp).rset(3), "\u2605" + (""+party[0].mp).rset(3)]);
};

FieldMenuState.prototype.suspend = function() {

};

FieldMenuState.prototype.reactivate = function() {

};


