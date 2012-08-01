function Hero() {

}

function Game(graphics) {
    var theHero = new Hero(),
        input = new KeyboardInput().setup(),
        tilemap = new Tilemap(20, 20),
        tilemapView = new TilemapView(tilemap, 32, graphics),
        scrollX = 0,
        scrollY = 0,
        speed = 6;

    tilemap.rect({ x: 2, y: 1, width: 1, height: 13, layer: 0, tile: 1});

    theHero.x = 320;
    theHero.y = 200;

    this.update = function(timeScale) {
        theHero.x += speed * input.dirX() * timeScale;
        theHero.y += speed * input.dirY() * timeScale;

        scrollX = Math.max(0, theHero.x - 320);
        scrollY = Math.max(0, theHero.y - 240);
    };

    this.draw = function(timeScale) {
        graphics.setOrigin(0, 0);
        graphics.cls();

        tilemapView.draw(scrollX, scrollY);

        graphics.setFillColorRGB(255, 0, 0);
        graphics.drawFilledRect(theHero.x, theHero.y, 32, 32);
        graphics.swapBuffers();
    };

    (function(){
        var mapLoader = new MapLoader();
        mapLoader.load('DesertPath').done(function(data){
            tilemapView = new TilemapView(data.tilemap, 32, graphics);
        });
    })();
}