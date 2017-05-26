var stage, queue, player, grid = [], soldiers=[] ;
var levels = [], currentLevel =0, tileSize = 45, currentAnimation = "idle", followXena=false;
var keys = {
    left: false,
    right: false,
    up: false,
    down: false
};
var settings = {playerSpeed: 2, enemySpeed:2};
function preload() {
    stage = new createjs.Stage("myCanvas");

    queue = new createjs.LoadQueue(true);
    queue.installPlugin(createjs.Sound);
    queue.on('complete', queueComplete);

    queue.loadManifest(
        [
            "assets/img/geometry.png",
            {id: "levelJson", src: "assets/json/levels.json"},
            {id: "geometrySprites", src: "assets/json/tiles.json"},
            {id: "playerRagsSS", src: "assets/json/herotatters.json"},
            {id: "enemySS", src:"assets/json/soldier.json"}
        ]
    );
}
function queueComplete() {
    var lvl = queue.getResult("levelJson");
    levels = lvl.levels;


    createjs.Ticker.setFPS(60);
    createjs.Ticker.on('tick', updateScene);

    setupLevel();
}
function setupLevel() {
    stage.removeAllChildren();
    currentLevel++;

    var spritesheet = new createjs.SpriteSheet(queue.getResult('geometrySprites'));

    level = levels[currentLevel].tiles;
    grid = [];

    window.addEventListener('keyup', keyLifted);
    window.addEventListener('keydown', keyPressed);

    for (var i = 0; i < level.length; i++) {
        grid.push([]);
        for(var z = 0; z < level[0].length; z++){
            grid[i].push(null);
        }
    }
    var playerCol, playerRow;
    for(var row = 0; row < level.length; row++){
        for(var col = 0; col < level[row].length; col++) {
            var img = '';
            switch (level[row][col]) {
                case 0:
                    img = 'north';
                    break;
                case 1:
                    img = 'southEast';
                    break;
                case 2:
                    img = 'south';
                    break;
                case 3:
                    img = 'west';
                    break;
                case 4:
                    img = 'northEast';
                    break;
                case 5:
                    img = 'wholeFloor';
                    playerRow = row;
                    playerCol = col;
                    break;
                case 6:
                    img = 'connectVertical';
                    break;
                case 7:
                    img = 'brokenFloor';
                    playerRow = row;
                    playerCol = col;
                    break;
                case 8:
                    img = 'northWest';
                    break;
                case 9:
                    img = 'connectHorizontal';
                    break;
                case 10:
                    img = 'middle';
                    break;
                case 11:
                    img = 'southWest';
                    break;
                case 12:
                    img = 'wall';
                    break;
                case 13:
                    img = 'east';
                    break;
            }

            var tile = new createjs.Sprite(spritesheet, img);

            tile.x = col * tileSize;
            tile.y = row * tileSize;
            tile.row = row;
            tile.col = col;
            tile.tileNumber = level[row][col];
            stage.addChild(tile);
            grid[row][col] = tile;
        }
    }
    var playerSS = new createjs.SpriteSheet(queue.getResult("playerRagsSS"));
    player = new createjs.Sprite(playerSS, "idle");
    player.x = playerCol + 2 * tileSize;
    player.y = playerRow + 4* tileSize;
    player.width =  60;
    player.height = 90;
    player.regX = 0;
    player.regY = 90;
    player.row = playerRow;
    player.col = playerCol;
    stage.addChild(player);
    addEnemies();

}
function updateScene(e) {
    movePlayer();
    //moveEnemies();
    stage.update(e)
}

function keyLifted(e) {
    player.gotoAndPlay('idle');
    switch (e.keyCode) {
        case 32:
            keys.space = false;
            break;
        case 37:
            keys.left = false;
            break;
        case 38:
            keys.up = false;
            break;
        case 39:
            keys.right = false;
            break;
        case 40:
            keys.down = false;
            break;
    }
}

function keyPressed(e) {
    switch (e.keyCode) {
        case 32:
            keys.space = true;
            break;
        case 37:
            keys.left = true;
            break;
        case 38:
            keys.up = true;
            break;
        case 39:
            keys.right = true;
            break;
        case 40:
            keys.down = true;
            break;
    }
}
function movePlayer() {

    if (keys.left) {
        let potentialPositionX = player.x - settings.playerSpeed;
        let tileX = Math.floor(potentialPositionX / tileSize);
        let potentialPositionY = player.y;
        let tileY = Math.floor(potentialPositionY / tileSize);

        if (walkable(tileY,tileX)) {
            player.x -= settings.playerSpeed;
        }

        if (player.currentAnimation != "left") {
            player.currentAnimation = "left";
            player.gotoAndPlay('left');
        }
    }
    else if (keys.right) {
        let potentialPositionX = player.x + settings.playerSpeed;
        let tileX = Math.floor((potentialPositionX + player.width) / tileSize);
        let potentialPositionY = player.y;
        let tileY = Math.floor(potentialPositionY / tileSize);

        if (walkable(tileY,tileX)) {
            player.x += settings.playerSpeed;
        }
        if (player.currentAnimation != "right") {
            player.currentAnimation = "right";
            player.gotoAndPlay('right');
        }
    }
    else if (keys.up) {
        let potentialPositionX = player.x;
        let tileXLeft = Math.floor((potentialPositionX) / tileSize);
        let tileXRight = Math.floor((potentialPositionX + player.width) / tileSize);
        let potentialPositionY = player.y - settings.playerSpeed;
        let tileY = Math.floor(potentialPositionY / tileSize);

        if (walkable(tileY,tileXLeft) && walkable(tileY,tileXRight)) {
            player.y -= settings.playerSpeed;
        }
        if (player.currentAnimation != "up") {
            player.currentAnimation = "up";
            player.gotoAndPlay('up');
        }

    }
    else if (keys.down) {
        let potentialPositionX = player.x;
        let tileXLeft = Math.floor((potentialPositionX) / tileSize);
        let tileXRight = Math.floor((potentialPositionX + player.width) / tileSize);
        let potentialPositionY = player.y + settings.playerSpeed;
        let tileY = Math.floor(potentialPositionY / tileSize);

        if (walkable(tileY,tileXLeft) && walkable(tileY,tileXRight)) {
            player.y += settings.playerSpeed;
        }
        if (player.currentAnimation != "down") {
            player.currentAnimation = "down";
            player.gotoAndPlay('down');
        }
    }
}

function walkable(y, x) {
    var walkableTileTypes = [5,7];
    var targetTileNumber = grid[y][x].tileNumber;

    //console.log('x:' + x + ' y:' + y + ' targettype:' + targetTileNumber);
    if (walkableTileTypes.indexOf(targetTileNumber) != -1) {
        return true;
    } else {
        return false;
    }

}
/*enemies appear*/
function addEnemies() {
    var enemySS = new createjs.SpriteSheet(queue.getResult("enemySS"));
    for(var i=0; i < 4; i++){
        var enemy = new createjs.Sprite(enemySS, "first");
        enemy.x= Math.floor(Math.random()*900);
        enemy.y=(Math.floor(Math.random()*900)+100)*-1;
        enemy.width = player.width;
        enemy.height = player.height;
        stage.addChild(enemy);
        soldiers.push(enemy);
        moveEnemies();
        followPlayer();

    }
}
/*enemies move*/
function moveEnemies() {
    for (var i = soldiers.length - 1; i >= 0; i--) {

        if (soldiers[i].y > stage.canvas.height) {
            soldiers[i].y = (Math.floor(Math.random() * 900) + 100) * -1;
            soldiers[i].x = Math.floor(Math.random() * 900);

        }
    }
}
/*enemies follow player*/
function followPlayer(){
    for (var j=soldiers.length-1; j>=0; j--){
        if (soldiers[j].y>stage.canvas.height)
        {
            soldiers[j].y=(Math.floor(Math.random()*900)+100)*-1;
            soldiers[j].x=Math.floor(Math.random()*900);

        }
        else if(soldiers[j].x<player.x && followXena===true)
        {
            soldiers[j].x+=settings.enemySpeed;
        }
        else if (soldiers[j].x>player.x && followXena===true){
            soldiers[j].x-=settings.enemySpeed;
        }
        else if (soldiers[j].y>player.y && followXena===true){
            soldiers[j].y-=settings.enemySpeed;}

        else if (soldiers[j].y<player.y && followXena===true){
            soldiers[j].y+=settings.enemySpeed;
        }
    }
}
/*level change*/
/*collision check*/
/*sword moving*/


window.addEventListener('load', preload);
