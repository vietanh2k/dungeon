
var MapView = cc.Class.extend({
    trees: null,
    monsters: null,
    spells: null,
    bullets:null,
    towers:null,
    _mapController:null,
    _playerState: null,


    ctor:function (playerState, intArray) {
        this._playerState = playerState

        this._mapController = new MapController(intArray)
        this.monsters = []
        this.init();

    },
    init:function () {

        winSize = cc.director.getWinSize();

        var monster = new Monster(1, this._playerState)
        this.monsters.push(monster)




        return true;
    },


});
