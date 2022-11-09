
var PlayerState = cc.Class.extend({
    uid: null,
    energy: null,
    health: null,
    _map:null,
    deck:null,
    intArray:null,

    ctor:function () {
        this.health = 10
        this.energy = 20
        this.intArray =  Array.from(
            {length:MAP_WIDTH},
            ()=>Array.from(
                {length:MAP_HEIGHT}
            )
        );
        this.init();


    },
    init:function () {

        winSize = cc.director.getWinSize();







        return true;
    },
    updatehealth:function (amount) {
        this.health += amount

    },
    readFrom:function (bf) {
        bf.getInt()
        bf.getInt();
        bf.getInt();
        for (var y = 0; y < MAP_HEIGHT; y++) {
            for (var x = 0; x < MAP_WIDTH; x++) {
                var tmp =  bf.getInt();
                if(tmp == 0) this.intArray[x][y] = 0
                if(tmp == 1) this.intArray[x][y] = 0
                if(tmp == 2) this.intArray[x][y] = 0
                if(tmp == 3) this.intArray[x][y] = 1
                if(tmp == 4) this.intArray[x][y] = 0
                if(tmp == 5) this.intArray[x][y] = 2
                if(tmp == 6) this.intArray[x][y] = -1
                if(tmp == 7) this.intArray[x][y] = -2
                if(tmp == 8) this.intArray[x][y] = -3

                cc.log(y+'-'+x+'====='+tmp)
            }
        }
        this._map = new MapView(this, this.intArray)
    },
    readTo:function (bf) {

        bf.getInt();
        bf.getInt();

        for (var y = 0; y < MAP_HEIGHT; y++) {
            for (var x = 0; x < MAP_WIDTH; x++) {
                 this.intArray[y][x] = bf.getInt();
            }
        }
    },
    convertCordinateToPos:function (corX, corY) {
        var x = winSize.width/2 - WIDTHSIZE/2 + (corX+1)*CELLWIDTH
        var y = winSize.height/2 - HEIGHTSIZE/2 + (MAP_HEIGHT- corY+3.5)*CELLWIDTH
        var p = new cc.p(x,y)
        return p

    },
    convertPosToCor:function (pos) {
        var x = Math.floor((pos.x-winSize.width/2+WIDTHSIZE/2)/CELLWIDTH-0.5)
        var y = Math.floor(MAP_HEIGHT+3.5 - (pos.y - winSize.height/2 + HEIGHTSIZE/2 )/CELLWIDTH+0.5)
        var p = new cc.p(x,y)
        return p

    },

});
