function Hero() {

}

function Game(graphics) {
    var theHero = new Hero();
    var input = new KeyboardInput().setup();

    theHero.x = 0;
    theHero.y = 200;

    this.update = function(timeScale) {
        theHero.x += 4 * input.dirX() * timeScale;
        theHero.y += 4 * input.dirY() * timeScale;
    };

    this.draw = function(timeScale) {
        graphics.cls();
        graphics.setFillColorRGB(255, 0, 0);
        graphics.drawFilledRect(theHero.x, theHero.y, 32, 32);
        graphics.swapBuffers();
    };
}