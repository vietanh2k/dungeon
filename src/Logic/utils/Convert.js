const convertIndexToPos = function (corX, corY, rule) {
    var x, y
    if (rule === 1) {
        x = winSize.width / 2 - WIDTHSIZE / 2 + (corX + 1) * CELLWIDTH
        y = winSize.height / 2 - HEIGHTSIZE / 2 + (MAP_HEIGHT - corY + 3.5) * CELLWIDTH
    } else {
        x = winSize.width / 2 - WIDTHSIZE / 2 + (7 - corX) * CELLWIDTH
        y = winSize.height / 2 - HEIGHTSIZE / 2 + (MAP_HEIGHT + corY + 3.5) * CELLWIDTH
    }
    return new cc.p(x, y)
};

const convertPosToIndex = function (pos, rule) {
    var x, y
    if (rule === 1) {
        x = Math.floor((pos.x - winSize.width / 2 + WIDTHSIZE / 2) / CELLWIDTH - 0.5)
        y = Math.floor(MAP_HEIGHT + 3.5 - (pos.y - winSize.height / 2 + HEIGHTSIZE / 2) / CELLWIDTH + 0.5)
    } else if (rule === 2) {
        x = Math.floor(MAP_WIDTH - (pos.x - winSize.width / 2 + WIDTHSIZE / 2) / CELLWIDTH + 0.5)
        y = Math.floor((pos.y - winSize.height / 2 + HEIGHTSIZE / 2) / CELLWIDTH - MAP_HEIGHT - 3.5 + 0.5)
    } else {
        cc.log('invalid rule: ' + rule);
        return null;
    }
    return new cc.p(x, y)
};

const isCorInMap = function (cor) {
    return cor.x >= 0 && cor.x <= MAP_WIDTH - 1 && cor.y >= 1 && cor.y <= MAP_HEIGHT;
};

const isPosInMap = function (pos, rule) {
    let cor = convertPosToIndex(pos, rule);
    return isCorInMap(cor);
};

const getMiddleOfCell = function (loc, rule) {
    let cor = convertPosToIndex(loc, rule);
    return convertIndexToPos(cor.x, cor.y, rule);
};

const getRule = function (target) {
    switch (target.type) {
        case 16:
        case 17:
        case 18:
        case 2:
        case 5:
        case 7:
            return 1;
        case 4:
        case 6:
            return 2;
        case 3:
            return 1; // fixme
        default:
            break;
    }
};

const convertLogicalPosToIndex = function (pos, rule) {
    let x = Math.floor((pos.x - MAP_CONFIG.CELL_WIDTH / 2.0) / MAP_CONFIG.CELL_WIDTH),
        y = 1 + Math.floor((pos.y - MAP_CONFIG.CELL_HEIGHT / 2.0) / MAP_CONFIG.CELL_HEIGHT);
    return cc.p(x, y)

};

