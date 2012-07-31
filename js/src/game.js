function Hero() {

}

function Game(graphics) {
    var theHero = new Hero(),
        input = new KeyboardInput().setup(),
        tilemap = new Tilemap(20, 20),
        tilemapView = new TilemapView(tilemap, 32, graphics),
        scrollX = 0,
        scrollY = 0;

    tilemap.rect({ x: 2, y: 1, width: 1, height: 13, layer: 0, tile: 1});

    theHero.x = 320;
    theHero.y = 200;

    var speed = 6;

    this.update = function(timeScale) {
        theHero.x += speed * input.dirX() * timeScale;
        theHero.y += speed * input.dirY() * timeScale;
    };

    this.draw = function(timeScale) {
        graphics.cls();

        tilemapView.draw(scrollX, scrollY);

        scrollX += 0.25 * timeScale;
        //scrollY = theHero.y - 200;

        graphics.setFillColorRGB(255, 0, 0);
        graphics.drawFilledRect(theHero.x, theHero.y, 32, 32);
        graphics.swapBuffers();
    };
}