var stage, queue, player, grid = [], level, HUDContainer, energy = [], enemies =[];
var levels = [], currentLevel =0, tileSize = 45, currentAnimation = "idle";
var armor;
//var bullets = [];
var enemiesSecond;
var keys = {
    left: false,
    right: false,
    up: false,
    down: false
};
var settings = {
    playerSpeed: 2,
    bulletSpeed: 2,
    enemySpeed:2,
    energySpeed: 2,
    lives: 3
};
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
            {id: "enemiesSecond", src: "assets/json/enemiesSecondLevel.json"}
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
    player.x = playerCol * tileSize;
    player.y = playerRow * tileSize;
    player.width =  60;
    player.height = 90;
    player.regX = 0;
    player.regY = 90;
    player.row = playerRow;
    player.col = playerCol;
    stage.addChild(player);
    addEnemiesSecond();
    addEnergy();

    HUDContainer = new createjs.Container();
    HUDContainer.x = 25;
    HUDContainer.y = 25;
    stage.addChild(HUDContainer);
    createHUD();

}

function keyLifted(e) {
    "use strict";
    console.log("You pressed" + e.keyCode);
    player.gotoAndPlay('idle');
    switch (e.keyCode) {
        case 32:
            shoot();
            keys.space = false;
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

function createHUD() {
    for (var i = 0; i < settings.lives; i++)
    {
        var heart = new createjs.Shape();
        heart.graphics.beginFill("red");
        heart.graphics.moveTo(0, -12).curveTo(1, -20, 8, -20).curveTo(16, -20, 16, -10).curveTo(16, 0, 0, 12);
        heart.graphics.curveTo(-16, 0, -16, -10).curveTo(-16, -20, -8, -20).curveTo(-1, -20, 0, -12);
        heart.x += i * 50 + 10;

        HUDContainer.addChild(heart)
    }

}
//create enemy specificly level 0?
function addEnemiesSecond(){ //change name function
    var enemiesSecond = new createjs.SpriteSheet(queue.getResult("enemiesSecond"));
    for(var i= 0; i < 1; i++){
        var enemyOne = new createjs.Sprite(enemiesSecond, "rockSM");
        var enemySecond = new createjs.Sprite(enemiesSecond, "fireSM");
        var enemyThird = new createjs.Sprite(enemiesSecond, "ghostSM");
        enemyOne.width = 45;
        enemyOne.height = 45;
        enemySecond.width = 45;
        enemySecond.height = 45;
        enemyThird.width = 45;
        enemyThird.height = 45;
        enemyOne.x = Math.floor(Math.random() * 900);
        enemySecond.x = Math.floor(Math.random() * 900);
        enemyThird.x = Math.floor(Math.random() * 900);
        stage.addChild(enemyOne);
        enemies.push(enemyOne);
        stage.addChild(enemySecond);
        enemies.push(enemySecond);
        stage.addChild(enemyThird);
        enemies.push(enemyThird);
    }

}

function moveEnemiesSecond() { //change name function
    //console.log("moveEnemies called");

    for (var i = enemies.length - 1; i >= 0; i--) {
        enemies[i].y += settings.enemySpeed;
        if (enemies[i].y > stage.canvas.height) {
            enemies[i].y = Math.floor(Math.random() * 900);
            enemies[i].x = Math.floor(Math.random() * 900);
        }

    }
}

function armorAppear() {
    var enemiesSecond = new createjs.SpriteSheet(queue.getResult("enemiesSecond"));
    var armorAppear = new createjs.Sprite(enemiesSecond, "armor");
    armorAppear.x = 420;
    armorAppear.y = 20;
    stage.addChild(armorAppear);
}

function addEnergy() {
    var enemiesSecond = new createjs.SpriteSheet(queue.getResult("enemiesSecond"));
    var addEnergy = new createjs.Sprite(enemiesSecond, "energySM");
    addEnergy.x = Math.floor(Math.random()*900);
    addEnergy.y = Math.floor(Math.random()*675);
    stage.addChild(addEnergy);
    energy.push(addEnergy);
}

function moveEnergy() {

    for (var i = energy.length - 1; i >= 0; i--) {
        energy[i].y += settings.energySpeed;
        if (energy[i].y > stage.canvas.height) {
            energy[i].y = Math.floor(Math.random() * 900);
            energy[i].x = Math.floor(Math.random() * 900);
        }

    }
}

//necessary?
/*
function shoot() {
    console.log("SHOOT!");

    var bullet = new createjs.Shape();
    bullet.graphics.beginFill('#FFF').drawCircle(0, 0, 2);
    bullet.x = player.x + player.width / 2;
    bullet.y = player.y;
    //bullets have to have width and height for hit detection
    bullet.width = 4;
    bullet.height = 4;
    stage.addChild(bullet);
    bullets.push(bullet);
}

//necessary?
function moveBullets() {
    for (var i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= settings.bulletSpeed;

        //REMOVING BULLETS
        if (bullets[i].y < -10) {
            stage.removeChild(bullets[i]);
            bullets.splice(i, 1);
        }
    }
}

*/

console.log("all good until here!")

//instead of hit detection


/////////////////////////////////////////////////// BLOCKED! /////////////////////////////////////////////////

/*

function hitTest(rect1, rect2) { //borrowed from jonas class
    if (rect1.x >= rect2.x + rect2.width || rect1.x + rect1.width <= rect2.x ||
        rect1.y >= rect2.y + rect2.height || rect1.y + rect1.height <= rect2.y) {
        return false;
    }
}

function checkCollisionSecond() {
    for (var i = 0; i < enemies.length; i++) {
        if (hitTest(player, enemies[i])) {
            settings.lives--;
            stage.removeChild(enemies[i]);
            enemies.splice(i, 1);
            if (settings.lives <= 0) {
                console.log("DEAD");
                //enemies vs hero
                // bullets vs enemies

            }
        }
    }
}
*/
function updateScene(e) {
    //moveBullets();
    movePlayer();
    moveEnemiesSecond();
    armorAppear();
    moveEnergy();
    handleHits();
    stage.update(e)
}

              /*
function playerHitTest(object) {
    var playerTileXRight = Math.floor((player.x  + 45)  / tileSize),//TODO Fix this. Should be + player.width but player is wider than one tile
        playerTileXLeft = Math.floor(player.x / tileSize),
        playerTileY = Math.floor(player.y / tileSize);
    var objectTileX = Math.floor(object.x / tileSize),
        objectTileY = Math.floor(object.y / tileSize);

    if (playerTileY == objectTileY && (playerTileXLeft == objectTileX || playerTileXRight == objectTileX)) {
        return true;
    }
}        */

function playerHitTest(object) {
    var playerTileXRight = Math.floor((player.x  + 45)  / tileSize),//TODO Fix this. Should be + player.width but player is wider than one tile
        playerTileXLeft = Math.floor(player.x / tileSize),
        playerTileY = Math.floor(player.y / tileSize);
    var objectTileX = Math.floor(object.x / tileSize),
        objectTileY = Math.floor(object.y / tileSize);

    if (playerTileY == objectTileY && (playerTileXLeft == objectTileX || playerTileXRight == objectTileX)) {
        return true;
    }
    return false;
}
function handleHits() {
    for (var i = enemies.length-1; i >= 0; i--) {
        var enemyPosX = Math.floor(enemies[i].x / tileSize);
        var enemyPosY = Math.floor(enemies[i].y / tileSize);

        if (playerHitTest(enemies[i])) {
            settings.lives--;
            console.log("hit")
            stage.removeChild(enemies[i]);
            enemies.splice(i,1);
        }

    }

    for (var i = enemies.length-1; i >= 0; i--) {
        var enemyPosX = Math.floor(enemies[i].x / tileSize);
        var enemyPosY = Math.floor(enemies[i].y / tileSize);

        if (playerHitTest(enemies[i])) {
            settings.lives--;
            console.log("hit")
            stage.removeChild(enemies[i]);
            enemies.splice(i,1);
        }

    }
}

window.addEventListener('load', preload);
