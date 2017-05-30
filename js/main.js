"use strict"
var stage,grid=[],hero,preloadText, queue;
var levels=[], currentLevel=0, tileSize=64;
window.addEventListener('load', preload);
function preload(){
    stage = new createjs.Stage("canvas");
    preloadText = new createjs.Text("", "50px Courier New", "#000");
    stage.addChild(preloadText);
    queue = new createjs.LoadQueue(true);
    queue.installPlugin(createjs.Sound)
    queue.on("progress", queueProgress);
    queue.on("complete", queueComplete);
    queue.loadManifest([
        "assets/img/geometry.png",
        {id:"tileSprites",src:"assets/json/tiles.json"},
        {id:"levelJson",src:"assets/json/levels.json"},
        {id:"keypickup", src:"sounds/Power_Up_Ray.mp3"},
        {id:"doorunlock", src:"sounds/Door_Unlock.mp3"},
        {id:"step", src:"sounds/step.mp3"},
        {id:"bgsound", src:"sounds/bass.mp3"},
        {id:"error", src:"sounds/Computer_Error.mp3"},
        {id: "playerRagsSS", src: "assets/json/herotatters.json"}
    ]);
}

function queueProgress(e){
    preloadText.text= Math.round(e.progress*100)+"%"
    stage.update();
}

function queueComplete(){
    var t = queue.getResult("levelJson")
    levels = t.levels;
    setupLevel();
    createjs.Sound.play("bgsound");
    window.onkeyup=keyUp;
    createjs.Ticker.setFPS(30);
    createjs.Ticker.on("tick", function(e){
        stage.update(e)
    });
}

function keyUp(e){
    console.log("keypressed");
    switch(e.keyCode){
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
    var newRow = hero.row+rowModifier;
    var newCol = hero.col+colModifier;
    if(isValidTile(newRow, newCol)){
        createjs.Sound.play("step");
        hero.row=newRow;
        hero.col=newCol;
        hero.x=newCol*tileSize;
        hero.y=newRow*tileSize;
    } else {
        createjs.Sound.play("error");
    }
}

function isValidTile(r,c){
    console.log(grid[r][c].tileNumber);
    switch(grid[r][c].tileNumber){
        case 0:
            return true;
            break;
        case 1:
            return false;
            break;
        case 2:
            hero.keys++;
            createjs.Sound.play("keypickup")
            grid[r][c].gotoAndStop("floor")
            grid[r][c].tileNumber=0;
            return true;
            break;
        case 4:
            setupLevel();
            break;
        case 5:

            if(hero.keys>0){
                createjs.Sound.play("doorunlock")
                hero.keys--;
                grid[r][c].gotoAndStop("floor")
                grid[r][c].tileNumber=0;
                return true;
            }
            return false;
            break;
    }
}
function setupLevel(){
    stage.removeAllChildren();
    currentLevel++;
    if(currentLevel==levels.length){
        gameWon()
    }

    var ss = new createjs.SpriteSheet(queue.getResult('tileSprites'));
    var level = levels[currentLevel].tiles;
    grid=[]
    for(var i=0; i < level.length; i++){
        grid.push([]);
        for(var z=0; z< level[0].length; z++){
            grid[i].push(null);
        }
    }


    var heroRow, heroCol;
    for(var row=0; row<level.length; row++){
        for(var col =0; col<level[0].length; col++){
            var img='';
            switch(level[row][col]){
                case 0:
                    img="floor";
                    break;
                case 1:
                    img="lightStone1"
                    break;
                case 2:
                    img="key";
                    break;
                case 4:
                    img="door"
                    break;
                case 5:
                    img="keyhole";
                    break;
                case 9:
                    img="floor";
                    heroRow=row;
                    heroCol=col;
                    break;
            }
            var tile = new createjs.Sprite(ss, img);
            tile.x=col*tileSize;
            tile.y=row*tileSize;
            tile.row=row;
            tile.col=col;
            tile.tileNumber=level[row][col];
            if(level[row][col]==9){
                tile.tileNumber=0;
            }
            stage.addChild(tile);
            grid[row][col]=tile;
        }
    }
    var heroSS = new createjs.SpriteSheet(queue.getResult("playerRagsSS"));
    hero = new createjs.Sprite(heroSS, "idle");
    hero.x=heroCol*tileSize;
    hero.y=heroRow*tileSize;
    hero.row=heroRow;
    hero.col=heroCol;
    hero.keys=0;
    stage.addChild(hero);
}