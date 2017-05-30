var stage, queue, player, grid = [], soldiers=[], discs=[], level;
var levels = [], currentLevel = 0, tileSize = 45, currentAnimation = "idle", followPlayer=false;
var keys = {
    left: false,
    right: false,
    up: false,
    down: false
};
var settings = {playerSpeed: 2, enemySpeed:.2, enemyCount: 20};
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
            {id: "guardSS", src:"assets/json/guard.json"},
            {id: "weaponSS", src: "assets/json/weapon.json"},
            {id: "touch", src:"assets/audio/touchEnemy.wav"},
            {id: "hit", src:"assets/audio/enemyHit.wav"}
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
    player.x = playerCol + 5 * tileSize;
    player.y = playerRow + 5* tileSize;
    player.width =  60;
    player.height = 90;
    player.isMoving = false;
    player.currentDirection = "down";
    player.regX = 0;
    player.regY = 90;
    player.row = playerRow;
    player.col = playerCol;
    stage.addChild(player);
    addEnemies();


}
function updateScene(e) {
    movePlayer();
    moveEnemies();
    hittingXena();
    weaponsMoving();
    stage.update(e)
}

function keyLifted(e) {
    player.gotoAndPlay('idle');
    player.isMoving = false;
    switch (e.keyCode) {
        case 32:
            defend();//when pressing space, xena will attack enemy and function defend will start
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
    player.isMoving = true;
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
            player.currentDirection = "left";
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
            player.currentDirection = "right";
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
            player.currentDirection = "up";
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
            player.currentDirection = "down";
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
    var enemySS = new createjs.SpriteSheet(queue.getResult("guardSS"));
    for(var i=0; i < settings.enemyCount; i++){
        var enemy = new createjs.Sprite(enemySS, "idle");
        enemy.x = 10 * tileSize * Math.random();
        enemy.y = 10* tileSize * Math.random();
        enemy.width = player.width;
        enemy.height = player.height;
        enemy.regY = 90;
        stage.addChild(enemy);
        soldiers.push(enemy);


    }
}
/*enemies move*/
function moveEnemies() {
    for (var i = soldiers.length - 1; i >= 0; i--) {
        var leftness = Math.floor(soldiers[i].x - player.x);
        var rightness = Math.floor(player.x - soldiers[i].x);
        var aboveness = Math.floor(soldiers[i].y - player.y);
        var belowness = Math.floor(player.y - soldiers[i].y);
        var biggest = Math.max(leftness, rightness, aboveness, belowness);

        if (leftness == biggest && currentAnimation != "left"){
            soldiers[i].x-=settings.enemySpeed;
            soldiers[i].currentAnimation = "left";
            soldiers[i].gotoAndPlay('left');
        }
        if (rightness == biggest && currentAnimation != "right"){
            soldiers[i].x+=settings.enemySpeed;
            soldiers[i].currentAnimation = "right";
            soldiers[i].gotoAndPlay('right');
        }
        if (aboveness == biggest && currentAnimation != "up"){
            soldiers[i].y-=settings.enemySpeed;
            soldiers[i].currentAnimation = "up";
            soldiers[i].gotoAndPlay('up');
        }
        if (belowness == biggest && currentAnimation != "down"){
            soldiers[i].y+=settings.enemySpeed;
            soldiers[i].currentAnimation = "down";
            soldiers[i].gotoAndPlay('down');
        }

    }
}
// HIT test
function hitTest(rect1,rect2){
    if( rect1.x >= rect2.x + rect2.width
        || rect1.x + rect1.width <= rect2.x
        || rect1.y >= rect2.y + rect2.height
        || rect1.y + rect1.height <= rect2.y ){
        return false;
    }
    else return true;

}

//hittest between xena and enemy
function hittingXena() {
    for (var i = soldiers.length - 1; i >= 0; i--) {
        if (hitTest(player, soldiers[i]) == true) {
            stage.removeChild(soldiers[i]);
            soldiers.splice(i, 1);
            //TODO loose a life
            createjs.Sound.play("touch");
        }
    }
    //soldiers and weapons hitTest
    for (var s = soldiers.length - 1; s >= 0; s--) {
        for (var w = discs.length - 1; w >= 0; w--) {
            if (hitTest(soldiers[s], discs[w]) == true) {

                stage.removeChild(soldiers[s]);
                soldiers.splice(s, 1);
                stage.removeChild(discs[w]);
                discs.slice(w, 1);
                createjs.Sound.play("hit");
            }
        }
    }
}
//xena fights back
function defend() {
    var weaponSS = new createjs.SpriteSheet(queue.getResult("weaponSS"));
    var weapon = new createjs.Sprite(weaponSS, "weapon");
    weapon.x = player.x+tileSize/2;
    weapon.y = player.y;
    weapon.width = 45;
    weapon.height = 45;
    weapon.direction = player.currentDirection;
    stage.addChild(weapon);
    weapon.isMoving = false;
    discs.push(weapon);

}
function weaponsMoving(){
    for (var i = discs.length - 1; i  >= 0; i--){
        if (discs[i].direction == "up") {
            discs[i].y-=settings.playerSpeed;
        }
        if (discs[i].direction == "down") {
            discs[i].y+=settings.playerSpeed;
        }
        if (discs[i].direction == "left"){
            discs[i].x-=settings.playerSpeed;
        }
        if (discs[i].direction == "right") {
            discs[i].x+=settings.playerSpeed;
        }
    }
}
//TODO level change
//TODO better enemy sprite sheet



window.addEventListener('load', preload);
