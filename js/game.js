var stage, queue, player, grid = [];
var levels = [], currentLevel =-1, tileSize = 45;

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
            {id: "playerRagsSS", src: "assets/json/herotatters.json"}
        ]
    );
}
function queueComplete() {
    var lvl = queue.getResult("levelJson");
    levels = lvl.levels;

    window.onkeyup = keyUp;

    createjs.Ticker.setFPS(60);
    createjs.Ticker.on('tick', updateScene);

    setupLevel();
}
function setupLevel() {
    stage.removeAllChildren();
    currentLevel++;

    var spritesheet = new createjs.SpriteSheet(queue.getResult('geometrySprites'));

    var level = levels[currentLevel].tiles;
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
    player.regX = 0;
    player.regY = 45;
    player.row = playerRow;
    player.col = playerCol;
    stage.addChild(player);

}
function updateScene(e) {
    stage.update(e)
}

function keyUp(e) {
    switch (e.keyCode) {
        case 37:
            moveTo(0, -1);
            break;
        case 38:
            moveTo(-1, 0);
            break;
        case 39:
            moveTo(0, 1);
            break;
        case 40:
            moveTo(1, 0);
            break;
    }
}

function moveTo(rowModifier, colModifier){
    var newRow = player.row+rowModifier;
    var newCol = player.col+colModifier;
    if(walkable(newRow, newCol)){
        player.row=newRow;
        player.col=newCol;
        player.x=newCol*tileSize;
        player.y=newRow*tileSize;
    } else {
        createjs.Sound.play("error");
    }
}

function walkable(r, c) {
    var nonWalkable = [0,1,2,3,4,6,8,9,10,11,12,13];
    console.log(grid[r][c].tileNumber)

    if (nonWalkable.indexOf(grid[r][c].tileNumber) != -1) {

    } else {
        switch (grid[r][c].tileNumber){
            case 5:
                return true;
                break;
            case 7:
                return true;
                break;
        }
    }
}

window.addEventListener('load', preload);