var stage, queue, player, grid = [], level, HUDContainer;
var levels = [], currentLevel =-1, tileSize = 45;
var keys = {
    left: false,
    right: false,
    up: false,
    down: false,
    enter: false,
    space: false
};
var state = {
    gameRunning: false,
    levelComplete: false,
    lastInjured: new Date(),
    gamePaused: false,
    lastEnergy: Date.now(),
    gameOver: false,
    tweenComplete: false
};
var settings = {
    playerSpeed: 2,
    discSpeed: 3,
    lives: 3,
    enemySpeed: 0.2,
    enemyCount: 10,
    soldierLastMoved: [],
    energy: 0,
    energySpeed: 2,
    obstacleCount: 1
};
var HUD = {
    key: {},
    weapon: {},
    hearts: {},
    heartOutlines: {},
    energyOutlines: {}
};
var items = {
    key: {},
    npc: {},
    chest: {},
    weapon: {},
    armor: {},
    discs: []
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

//transition dialogue

var transitionDialogue = {
    wordsStage: 0,
    textContainer: {},
    text: {},
    sb: {},
    bg: {},
    image: {},
    speech: [
        "Hello, my child...",
        "Avoid the obstacles..",
        "Collect flames of blue energy!",
        "Kill the guards to get to freedom!"],
    lastChanged: {},
    helpWords:{}

};
var mobiles = {
    obstacles: [],
    guards: [],
    soldiers: [],
    energySprite: {}
};
var guardInit = [
    [6, 10, "right", 6, 14],
    [14, 13, "left", 6, 14]

];
function preload() {
    stage = new createjs.Stage("myCanvas");
    preloadText = new createjs.Text("", "50px Arial Black", "#000");
    stage.addChild(preloadText);
    queue = new createjs.LoadQueue(true);
    queue.installPlugin(createjs.Sound);
    queue.on('progress', queueProgress);
    queue.on('complete', queueComplete);

    queue.loadManifest(
        [
            "assets/img/npc.png",
            "assets/img/midscreen.png",
            "assets/img/bgsplash.png",
            {id: "levelJson", src: "assets/json/levels.json"},
            {id: "geometrySprites", src: "assets/json/tiles.json"},
            {id: "playerRagsSS", src: "assets/json/herotatters.json"},
            {id: "enemiesSecond", src: "assets/json/enemiesSecondLevel.json"},
            {id: "guardSS", src: "assets/json/guard.json"},
            {id: "keySS", src: "assets/json/key.json"},
            {id: "energySS", src: "assets/json/energy.json"},
            {id: "weaponSS", src: "assets/json/weapon.json"},
            {id: "chestSS", src: "assets/json/chest.json"},
            {id: "youWin", src: "assets/json/forest.json"},
            {id: "bgForest", src: "assets/json/forest.json"},
            {id: "keyPickup", src: "assets/audio/wildweasel_keypickup.wav"}, //Freesound.org
            {id: "bgMusic", src: "assets/audio/8bit_Dungeon_Level_Video_Classica.mp3"}, //Youtube audio library
            {id: "touch", src:"assets/audio/touchEnemy.wav"},
            {id: "hit", src:"assets/audio/enemyHit.wav"},
            {id: "playerHit", src:"assets/audio/foomph08.wav"}
        ]
    );
}
function queueProgress(e){
    preloadText.text= Math.round(e.progress*100)+"%";
    preloadText.textAlign = "center";
    preloadText.y = stage.canvas.height / 2;
    preloadText.x = stage.canvas.width / 2;
    stage.update();
}
function queueComplete() {
    var lvl = queue.getResult("levelJson");
    levels = lvl.levels;
    var bgMusic = createjs.Sound.play("bgMusic");
    bgMusic.volume = 0.2;

    createjs.Ticker.setFPS(60);
    createjs.Ticker.on('tick', updateScene);

    showSplash();
}
function showSplash() {
    stage.removeAllChildren();
    window.addEventListener('keyup', keyLifted);
    window.addEventListener('keydown', keyPressed);

    var splash = new createjs.Bitmap("assets/img/bgsplash.png");
    stage.addChild(splash);
}
function waitForState() {
    if (keys.enter && !state.gameRunning) {
        currentLevel = -1;
        setupLevel();
        state.gameRunning = true;
        state.gamePaused = false;

    }
}
function setupLevel() {
    stage.removeAllChildren();
    currentLevel++;

    var spritesheet = new createjs.SpriteSheet(queue.getResult('geometrySprites'));

    level = levels[currentLevel].tiles;
    grid = [];

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

        spawnNPC();
    }
    var playerSS = new createjs.SpriteSheet(queue.getResult("playerRagsSS"));
    player = new createjs.Sprite(playerSS, "idle");
    player.width =  60;
    player.height = 90;
    player.currentDirection = "down";
    player.regX = 0;
    player.regY = 90;
    player.row = playerRow;
    player.col = playerCol;
    player.hasKey = false;
    player.isMoving = false;
    player.isAlive = true;
    player.dialogueStarted = false;
    settings.lives = 3;
    stage.addChild(player);
    state.tweenComplete = false;
    state.itemsSpawned = false;

    // LEVEL 1
    if (currentLevel == 0)
    {
        player.hasWeapon = false;
        player.x = 13 * tileSize;
        player.y = 4 * tileSize;
        spawnGuards();
    }
    // LEVEL 2
    if (currentLevel == 1) {
        state.itemsSpawned = false;
        player.hasWeapon = true;
        items.armor.isSpawned = false;
        player.x = 10 * tileSize;
        player.y = 10 * tileSize;
        addEnemiesSecond();
        addEnergy();

        if (typeof items.chest != "undefined") {
            stage.removeChild(items.chest);
        }
    }
    // LEVEL 3
    if (currentLevel == 2) {
        addEnemies();
        state.itemsSpawned = false;
        state.rewardsHad = false;
        state.chestSpawned = false;
        player.hasWeapon = true;
        player.x = 10 * tileSize;
        player.y = 10 * tileSize;
    }
    HUDContainer = new createjs.Container();
    HUDContainer.x = 25;
    HUDContainer.y = 25;
    stage.addChild(HUDContainer);
    createHUD();

}
function updateScene(e) {
    if (state.gameRunning)
    {
        movePlayer();

        // LEVEL 1
        if (currentLevel == 0)
        {
            moveGuards();
        }
        // LEVEL 2
        if (currentLevel == 1)
        {
            player.hasWeapon = true;
            moveEnemiesSecond();
            moveEnergy();
            handleLevelTwoHits();
        }
        // LEVEL 3
        if (currentLevel == 2)
        {
            moveEnemies();
            levelThreeHitTest();
            weaponsMoving();
        }
    }
    waitForState();
    stage.update(e)
}

function keyLifted(e) {
    if (state.gameRunning) {
        player.isMoving = false;
        player.gotoAndStop('idle');
    }
    switch (e.keyCode) {
        case 13:
            keys.enter = false;
            break;
        case 32:
            if (currentLevel == 2)
            {
                defend(); //when pressing space, xena will attack enemy and function defend will start
            }
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
    if (state.gameRunning) {
        player.isMoving = true;
    }
    switch (e.keyCode) {
        case 13:
            keys.enter = true;
            break;
        case 32:
            keys.space = true;
            break;
        case 37:
            if (!state.gamePaused && state.gameRunning)
            {
                if (player.isAlive)
                {
                    keys.left = true;
                }
            }
            break;
        case 38:
            if (!state.gamePaused && state.gameRunning)
            {
                if (player.isAlive)
                {
                    keys.up = true;
                }
            }
            break;
        case 39:
            if (!state.gamePaused && state.gameRunning)
            {
                if (player.isAlive)
                {
                    keys.right = true;
                }
            }
            break;
        case 40:
            if (!state.gamePaused && state.gameRunning)
            {
                if (player.isAlive)
                {
                    keys.down = true;
                }
            }
            break;
    }
}
function movePlayer() {
    if (player.isMoving && state.gameRunning) {
        handleCollisions();
    }
    if (player.y < player.height + tileSize) {
        if (currentLevel == 2) {
            youWin();
        }
        if (!player.dialogueStarted && !state.gamePaused)
        {
            player.dialogueStarted = true;
            state.gamePaused = true;
            player.gotoAndStop("idle");
            if (currentLevel == 1) {
                transitionDialogue.wordsStage = 3;
            }
            startTransitionText();
        } else {
            if (currentLevel == 1) {
                transitionDialogue.wordsStage = 3;
            }
            updateTransitionText();
        }
    }
    if (keys.enter && state.gameOver) {
        currentLevel = -1;
        state.gameOver = false;
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
    for (var i = 0; i < settings.lives; i++)//hearts
    {
        var heart = new createjs.Shape();
        heart.graphics.beginFill("red");
        heart.graphics.moveTo(0, -12).curveTo(1, -20, 8, -20).curveTo(16, -20, 16, -10).curveTo(16, 0, 0, 12);
        heart.graphics.curveTo(-16, 0, -16, -10).curveTo(-16, -20, -8, -20).curveTo(-1, -20, 0, -12);
        heart.x += i * 50 + 10;

        HUD.hearts[i] = HUDContainer.addChild(heart);
    }
    for (var j = 0; j < settings.lives; j++)
    {
        var heartOutline = new createjs.Shape();
        heartOutline.graphics.beginStroke("red");
        heartOutline.graphics.moveTo(0, -12).curveTo(1, -20, 8, -20).curveTo(16, -20, 16, -10).curveTo(16, 0, 0, 12);
        heartOutline.graphics.curveTo(-16, 0, -16, -10).curveTo(-16, -20, -8, -20).curveTo(-1, -20, 0, -12);
        heartOutline.x += j * 50 + 10;

        HUD.heartOutlines[i] = HUDContainer.addChild(heartOutline);
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

    if (currentLevel == 1 || currentLevel == 2) {
        HUD.weapon.gotoAndStop("weapon");
    }

    for (var l = 0; l < 3; l++) {
        var energySS = new createjs.SpriteSheet(queue.getResult("energySS"));
        var energyOutlines = new createjs.Sprite(energySS, "emptyEnergy");
        energyOutlines.width = 45;
        energyOutlines.x = stage.canvas.width - energyOutlines.width * l - 80;
        energyOutlines.y = -20;
        HUD.energyOutlines[l] = HUDContainer.addChild(energyOutlines);
    }
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
                    state.gamePaused = false;
                    player.dialogueStarted = false;
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
    state.itemsSpawned = true;
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
            state.tweenComplete = true;
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
        mobiles.guards.push(guard);
    }
}
function moveGuards(){
    for (var i = mobiles.guards.length - 1; i >= 0; i--){
        if ((mobiles.guards[i].x < mobiles.guards[i].minX * tileSize && mobiles.guards[i].direction == "left")
            || (mobiles.guards[i].x > mobiles.guards[i].maxX * tileSize && mobiles.guards[i].direction == "right")) {
            if (mobiles.guards[i].x < mobiles.guards[i].minX * tileSize) {
                mobiles.guards[i].direction = "right";
                mobiles.guards[i].gotoAndPlay("right");
            } else {
                mobiles.guards[i].direction = "left";
                mobiles.guards[i].gotoAndPlay("left");
            }
        } else {
            if (mobiles.guards[i].direction == "left") {
                mobiles.guards[i].x--;
            } else {
                mobiles.guards[i].x++;
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
                state.gamePaused = true;
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
        for (var i = 0; i < mobiles.guards.length; i++)     // Guards collision
        {
            var guardPosX = Math.floor(mobiles.guards[i].x / tileSize);

            if(playerHitTest(grid[guardInit[i][1]][guardPosX])){
                var elapsed = new Date() - state.lastInjured;

                if (elapsed > 1000){
                    settings.lives--;
                    createjs.Sound.play("playerHit");
                    state.lastInjured = new Date();
                    HUDContainer.removeChild(HUD.hearts[settings.lives]);

                    if (settings.lives <= 0 && player.isAlive) {
                        player.isAlive = false;
                        gameOver();
                    }
                }
            }
        }
        if(playerHitTest(grid[10][10]) && player.isAlive) {     // Chest collision
            if (!state.itemsSpawned)
            {
                items.chest.gotoAndStop('chestOpen');
                spawnItems();
                state.itemsSpawned = true;
                stage.removeChild(items.chest);
            }
        }
        if (state.tweenComplete) {
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
    if (currentLevel == 1) {
        if (playerHitTest((grid[2][9]) || grid[2][10]) && player.hasKey){ // Level two door collision
            grid[1][9].gotoAndPlay('wholeFloor');
            grid[1][9].tileNumber = 5;
            grid[0][9].gotoAndPlay('wholeFloor');
            grid[0][9].tileNumber = 5;
            grid[0][10].gotoAndPlay('brokenFloor');
            grid[0][10].tileNumber = 7;
            grid[1][10].gotoAndPlay('wholeFloor');
            grid[1][10].tileNumber = 5;

            HUD.key.gotoAndPlay('emptyKey');
            player.hasKey = false;
        }
    }

    if (currentLevel == 2 && player.hasKey) {
        if (playerHitTest((grid[2][9]) || grid[2][10])){ // Level two door collision
            grid[1][9].gotoAndPlay('wholeFloor');
            grid[1][9].tileNumber = 5;
            grid[0][9].gotoAndPlay('wholeFloor');
            grid[0][9].tileNumber = 5;
            grid[0][10].gotoAndPlay('brokenFloor');
            grid[0][10].tileNumber = 7;
            grid[1][10].gotoAndPlay('wholeFloor');
            grid[1][10].tileNumber = 5;

            HUD.key.gotoAndPlay('emptyKey');
            player.hasKey = false;
        }
    }
}
/* =========================================================
                        LEVEL TRANSITIONS
 ==========================================================*/
//transition text
function startTransitionText(){
    if (state.gamePaused){
        stage.canvas.style.backgroundColor = "black";
        transitionDialogue.bg = new createjs.Bitmap("assets/img/midscreen.png");
        stage.addChild(transitionDialogue.bg);

        transitionDialogue.wordsStage = 0;
        transitionDialogue.textContainer = new createjs.Container();
        if (currentLevel == 0)
        {
            transitionDialogue.text = new createjs.Text(transitionDialogue.speech[0], "15px Arial", "#000000");
        } else {
            transitionDialogue.text = new createjs.Text(transitionDialogue.speech[3], "15px Arial", "#000000");
        }
        transitionDialogue.image = new Image();
        transitionDialogue.image.onload = function() { stage.update(); };
        transitionDialogue.image.src = "assets/img/bubble.png";
        transitionDialogue.sb = new createjs.ScaleBitmap(transitionDialogue.image, new createjs.Rectangle(8, 12, 10, 5));
        transitionDialogue.sb.width = 250;
        transitionDialogue.sb.height = 50;
        transitionDialogue.sb.setDrawSize(transitionDialogue.sb.width, transitionDialogue.sb.height);
        transitionDialogue.sb.x = 11 * tileSize;
        transitionDialogue.sb.y = tileSize;
        transitionDialogue.text.textAlign = "start";
        transitionDialogue.text.x = transitionDialogue.sb.x + 8;
        transitionDialogue.text.y = transitionDialogue.sb.y + 8;
        transitionDialogue.textContainer.addChild(transitionDialogue.sb, transitionDialogue.text);
        stage.addChild(transitionDialogue.textContainer);
        //instructions
        transitionDialogue.helpWords = new createjs.Text("Press [enter] to hear the wise man's words.", "20px Arial Black", "#ffffff");
        transitionDialogue.helpWords.textAlign = "center";
        transitionDialogue.helpWords.x = stage.canvas.width / 2;
        transitionDialogue.helpWords.y = stage.canvas.height - 100;
        stage.addChild(transitionDialogue.helpWords);
    }
}

//update transition dialogue
function updateTransitionText() {
    if (keys.enter && state.gamePaused) {
        stage.removeChild(transitionDialogue.helpWords);
        transitionDialogue.textContainer.removeChild(transitionDialogue.text);

        switch (transitionDialogue.wordsStage) {
            case 0:
                transitionDialogue.text = new createjs.Text(transitionDialogue.speech[1], "15px Arial", "#000000");
                transitionDialogue.lastChanged = new Date();
                transitionDialogue.wordsStage++;
                break;
            case 1:
                var elapsed = new Date() - transitionDialogue.lastChanged;
                if (elapsed > 500) {
                    transitionDialogue.text = new createjs.Text(transitionDialogue.speech[2], "15px Arial", "#000000");
                    transitionDialogue.wordsStage++;
                    transitionDialogue.lastChanged = new Date();
                }
                break;
            case 2:
                elapsed = new Date() - transitionDialogue.lastChanged;
                if (elapsed > 500) {
                    stage.removeChild(transitionDialogue.textContainer, transitionDialogue.bg, transitionDialogue.helpWords);
                    transitionDialogue.lastChanged = new Date();
                    state.gamePaused = false;
                    setupLevel();
                }
                break;
            case 3:
                elapsed = new Date() - transitionDialogue.lastChanged;
                if (elapsed > 500) {
                    stage.removeChild(transitionDialogue.textContainer, transitionDialogue.bg, transitionDialogue.helpWords);
                    transitionDialogue.lastChanged = new Date();
                    state.gamePaused = false;
                    setupLevel();
                }
                break;
        }

        transitionDialogue.text.textAlign = "start";
        transitionDialogue.text.x = transitionDialogue.sb.x + 8;
        transitionDialogue.text.y = transitionDialogue.sb.y + 8;
        transitionDialogue.textContainer.addChild(transitionDialogue.text);

    }
}
/* =========================================================
                         LEVEL 2
 ==========================================================*/

function addEnemiesSecond(){
    if (!state.levelComplete) {
        var enemiesSecond = new createjs.SpriteSheet(queue.getResult("enemiesSecond"));
        for(var i= 0; i < settings.obstacleCount; i++){
            var enemyOne = new createjs.Sprite(enemiesSecond, "rockSM");
            var enemySecond = new createjs.Sprite(enemiesSecond, "fireSM");
            var enemyThird = new createjs.Sprite(enemiesSecond, "ghostSM");
            enemyOne.width = 45;
            enemyOne.height = 45;
            enemySecond.width = 45;
            enemySecond.height = 45;
            enemyThird.width = 45;
            enemyThird.height = 45;
            enemyOne.x = Math.floor(Math.random() * 800)+100;
            enemySecond.x = Math.floor(Math.random() * 800)+100;
            enemyThird.x = Math.floor(Math.random() * 800)+100;
            stage.addChild(enemyOne);
            mobiles.obstacles.push(enemyOne);
            stage.addChild(enemySecond);
            mobiles.obstacles.push(enemySecond);
            stage.addChild(enemyThird);
            mobiles.obstacles.push(enemyThird);
        }
    }
}

function moveEnemiesSecond() {
    for (var i = mobiles.obstacles.length - 1; i >= 0; i--) {
        mobiles.obstacles[i].y += settings.enemySpeed * 10;
        if (mobiles.obstacles[i].y > stage.canvas.height) {
            mobiles.obstacles[i].y = Math.floor(Math.random() * 200);
            mobiles.obstacles[i].x = Math.floor(Math.random() * 800)+100;
        }
    }
}
function addEnergy() {
    var enemiesSecond = new createjs.SpriteSheet(queue.getResult("enemiesSecond"));
    mobiles.energySprite = new createjs.Sprite(enemiesSecond, "energySM");
    mobiles.energySprite.height = 45;
    mobiles.energySprite.width = 45;
    mobiles.energySprite.regY = 45;
    mobiles.energySprite.x = Math.floor(Math.random()*800)+100;
    mobiles.energySprite.y = Math.floor(Math.random()*200);
    stage.addChild(mobiles.energySprite);
}
function moveEnergy() {
    mobiles.energySprite.y += settings.energySpeed;
    if (mobiles.energySprite.y > stage.canvas.height) {
        mobiles.energySprite.y = Math.floor(Math.random() * 200);
        mobiles.energySprite.x = Math.floor(Math.random() * 800)+100;
    }
}
function handleLevelTwoHits() {
    if (!state.levelComplete){
        for (var i = mobiles.obstacles.length-1; i >= 0; i--) {
            if (playerHitTest(mobiles.obstacles[i])) {
                settings.lives--;
                createjs.Sound.play("playerHit");
                HUDContainer.removeChild(HUD.hearts[settings.lives]);

                if (settings.lives <= 0 && player.isAlive) {
                    player.isAlive = false;
                    gameOver();
                }
                stage.removeChild(mobiles.obstacles[i]);
                mobiles.obstacles.splice(i,1);
            }
        }
        if (playerHitTest(mobiles.energySprite)) {                    // Energy hit test
            if (Date.now() - state.lastEnergy > 500) {
                settings.energy++;
                stage.removeChild(mobiles.energySprite);
                addEnergy();
                for (var j = 0; j < settings.energy; j++) {
                    HUD.energyOutlines[j].gotoAndPlay('energy');
                }
                state.lastEnergy = Date.now();
                if(settings.energy>=3 && items.armor.isSpawned == false) {
                    levelTwoReward();
                    items.armor.isSpawned = true;
                    state.chestSpawned = true;
                }
            }
        }
    }
    if (state.chestSpawned){
        if (playerHitTest(items.chest)) {
            items.chest.gotoAndStop("chestOpen");
            endLevelTwo();
            state.chestSpawned = false;
        }
    }

    if (state.tweenComplete) {
        if (typeof items.key != "undefined") {
            if (playerHitTest(items.key) && !player.hasKey) {
                createjs.Sound.play("keyPickup");
                stage.removeChild(items.key);
                player.hasKey = true;
                HUD.key.gotoAndStop('key');
            }
        }
        if (typeof  items.armor != "undefined") {
            if (playerHitTest(items.armor) && !player.hasArmor) {
                stage.removeChild(items.armor);
                createjs.Sound.play("keyPickup");
                player.hasArmor = true;
            }
        }
    }
}
function levelTwoReward() {
    for (var i = mobiles.obstacles.length - 1; i >= 0; i--) {
        stage.removeChild(mobiles.obstacles[i]);
    }
    mobiles.obstacles = [];
    stage.removeChild(mobiles.energySprite);
    state.levelComplete = true;

    var chestSS = new createjs.SpriteSheet(queue.getResult("chestSS"));
    items.chest = new createjs.Sprite(chestSS, "chestClosed");
    items.chest.x = 10 * tileSize;
    items.chest.y = 7 * tileSize;
    stage.addChild(items.chest);

}
function endLevelTwo() {
    state.itemsSpawned = true;
    stage.removeChild(items.chest);
    var keySS = new createjs.SpriteSheet(queue.getResult("keySS"));
    items.key = new createjs.Sprite(keySS, "key");
    items.key.x = 10 * tileSize;
    items.key.y = 7 * tileSize;
    items.key.width = tileSize;
    items.key.height = tileSize;
    stage.addChild(items.key);

    createjs.Tween.get(items.key, {loop: false})
        .to({x: 6 * tileSize, rotation: 360}, 1000);

    var armorSS = new createjs.SpriteSheet(queue.getResult("enemiesSecond"));
    items.armor = new createjs.Sprite(armorSS, "armor");
    items.armor.x = 10 * tileSize;
    items.armor.y = 7 * tileSize;
    items.armor.width = tileSize;
    items.armor.height = tileSize;
    stage.addChild(items.armor);

    createjs.Tween.get(items.armor, {loop: false})
        .to({x: 14 * tileSize, rotation: 360}, 1000)
        .call(function () {
            state.tweenComplete = true;
        })

}
/* =========================================================
 LEVEL 3
 ==========================================================*/
/*enemies appear*/
function addEnemies() {
    var enemySS = new createjs.SpriteSheet(queue.getResult("guardSS"));
    for(var i=0; i < settings.enemyCount; i++){
        var enemy = new createjs.Sprite(enemySS, "idle");
        enemy.x = 20 * tileSize * Math.random();
        enemy.y = 13 * tileSize * Math.random();
        enemy.width = player.width;
        enemy.height = tileSize;
        enemy.regY = 45;
        settings.soldierLastMoved.push(Date.now());
        stage.addChild(enemy);
        mobiles.soldiers.push(enemy);

    }
}
/*enemies move*/
function moveEnemies() {
    for (var i = mobiles.soldiers.length - 1; i >= 0; i--) {
        var leftness = Math.floor(mobiles.soldiers[i].x - player.x);
        var rightness = Math.floor(player.x - mobiles.soldiers[i].x);
        var aboveness = Math.floor(mobiles.soldiers[i].y - player.y);
        var belowness = Math.floor(player.y - mobiles.soldiers[i].y);
        var biggest = Math.max(leftness, rightness, aboveness, belowness);

        if (rightness == biggest){
            mobiles.soldiers[i].x+=settings.enemySpeed;
            if (mobiles.soldiers[i].currentAnimation != "right") {
                mobiles.soldiers[i].gotoAndPlay('right');
                mobiles.soldiers[i].currentAnimation = "right";
            }
        }
        if (leftness == biggest){
            mobiles.soldiers[i].x-=settings.enemySpeed;
            if (mobiles.soldiers[i].currentAnimation != "left") {
                mobiles.soldiers[i].gotoAndPlay('left');
                mobiles.soldiers[i].currentAnimation = "left";
            }
        }
        if (aboveness == biggest){
            mobiles.soldiers[i].y-=settings.enemySpeed;
            if (mobiles.soldiers[i].currentAnimation != "up") {
                mobiles.soldiers[i].gotoAndPlay('up');
                mobiles.soldiers[i].currentAnimation = "up";
            }
        }
        if (belowness == biggest){
            mobiles.soldiers[i].y+=settings.enemySpeed;
            if (mobiles.soldiers[i].currentAnimation != "down") {
                mobiles.soldiers[i].gotoAndPlay('down');
                mobiles.soldiers[i].currentAnimation = "down";
            }
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
function levelThreeHitTest() {
    for (var i = mobiles.soldiers.length - 1; i >= 0; i--) {
        if (typeof mobiles.soldiers[i] != "undefined") {
            if (hitTest(player, mobiles.soldiers[i]) == true) {
                stage.removeChild(mobiles.soldiers[i]);
                mobiles.soldiers.splice(i, 1);
                createjs.Sound.play("touch");
                settings.lives--;
                createjs.Sound.play("playerHit");
                HUDContainer.removeChild(HUD.hearts[settings.lives]);

                if (settings.lives <= 0 && player.isAlive) {
                    player.isAlive = false;
                    gameOver();
                }
            }
        }

    }
    //soldiers and weapons hitTest
    var numSoldiers = mobiles.soldiers.length;

    if (numSoldiers == 0 && player.isAlive){
        if (!state.rewardsHad)
        {
            levelThreeRewards();
            state.rewardsHad = true;
        }
    } else {
        for (var s = mobiles.soldiers.length - 1; s >= 0; s--) {
            for (var w = items.discs.length - 1; w >= 0; w--) {
                if (typeof mobiles.soldiers[s] != "undefined" && typeof items.discs[w] != "undefined") {
                    if (hitTest(mobiles.soldiers[s], items.discs[w]) == true) {
                        stage.removeChild(mobiles.soldiers[s]);
                        mobiles.soldiers.splice(s, 1);
                        stage.removeChild(items.discs[w]);
                        items.discs.splice(w, 1);
                        createjs.Sound.play("hit");
                    }
                }
            }
        }
    }
    if (state.chestSpawned){
        if (hitTest(items.chest, player)) {
            items.chest.gotoAndStop("chestOpen");
            if (!state.itemsSpawned)
            {
                endLevelThree();
                state.itemsSpawned = true;
            }
            state.chestSpawned = false;
        }
    }
    if (state.tweenComplete) {
        if (typeof items.key != "undefined") {
            if (hitTest(items.key, player) && !player.hasKey) {
                createjs.Sound.play("keyPickup");
                stage.removeChild(items.key);
                player.hasKey = true;
                HUD.key.gotoAndStop('key');
            }
        }
    }
}
//xena fights back
function defend() {
    var weaponSS = new createjs.SpriteSheet(queue.getResult("weaponSS"));
    var weapon = new createjs.Sprite(weaponSS, "weapon");
    weapon.x = player.x;
    weapon.y = player.y - tileSize;
    weapon.width = 45;
    weapon.height = 45;
    weapon.direction = player.currentDirection;
    stage.addChild(weapon);
    items.discs.push(weapon);
}
function weaponsMoving(){
    for (var i = items.discs.length - 1; i  >= 0; i--){
        if (items.discs[i].direction == "up") {
            items.discs[i].y-=settings.discSpeed;
        }
        if (items.discs[i].direction == "down") {
            items.discs[i].y+=settings.discSpeed;
        }
        if (items.discs[i].direction == "left"){
            items.discs[i].x-=settings.discSpeed;
        }
        if (items.discs[i].direction == "right") {
            items.discs[i].x+=settings.discSpeed;
        }
        if (items.discs[i].x > stage.canvas.width || items.discs[i].x < 0) {
            stage.removeChild(items.discs[i]);
        }
        if (items.discs[i].y > stage.canvas.height || items.discs[i].y < 0) {
            stage.removeChild(items.discs[i]);
        }
    }
}
function levelThreeRewards() {
    stage.removeChild(items.chest);
    state.chestSpawned = true;
    var chestSS = new createjs.SpriteSheet(queue.getResult("chestSS"));
    items.chest = new createjs.Sprite(chestSS, "chestClosed");
    items.chest.x = 10 * tileSize;
    items.chest.y = 7 * tileSize;
    items.chest.width = tileSize;
    items.chest.height = tileSize;
    stage.addChild(items.chest);
}
function endLevelThree() {
    state.itemsSpawned = true;
    stage.removeChild(items.chest);
    var keySS = new createjs.SpriteSheet(queue.getResult("keySS"));
    items.key = new createjs.Sprite(keySS, "key");
    items.key.x = 10 * tileSize;
    items.key.y = 7 * tileSize;
    items.key.width = tileSize;
    items.key.height = tileSize;
    stage.addChild(items.key);

    createjs.Tween.get(items.key, {loop: false})
        .to({y: 4 * tileSize, rotation: 360}, 1000)
        .call(function () {
            state.tweenComplete = true;
        });

}
/* =========================================================
                        WIN / LOSE
 ==========================================================*/

function gameOver() {
    stage.removeAllChildren();
    mobiles.guards = [];
    mobiles.soldiers = [];
    mobiles.obstacles = [];
    mobiles.energySprite = {};
    state.tweenComplete = false;
    state.gameOver = true;

    var bg = new createjs.Shape();
    bg.graphics.beginFill("black");
    bg.graphics.drawRect(0, 0, 900, 630);
    var gameOverText = new createjs.Text("Game Over", "20px Arial Black", "#ffffff");
    var restartText = new createjs.Text("Press [enter] to continue.", "16px Arial Black", "#ffffff");
    var gameOverContainer = new createjs.Container();
    gameOverText.textAlign = "center";
    gameOverText.x = stage.canvas.width / 2;
    gameOverText.y = stage.canvas.width / 4;
    restartText.textAlign = "center";
    restartText.x = stage.canvas.width / 2;
    restartText.y = stage.canvas.width / 3;
    gameOverContainer.width = 900;
    gameOverContainer.height = 675;
    gameOverContainer.addChild(bg, gameOverText, restartText);
    stage.addChild(gameOverContainer);
}
function youWin() {
    stage.removeAllChildren();
    mobiles.guards = [];
    mobiles.soldiers = [];
    state.tweenComplete = false;
    state.gameOver = false;
    state.youWin = true;

    var youWinContainer = new createjs.Container();
    youWinContainer.width = 900;
    youWinContainer.height = 675;
    stage.canvas.style.backgroundColor = "#94DAF0";

    var bgYouWin = new createjs.Shape();
    bgYouWin.graphics.beginFill("green"). drawRect(0, 0, 900, 325);
    bgYouWin.x = 0;
    bgYouWin.y = 310;

    var bgForest = new createjs.SpriteSheet(queue.getResult("bgForest"));
    var forest = new createjs.Sprite(bgForest, "forest");
    forest.x = stage.canvas.width / 2;
    forest.regX = 355;
    forest.y = stage.canvas.height / 2;
    forest.regY = 170;

    var youWinText = new createjs.Text("You are free my child!", "20px Arial Black", "#ffffff");
    youWinText.textAlign = "center";
    youWinText.x = stage.canvas.width / 2;
    youWinText.y = stage.canvas.width / 4;

    var playerwins = new createjs.SpriteSheet(queue.getResult("playerRagsSS"));
    var player = new createjs.Sprite(playerwins, "up");
    player.x = 420;
    player.y = 450;

    youWinContainer.addChild(bgYouWin, forest, youWinText, player);
    stage.addChild(youWinContainer);

}
window.addEventListener('load', preload);
