const ActivateCardAction = cc.Class.extend({
    ctor: function (card_type, x,y, uid) {
        cc.log(' Client an dat tru tai frame = '+ GameStateManagerInstance.frameCount)
        this.card_type = card_type
        this.x = x
        this.y = y
        this.uid = uid
    },

    writeTo: function (pkg) {
        pkg.putByte(this.card_type)
        pkg.putInt(this.x)
        pkg.putInt(this.y)
        pkg.putInt(this.uid)
        cc.log("ActivateCardAction " + this.uid)
    },

    getActionCode: function () {
        return ACTION_CODE.ACTIVATE_CARD_ACTION
    },

    getActionDataSize: function () {
        return 1+4+4+4;
    },

    activate: function (gameStateManager) {
        cc.log(' Check duong di tai frame = '+ GameStateManagerInstance.frameCount)
        GameUI.instance.checkCanDeployCardTower(this.card_type, new Vec2(this.x, this.y), this.uid);
    }
})

ActivateCardAction.deserializer = function (pkg) {
    let tmp = []
    const card_type = pkg.getByte(), x = pkg.getInt(), y = pkg.getInt(), uid = pkg.getInt();
    /*
    add timer tower cho map Opponent khi vừa nhận action từ sv
     */
    if (uid != gv.gameClient._userId ){
        var loc = convertLogicalPosToIndex(new Vec2(x, y), 2)
        GameUI.instance.addTimerBeforeCreateTower(convertIndexToPos(loc.x, loc.y, 2));
    }
    tmp.push(card_type)
    tmp.push(x)
    tmp.push(y)
    tmp.push(uid)
    return tmp
}

ActivateCardAction.deserializerArr = function (pkgArr) {
    const card_type = pkgArr[0], x = pkgArr[1], y = pkgArr[2], uid = pkgArr[3];
    return new ActivateCardAction(card_type, x, y, uid);
}