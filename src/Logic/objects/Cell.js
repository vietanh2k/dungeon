

var Cell = cc.Class.extend({
    hp: null,
    type: null,
    _battle: null,
    _position:null,
    _playerState:null,
    ctor:function(arg, cordinate, playerState){
        this._playerState = playerState
        this.type = arg
        this._position = this._playerState.convertCordinateToPos(cordinate.x, cordinate.y)

    },
    init:function () {


        // this.scheduleUpdate();

        return true;
    },
    //
    // addBuffUI:function (res) {
    //     var buff = new cc.Sprite(res)
    //     buff.setScale(1.01*this._battle.cellWidth/buff.getContentSize().height)
    //
    //     buff.setPosition(this._position)
    //     this._battle.addChild(buff)
    // },




    update:function (dt) {


    },






});


