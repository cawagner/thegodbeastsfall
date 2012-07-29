function Hero() {

}

function Game(graphics) {
    var theHero = new Hero();
    var input = new KeyboardInput().setup();

    var tilemap = new Tilemap(20, 20);
    var tilemapView = new TilemapView(tilemap, 32, graphics);

    tilemap.rect(2, 1, 1, 13, 1);

    theHero.x = 0;
    theHero.y = 200;

    this.update = function(timeScale) {
        theHero.x += 4 * input.dirX() * timeScale;
        theHero.y += 4 * input.dirY() * timeScale;
    };

    this.draw = function(timeScale) {
        graphics.cls();

        tilemapView.draw(0, 0);

        graphics.setFillColorRGB(255, 0, 0);
        graphics.drawFilledRect(theHero.x, theHero.y, 32, 32);
        graphics.swapBuffers();
    };
}