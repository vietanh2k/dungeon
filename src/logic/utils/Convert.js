const convertIndexToPosLogic = function (corX, corY) {
    var x, y
    x = corX * GAME_CONFIG.CELLSIZE + GAME_CONFIG.CELLSIZE/2
    y = corY * GAME_CONFIG.CELLSIZE + GAME_CONFIG.CELLSIZE/2

    return new cc.p(x, y)
};
