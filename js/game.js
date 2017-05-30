var stage, queue, player, grid = [], level, HUDContainer, guards=[];
var levels = [], currentLevel =-1, tileSize = 45, currentAnimation = "idle";
var keys = {
    left: false,
    right: false,
    up: false,
    down: false,
    enter: false
};
var settings = {
    playerSpeed: 2,
    lives: 3,
    lastInjured: new Date()
};
var game = {
    gamePaused: false
};
var HUD = {
    key: {},
    weapon: {},
    hearts: {}
};
var items = {
    key: {},
    npc: {},
    chest: {},
    weapon: {}
};
var dialogue = {
    speechStage: 0,
    textContainer: {},
    text: {},
    sb: {},
    image: {},
    speech: [
    "Hello, my child...",
    "You do not belong here.",
    "Take this key and escape!"],
    lastChanged: {},
    instructions: {}

};
var guardInit = [
    [6, 10, "right", 6, 14],
    [14, 13, "left", 6, 14]

];
function preload() {
    stage = new createjs.Stage("myCanvas");

    queue = new createjs.LoadQueue(true);
    queue.installPlugin(createjs.Sound);
    queue.on('complete', queueComplete);

    queue.loadManifest(
        [
            "assets/img/geometry.png",
            "assets/img/npc.png",
            {id: "levelJson", src: "assets/json/levels.json"},
            {id: "geometrySprites", src: "assets/json/tiles.json"},
            {id: "playerRagsSS", src: "assets/json/herotatters.json"},
            {id: "guardSS", src: "assets/json/guard.json"},
            {id: "keySS", src: "assets/json/key.json"},
            {id: "weaponSS", src: "assets/json/weapon.json"},
            {id: "chestSS", src: "assets/json/chest.json"},
            {id: "keyPickup", src: "assets/audio/wildweasel_keypickup.wav"} //Freesound.org
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
                case 14:
                    img = 'celldoorNW';
                    break;
                case 15:
                    img = 'celldoorNE';
                    break;
                case 16:
                    img = 'celldoorSW';
                    break;
                case 17:
                    img = 'celldoorSE';
                    break;
                case 18:
                    img = 'doorNW';
                    break;
                case 19:
                    img = 'doorNE';
                    break;
                case 20:
                    img = 'doorSW';
                    break;
                case 21:
                    img = 'doorSE';
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

    // LEVEL 1
    if (currentLevel == 0){
        var chestSS = new createjs.SpriteSheet(queue.getResult("chestSS"));
        items.chest = new createjs.Sprite(chestSS, "chestClosed");
        items.chest.x = 10 * tileSize;
        items.chest.y = 10 * tileSize;
        stage.addChild(items.chest);

        settings.itemsSpawned = false;
        spawnNPC();
    }


    var playerSS = new createjs.SpriteSheet(queue.getResult("playerRagsSS"));
    player = new createjs.Sprite(playerSS, "idle");
    player.x = 13 * tileSize;
    player.y = 4 * tileSize;
    player.width =  60;
    player.height = 90;
    player.regX = 0;
    player.regY = 90;
    player.row = playerRow;
    player.col = playerCol;
    player.hasKey = false;
    player.isMoving = false;
    player.isAlive = true;
    player.dialogueStarted = false;
    player.hasWeapon = false;
    stage.addChild(player);


    // LEVEL 1
    if (currentLevel == 0)
    {
        spawnGuards();
    }


    HUDContainer = new createjs.Container();
    HUDContainer.x = 25;
    HUDContainer.y = 25;
    stage.addChild(HUDContainer);
    createHUD();

}
function updateScene(e) {
    movePlayer();

    // LEVEL 1
    if (currentLevel == 0)
    {
        moveGuards();
    }

    stage.update(e)
}

function keyLifted(e) {
    player.isMoving = false;
    player.gotoAndStop('idle');
    switch (e.keyCode) {
        case 13:
            keys.enter = false;
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
        case 13:
            keys.enter = true;
            break;
        case 37:
            if (!game.gamePaused)
            {
                keys.left = true;
            }
            break;
        case 38:
            if (!game.gamePaused)
            {
                keys.up = true;
            }
            break;
        case 39:
            if (!game.gamePaused)
            {
                keys.right = true;
            }
            break;
        case 40:
            if (!game.gamePaused)
            {
                keys.down = true;
            }
            break;
    }
}
function movePlayer() {
    if (player.isMoving) {
        handleCollisions();
    }
    if (player.y < player.height / 2) {
        setupLevel();
    }
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
function playerHitTest(object) {
    var playerTileXRight = Math.floor((player.x  + 45)  / tileSize),//TODO Fix this. Should be + player.width but player is wider than one tile
        playerTileXLeft = Math.floor(player.x / tileSize),
        playerTileY = Math.floor(player.y / tileSize);
    var objectTileX = Math.floor(object.x / tileSize),
        objectTileY = Math.floor(object.y / tileSize);

    //console.log("PlayerTileXRight: " + playerTileXRight + ", " + "PlayerTileXLeft: " + playerTileXLeft + ", " + "Player tileY: " + playerTileY + " / " + "Object tileX: " + objectTileX + ", " + "Object tileY: " + objectTileY);

    if (playerTileY == objectTileY && (playerTileXLeft == objectTileX || playerTileXRight == objectTileX)) {
        return true;
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

        HUD.hearts[i] = HUDContainer.addChild(heart);
    }

    var keySS = new createjs.SpriteSheet(queue.getResult("keySS"));
    HUD.key = new createjs.Sprite(keySS, "emptyKey");
    HUD.key.x = 10;
    HUD.key.y = 50;
    HUDContainer.addChild(HUD.key);
    stage.addChild(HUD.key);

    var weaponSS = new createjs.SpriteSheet(queue.getResult("weaponSS"));
    HUD.weapon = new createjs.Sprite(weaponSS, "emptyWeapon");
    HUD.weapon.x = 60;
    HUD.weapon.y = 50;
    HUDContainer.addChild(HUD.weapon);
    stage.addChild(HUD.weapon);
}

function spawnNPC() {
    items.npc = new createjs.Bitmap("assets/img/npc.png");
    items.npc.x = 17 * tileSize;
    items.npc.y = 3 * tileSize;
    items.npc.width = 90;
    items.npc.height = 90;
    items.npc.regY = 90;
    stage.addChild(items.npc);
}
function startDialogue(){
    dialogue.speechStage = 0;
    dialogue.textContainer = new createjs.Container();
    dialogue.text = new createjs.Text(dialogue.speech[0], "15px Arial", "#000000");
    dialogue.image = new Image();
    dialogue.image.onload = function() { stage.update(); };
    dialogue.image.src = "assets/img/bubble.png";
    dialogue.sb = new createjs.ScaleBitmap(dialogue.image, new createjs.Rectangle(8, 12, 10, 5));
    dialogue.sb.width = 200;
    dialogue.sb.height = 50;
    dialogue.sb.setDrawSize(dialogue.sb.width, dialogue.sb.height);
    dialogue.sb.x = 13 * tileSize;
    dialogue.sb.y = tileSize;
    dialogue.text.textAlign = "start";
    dialogue.text.x = dialogue.sb.x + 8;
    dialogue.text.y = dialogue.sb.y + 8;
    dialogue.textContainer.addChild(dialogue.sb, dialogue.text);
    stage.addChild(dialogue.textContainer);

    dialogue.instructions = new createjs.Text("Press [enter] to continue.", "20px Arial Black", "#ffffff");
    dialogue.instructions.textAlign = "center";
    dialogue.instructions.x = stage.canvas.width / 2;
    dialogue.instructions.y = stage.canvas.height - 100;
    stage.addChild(dialogue.instructions);
}
function updateDialogue(){
    if (keys.enter){
        stage.removeChild(dialogue.instructions);
        dialogue.textContainer.removeChild(dialogue.text);

        switch (dialogue.speechStage) {
            case 0:
                dialogue.text = new createjs.Text(dialogue.speech[1], "15px Arial", "#000000");
                dialogue.lastChanged = new Date();
                dialogue.speechStage++;
                break;
            case 1:
                var elapsed = new Date() - dialogue.lastChanged;
                if (elapsed > 500){
                    dialogue.text = new createjs.Text(dialogue.speech[2], "15px Arial", "#000000");
                    dialogue.speechStage++;
                    dialogue.lastChanged = new Date();
                }
                break;
            case 2:
                elapsed = new Date() - dialogue.lastChanged;
                if (elapsed > 500 && !player.hasKey){
                    stage.removeChild(dialogue.textContainer);
                    createjs.Sound.play("keyPickup");
                    HUD.key.gotoAndPlay('key');
                    game.gamePaused = false;
                    player.hasKey = true;
                }
                break;
        }
        dialogue.text.textAlign = "start";
        dialogue.text.x = dialogue.sb.x + 8;
        dialogue.text.y = dialogue.sb.y + 8;
        dialogue.textContainer.addChild(dialogue.text);

    }
}
function spawnItems() {
    settings.itemsSpawned = true;
    var keySS = new createjs.SpriteSheet(queue.getResult("keySS"));
    items.key = new createjs.Sprite(keySS, "key");
    items.key.x = 10 * tileSize;
    items.key.y = 10 * tileSize;
    items.key.width = tileSize;
    items.key.height = tileSize;
    stage.addChild(items.key);

    createjs.Tween.get(items.key, {loop: false})
        .to({x: 6 * tileSize, rotation: 360}, 1000);

    var weaponSS = new createjs.SpriteSheet(queue.getResult("weaponSS"));
    items.weapon = new createjs.Sprite(weaponSS, "weapon");
    items.weapon.x = 10 * tileSize;
    items.weapon.y = 10 * tileSize;
    items.weapon.width = tileSize;
    items.weapon.height = tileSize;
    stage.addChild(items.weapon);
    createjs.Tween.get(items.weapon, {loop: false})
        .to({x: 14 * tileSize, rotation: 360}, 1000)
        .call(function () {
            settings.tweenComplete = true;
        });
}
function spawnGuards() {
    var guardSS = new createjs.SpriteSheet(queue.getResult("guardSS"));

    for (var i = 0; i < guardInit.length; i++)
    {
        var guard = new createjs.Sprite(guardSS, "idle");
        guard.regY = 90;
        guard.x = guardInit[i][0] * tileSize;
        guard.y = guardInit[i][1] * tileSize;
        guard.direction = guardInit[i][2];
        guard.minX = guardInit[i][3];
        guard.maxX = guardInit[i][4];
        guard.gotoAndPlay(guardInit[i][2]);
        stage.addChild(guard);
        guards.push(guard);
    }
}
function moveGuards(){
    for (var i = guards.length - 1; i >= 0; i--){
        if ((guards[i].x < guards[i].minX * tileSize && guards[i].direction == "left")
            || (guards[i].x > guards[i].maxX * tileSize && guards[i].direction == "right")) {
            if (guards[i].x < guards[i].minX * tileSize) {
                guards[i].direction = "right";
                guards[i].gotoAndPlay("right");
            } else {
                guards[i].direction = "left";
                guards[i].gotoAndPlay("left");
            }
        } else {
            if (guards[i].direction == "left") {
                guards[i].x--;
            } else {
                guards[i].x++;
            }
        }
    }
}
function handleCollisions(){
    // LEVEL 1
    if (currentLevel == 0) {
        if (playerHitTest((grid[4][16] || grid[5][16] || grid[5][17]) || grid[5][18]) && !player.hasKey) { // Prisoner collision
            if (!player.dialogueStarted)
            {
                player.dialogueStarted = true;
                game.gamePaused = true;
                player.gotoAndStop("idle");
                startDialogue();
            } else {
                updateDialogue();
            }
        }
        if (playerHitTest((grid[5][15]) || grid[5][16])  && player.hasKey){ // First door collision
            grid[7][15].gotoAndPlay('wholeFloor');
            grid[7][15].tileNumber = 5;
            grid[6][15].gotoAndPlay('wholeFloor');
            grid[6][15].tileNumber = 5;
            grid[6][16].gotoAndPlay('brokenFloor');
            grid[6][16].tileNumber = 7;
            grid[7][16].gotoAndPlay('wholeFloor');
            grid[7][16].tileNumber = 5;

            HUD.key.gotoAndPlay('emptyKey');
            player.hasKey = false;
        }
        if (playerHitTest((grid[2][5]) || grid[2][6])  && player.hasKey){ // Second door collision
            grid[1][5].gotoAndPlay('wholeFloor');
            grid[1][5].tileNumber = 5;
            grid[0][5].gotoAndPlay('wholeFloor');
            grid[0][5].tileNumber = 5;
            grid[0][6].gotoAndPlay('brokenFloor');
            grid[0][6].tileNumber = 7;
            grid[1][6].gotoAndPlay('wholeFloor');
            grid[1][6].tileNumber = 5;

            HUD.key.gotoAndPlay('emptyKey');
            player.hasKey = false;
        }
        for (var i = 0; i < guards.length; i++)     // Guards collision
        {
            var guardPosX = Math.floor(guards[i].x / tileSize);

            if(playerHitTest(grid[guardInit[i][1]][guardPosX])){
                var elapsed = new Date() - settings.lastInjured;

                if (elapsed > 1000){
                    console.log(settings.lives);
                    settings.lives--;
                    settings.lastInjured = new Date();
                    HUDContainer.removeChild(HUD.hearts[settings.lives]);

                    if (settings.lives <= 0 && player.isAlive) {
                        player.isAlive = false;
                        console.log("Dead")
                    } else {
                        switch (player.currentAnimation) {
                            case "right":
                                player.gotoAndPlay('rightHit');
                                break;
                            case "left":
                                player.gotoAndPlay('leftHit');
                                break;
                            case "up":
                                player.gotoAndPlay('upHit');
                                break;
                            case "down":
                                player.gotoAndPlay('downHit');
                                break;
                        }
                    }
                }
            }
        }
        if(playerHitTest(grid[10][10]) && player.isAlive) {     // Chest collision
            if (!settings.itemsSpawned)
            {
                items.chest.gotoAndStop('chestOpen');
                spawnItems();
            }
        }
        if (settings.tweenComplete) {
            if (typeof items.key != "undefined") {
                if (playerHitTest(items.key) && !player.hasKey) {
                    createjs.Sound.play("keyPickup");
                    stage.removeChild(items.key);
                    player.hasKey = true;
                    HUD.key.gotoAndStop('key');
                }
            }
            if (typeof  items.weapon != "undefined") {
                if (playerHitTest(items.weapon) && !player.hasWeapon) {
                    stage.removeChild(items.weapon);
                    createjs.Sound.play("keyPickup");
                    player.hasWeapon = true;
                    HUD.weapon.gotoAndStop('weapon');
                }
            }
        }
    }
}

window.addEventListener('load', preload);