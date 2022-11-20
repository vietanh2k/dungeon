/**
 * Created by KienVN on 10/2/2017.
 */

gv.CMD = gv.CMD || {};
gv.CMD.HAND_SHAKE = 0;
gv.CMD.USER_LOGIN = 1;

gv.CMD.USER_INFO = 1001;
gv.CMD.MOVE = 2001;
gv.CMD.OPEN_CHEST = 3001;
gv.CMD.OPEN_CHEST_NOW = 3001;
gv.CMD.START_COOLDOWN = 3002;
gv.CMD.UPDATE_PLAYER_INFO = 3003;
gv.CMD.BUY_GEM_OR_GOLD = 3004;
gv.CMD.UPGRADE_CARD = 3005;
gv.CMD.BUY_CARD = 3006;
gv.CMD.BUY_CHEST = 3007;
gv.CMD.SWAP_CARD_INTO_DECK = 3008;
gv.CMD.OFFER_REQUEST = 3009;
gv.CMD.OFFER_RESPONSE = 3009;
gv.CMD.MATCH_REQUEST = 4001;
gv.CMD.MATCH_REPONSE = 4002;
gv.CMD.MATCH_CONFIRM = 4003;
gv.CMD.BATTLE_START = 5001;

gv.CMD.BATTLE_ACTIONS = 5009;
gv.CMD.BATTLE_SYNC_START = 5005;
gv.CMD.BATTLE_SYNC_START_CONFIRM = 5006;

gv.CMD.BATTLE_SYNC_CLIENT_UPDATE_TO_FRAME_N = 5007;
gv.CMD.BATTLE_SYNC_CLIENT_UPDATE_TO_FRAME_N_CONFIRM = 5008;

testnetwork = testnetwork || {};
testnetwork.packetMap = {};


/** Outpacket */

//Handshake
CmdSendHandshake = fr.OutPacket.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(gv.CONTROLLER_ID.SPECIAL_CONTROLLER);
        this.setCmdId(gv.CMD.HAND_SHAKE);
    },
    putData: function () {
        this.packHeader();
        this.updateSize();
    }
});

CmdSendUserInfo = fr.OutPacket.extend(
    {
        ctor: function () {
            this._super();
            this.initData(100);
            this.setCmdId(gv.CMD.USER_INFO);
        },
        pack: function () {
            this.packHeader();
            this.updateSize();
        }
    }
);

CmdSendOpenChest = fr.OutPacket.extend(
    {
        ctor: function () {
            this._super();
            this.initData(100);
            this.setCmdId(gv.CMD.OPEN_CHEST);
        },
        putData: function (chest, gemSpent) {
            //pack
            this.packHeader();
            this.putInt(chest.id);
            this.putInt(gemSpent);
            //update
            this.updateSize();
        }
    }
);

// START_COOLDOWN
CmdSendStartCooldownChest = fr.OutPacket.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setCmdId(gv.CMD.START_COOLDOWN);
    },

    putData: function (chest) {
        this.packHeader();
        this.putInt(chest.id);
        this.updateSize();
    }
});

CmdSendLogin = fr.OutPacket.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setCmdId(gv.CMD.USER_LOGIN);
    },
    pack: function (userId) {
        this.packHeader();
        this.putString("section");
        this.putInt(userId)
        this.updateSize();
    }
});

CmdSendMove = fr.OutPacket.extend(
    {
        ctor: function () {
            this._super();
            this.initData(100);
            this.setCmdId(gv.CMD.MOVE);
        },
        pack: function (direction) {
            this.packHeader();
            this.putShort(direction);
            this.updateSize();
        }
    }
)


CmdMatchRequest = fr.OutPacket.extend(
    {
        ctor: function () {
            this._super();
            this.initData(100);
            this.setCmdId(gv.CMD.MATCH_REQUEST);
        },
        pack: function () {
            this.packHeader();
            this.updateSize();
        }
    }
)

CmdMatchConfirm = fr.OutPacket.extend(
    {
        ctor: function () {
            this._super();
            this.initData(100);
            this.setCmdId(gv.CMD.MATCH_CONFIRM);
        },
        pack: function () {
            this.packHeader();
            this.updateSize();
        }
    }
)

CmdBattleActions = fr.OutPacket.extend(
    {
        ctor: function () {
            this._super();
            this.initData(100);
            this.setCmdId(gv.CMD.BATTLE_ACTIONS);
        },

        pack: function (actions) {
            this.packHeader();

            this.putInt(actions.length)

            for (let i = 0; i < actions.length; i++) {
                this.putInt(actions[i].getActionPkgSize())
                this.putInt(actions[i].getActionCode())
                actions[i].writeTo(this)
            }

            this.updateSize();
        }
    }
)

CmdBattleSyncStartConfirm = fr.OutPacket.extend(
    {
        ctor: function () {
            this._super();
            this.initData(100);
            this.setCmdId(gv.CMD.BATTLE_SYNC_START_CONFIRM);
        },

        pack: function (syncN, frameN) {
            this.packHeader();

            this.putLong(syncN)
            this.putLong(frameN)

            this.updateSize();
        }
    }
)

CmdBattleSyncClientUpdateToFrameNConfirm = fr.OutPacket.extend(
    {
        ctor: function () {
            this._super();
            this.initData(100);
            this.setCmdId(gv.CMD.BATTLE_SYNC_CLIENT_UPDATE_TO_FRAME_N_CONFIRM);
        },

        pack: function (syncN) {
            this.packHeader();
            this.putLong(syncN)
            this.updateSize();
        }
    }
)
CmdOfferRequest = fr.OutPacket.extend(
    {
        ctor: function () {
            this._super();
            this.initData(100);
            this.setCmdId(gv.CMD.OFFER_REQUEST);
        },
        pack: function () {
            this.packHeader();
            this.updateSize();
        }
    }
)
CmdBuyGemOrGold = fr.OutPacket.extend(
    {
        ctor: function () {
            this._super();
            this.initData(100);
            this.setCmdId(gv.CMD.BUY_GEM_OR_GOLD);
        },
        pack: function (type, amout) {
            this.packHeader();

            this.putByte(type)
            this.putInt(amout)

            this.updateSize();
        }
    }
)

CmdBuyCard = fr.OutPacket.extend(
    {
        ctor: function () {
            this._super();
            this.initData(100);
            this.setCmdId(gv.CMD.BUY_CARD);
        },
        pack: function (leng, buyList, cost) {
            this.packHeader();

            this.putInt(leng)
            for (var i = 0; i < leng; i++) {
                this.putByte(buyList[i][0])
                this.putInt(buyList[i][1])
            }
            this.putInt(cost)

            this.updateSize();
        }
    }
)

CmdBuyChest = fr.OutPacket.extend(
    {
        ctor: function () {
            this._super();
            this.initData(100);
            this.setCmdId(gv.CMD.BUY_CHEST);
        },
        pack: function (leng, buyList, cost) {
            this.packHeader();

            this.putInt(leng)
            for (var i = 0; i < leng; i++) {
                this.putByte(buyList[i][0])
                this.putInt(buyList[i][1])
            }
            this.putInt(cost)

            this.updateSize();
        }
    }
)

// CmdSendAddCurrency = fr.OutPacket.extend({
//     ctor: function () {
//         this._super();
//         this.initData(100);
//         this.setCmdId(gv.CMD.ADD_CURRENCY);
//     },
//
//     putData: function (isGem, amount) {
//         this.packHeader();
//         this.putInt(0 + isGem);
//         this.putInt(amount);
//         this.updateSize();
//     },
// });
CmdSendSwapCardIntoDeck = fr.OutPacket.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setCmdId(gv.CMD.SWAP_CARD_INTO_DECK);
    },

    putData: function (typeIn, typeOut) {
        this.packHeader();
        this.putByte(typeIn);
        this.putByte(typeOut);
        this.updateSize();
    },
});

CmdSendUpgradeCard = fr.OutPacket.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setCmdId(gv.CMD.UPGRADE_CARD);
    },

    putData: function (type, goldSpent) {
        this.packHeader();
        this.putByte(type);
        this.putInt(goldSpent);
        this.updateSize();
    },
});

/**
 * InPacket
 */

//Handshake
testnetwork.packetMap[gv.CMD.HAND_SHAKE] = fr.InPacket.extend({
    ctor: function () {
        this._super();
    },
    readData: function () {
        this.token = this.getString();
    }
});

testnetwork.packetMap[gv.CMD.USER_LOGIN] = fr.InPacket.extend(
    {
        ctor: function () {
            this._super();
        },
        readData: function () {
        }
    }
);


testnetwork.packetMap[gv.CMD.USER_INFO] = fr.InPacket.extend({
    ctor: function () {
        this._super();
    },

    readData: function () {
        let id = this.getInt();
        let name = this.getString();
        let gold = this.getInt();
        let gem = this.getInt();
        let trophy = this.getInt();
        let collectionSize = this.getInt();
        let collection = [];
        for (let i = 0; i < collectionSize; i++) {
            collection.push(this.readCardData());
        }
        let chestListSize = this.getInt();
        let chestList = [];
        for (let i = 0; i < chestListSize; i++) {
            chestList.push(this.readChestData());
        }
        let deckSize = this.getInt();
        let deck = [];
        for (let i = 0; i < deckSize; i++) {
            deck.push(this.readCardTypeData(collection));
        }

        let serverNow = this.getLong();
        Utils.updateTimeDiff(serverNow);
        chestList.forEach(chest => chest.updateClientTime());

        sharePlayerInfo = new PlayerInfo(id, name, gold, gem, trophy, collection, chestList, deck);
        cc.log("Received user data from server: " + JSON.stringify(sharePlayerInfo.collection));
    },

    readCardData: function () {
        let type = this.getByte();
        let level = this.getInt();
        let fragment = this.getInt();
        return new Card(type, level, fragment);
    },

    readChestData: function () {
        let id = this.getInt();
        let type = this.getByte();
        let openOnServerTimestamp = this.getLong();
        return new Chest(id, type, openOnServerTimestamp);
    },

    readCardTypeData: function (collection) {
        let type = this.getByte();
        for (let i = 0; i < collection.length; i++) {
            if (collection[i].type === type) {
                return collection[i];
            }
        }
        cc.log('Cannot find card type ' + type + ' in collection.');
        return null;
    },
});

testnetwork.packetMap[gv.CMD.OPEN_CHEST] = fr.InPacket.extend({
    ctor: function () {
        this._super();
    },

    readData: function () {
        let status = this.getString();
        let chestID = this.getInt();
        let newCardsSize = this.getInt();
        cc.log('Received open chest response from server. Chest ID ' + chestID + ' with status \"' + status + '\" and the amount of new cards is ' + newCardsSize + '.');
        let newCards = [], goldReceived, serverNow;
        if (status === "Success") {
            for (let i = 0; i < newCardsSize; i++) {
                newCards.push(this.readCardData());
            }
            cc.log('New cards: ' + JSON.stringify(newCards));
            goldReceived = this.getInt();

            serverNow = this.getLong();
            Utils.updateTimeDiff(serverNow);

            cc.director.getRunningScene().runOpenChestAnimation(newCards, goldReceived);
            cc.director.getRunningScene().tabUIs[cf.LOBBY_TAB_HOME].openChestSlot(chestID, newCards, goldReceived);
        } else {
            Utils.addToastToRunningScene(status);
        }
    },

    readCardData: function () {
        let type = this.getByte();
        let level = this.getInt();
        let fragment = this.getInt();
        return new Card(type, level, fragment);
    },
}
);



testnetwork.packetMap[gv.CMD.START_COOLDOWN] = fr.InPacket.extend({
    ctor: function () {
        this._super();
    },

    readData: function () {
        let chestID = this.getInt();
        let openOnServerTimestamp = this.getLong();
        cc.log('Received start cooldown response from server. Chest ID: ' + chestID + ', open on server timestamp: ' + openOnServerTimestamp + '.');

        let serverNow = this.getLong();
        Utils.updateTimeDiff(serverNow);

        if (openOnServerTimestamp === cf.UNOPEN_CHEST_TIMESTAMP ||
            openOnServerTimestamp === cf.UNOPEN_CHEST_TIMESTAMP.toString()) {
            Utils.addToastToRunningScene('Rương chưa được bắt đầu mở!');
            return;
        }
        if (chestID === -1 || chestID === '-1') {
            Utils.addToastToRunningScene('Server không tìm được chest hay user');
            return;
        }
        this.chest = sharePlayerInfo.getChestById(chestID);
        if (this.chest == null) {
            Utils.addToastToRunningScene('Client không tìm thấy rương');
            return;
        }

        cc.director.getRunningScene().tabUIs[cf.LOBBY_TAB_HOME].startCooldownChestSlot(chestID, openOnServerTimestamp);
    }
});

testnetwork.packetMap[gv.CMD.MOVE] = fr.InPacket.extend(
    {
        ctor: function () {
            this._super();
        },
        readData: function () {
            this.x = this.getInt();
            this.y = this.getInt();
        }
    }
);

testnetwork.packetMap[gv.CMD.BATTLE_START] = fr.InPacket.extend(
    {
        ctor: function () {
            this._super();
        },
        readData: function () {
            var scene = new cc.Scene();
            scene.addChild(new GameUI(this));
            cc.director.runScene(new cc.TransitionFade(1.2, scene));
            cc.log('=================')
        }
    }
);
testnetwork.packetMap[gv.CMD.MATCH_REPONSE] = fr.InPacket.extend(
    {
        ctor: function () {
            this._super();
        },
        readData: function () {
            this.x = this.getInt();
        }
    }
);

testnetwork.packetMap[gv.CMD.BATTLE_ACTIONS] = fr.InPacket.extend({
    ctor: function () {
        this._super();
    },

    readData: function () {
        const num = this.getInt()
        for (let i = 0; i < num; i++) {
            const size = this.getInt()
            const actionCode = this.getInt()
            ACTION_DESERIALIZER[actionCode](this).activate(GameStateManagerInstance)
        }
        GameStateManagerInstance.updateType = GameStateManagerInstance.UPDATE_TYPE_NORMAL
    }
}
);
testnetwork.packetMap[gv.CMD.OFFER_RESPONSE] = fr.InPacket.extend(
    {
        ctor: function () {
            this._super();
        },
        readData: function () {
            this.status = this.getString()
            this.numChest = this.getInt()
            cc.log("OFFER_RESPONSE: " + JSON.stringify(this))
            this.chestOffers = []
            for (var i = 0; i < this.numChest; i++) {
                var chestType = this.getByte(),
                    chestCost = this.getInt()
                cc.log('chest:  ' + chestType + ' ' + chestCost)
                this.chestOffers.push([chestType, chestCost])

            }
            this.numCard = this.getInt()
            this.cardOffers = []
            for (var i = 0; i < this.numCard; i++) {
                var cardType = this.getByte(),
                    cardCost = this.getInt()
                cc.log('card:  ' + cardType + ' ' + cardCost)
                this.cardOffers.push([cardType, cardCost])
            }

            // this.numCard = this.getInt()
            // this.cardOffers = []
            // for(var i=0; i<this.numCard; i++){
            //     var chestType = this.getByte(),
            //         chestCost = this.getInt()
            //     this.cardOffers.push([chestType, chestCost])
            // }

            //
            // cc.log('aaaaaaaaaaaaaaaaaaaaaaa'+this.status+' '+this.numChest+' '+' '+this.chestType)
            // cc.log(this.chestCost)

        }
    }
);


testnetwork.packetMap[gv.CMD.BATTLE_SYNC_START] = fr.InPacket.extend({
    ctor: function () {
        this._super();
        this.syncN = 0
    },

    readData: function () {
        this.syncN = this.getLong()
    }
}
);

testnetwork.packetMap[gv.CMD.BATTLE_SYNC_CLIENT_UPDATE_TO_FRAME_N] = fr.InPacket.extend({
    ctor: function () {
        this._super();
        this.syncN = 0
        this.frameN = 0
    },

    readData: function () {
        cc.log("============================recv BATTLE_SYNC_CLIENT_UPDATE_TO_FRAME_N============================================")
        this.syncN = this.getLong()
        this.frameN = this.getLong()
    }
}
);

testnetwork.packetMap[gv.CMD.BUY_GEM_OR_GOLD] = fr.InPacket.extend({
    ctor: function () {
        this._super();
    },

    readData: function () {
        cc.log("============================recv BATTLE_SYNC_CLIENT_UPDATE_TO_FRAME_N============================================")
        this.typee = this.getByte()
        this.amout = this.getInt()
        cc.log(this.typee + ' ' + this.amout)
    }
}
);

testnetwork.packetMap[gv.CMD.BUY_CARD] = fr.InPacket.extend({
    ctor: function () {
        this._super();
    },

    readData: function () {
        cc.log("============================BUY CARD============================================")
        this.status = this.getString()
        this.leng = this.getInt(),
            this.buyList = []
        for (var i = 0; i < this.leng; i++) {
            var typeCard = this.getByte()
            var numCard = this.getInt()
            this.buyList.push([typeCard, numCard])
        }
        this.cost = this.getInt()
    }
}
);

testnetwork.packetMap[gv.CMD.BUY_CHEST] = fr.InPacket.extend({
    ctor: function () {
        this._super();
    },

    readData: function () {
        cc.log("============================BUY CHEST============================================")
        this.status = this.getString()
        this.leng = this.getInt(),
            this.buyList = []
        for (var i = 0; i < this.leng; i++) {
            var typeCard = this.getByte()
            var numCard = this.getInt()
            this.buyList.push([typeCard, numCard])
        }
        this.cost = this.getInt()
    }
}
);

testnetwork.packetMap[gv.CMD.ADD_CURRENCY] = fr.InPacket.extend({
    ctor: function () {
        this._super();
    },

    readData: function () {
        let type = this.getByte();
        let amount = this.getInt();
        let status = this.getString();
        cc.log('Get add currency response from server. type: ' + type + ', amount: ' + amount + ', status: ' + status + '.');

        let serverNow = this.getLong();
        Utils.updateTimeDiff(serverNow);

        if (status === "Success") {
            this.updatePlayerResource(type, amount);
            cc.director.getRunningScene().currencyPanel.updateLabels();
        } else {
            Utils.addToastToRunningScene(status);
        }
    },

    updatePlayerResource: function (type, amount) {
        if (type === 0) sharePlayerInfo.gem += amount;
        else sharePlayerInfo.gold += amount;
    },
});

testnetwork.packetMap[gv.CMD.SWAP_CARD_INTO_DECK] = fr.InPacket.extend({
    ctor: function () {
        this._super();
    },

    readData: function () {
        let status = this.getString();
        let typeIn = this.getByte();
        let typeOut = this.getByte();
        cc.log('Get swap card into deck response from server. Status: ' + status + ', typeIn: ' + typeIn + ', typeOut: ' + typeOut + '.');

        let serverNow = this.getLong();
        Utils.updateTimeDiff(serverNow);

        if (status === "Success") {
            sharePlayerInfo.updateDeckAfterSwapCard(typeIn, typeOut);
            cc.director.getRunningScene().tabUIs[cf.LOBBY_TAB_CARDS].updateSwapCardIntoDeck();
        } else {
            Utils.addToastToRunningScene(status);
            cc.director.getRunningScene().tabUIs[cf.LOBBY_TAB_CARDS].swapInCardSlot.removeFromParent(true);
            cc.director.getRunningScene().tabUIs[cf.LOBBY_TAB_CARDS].quitAddCardToDeck();
        }
    },
});

testnetwork.packetMap[gv.CMD.UPGRADE_CARD] = fr.InPacket.extend({
    ctor: function () {
        this._super();
    },

    readData: function () {
        let type = this.getByte();
        let status = this.getString();
        let card = this.readCardData();

        cc.log('Get upgrade card response from server. Status: ' + status + ', type: ' + type + ', card: ' + JSON.stringify(card) + '.');

        let serverNow = this.getLong();
        Utils.updateTimeDiff(serverNow);

        if (status === "Success") {
            for (let i = 0; i < sharePlayerInfo.collection.length; i++) {
                if (sharePlayerInfo.collection[i].type === type) {
                    sharePlayerInfo.collection[i] = card;
                    break;
                }
            }
            for (let i = 0; i < sharePlayerInfo.deck.length; i++) {
                if (sharePlayerInfo.deck[i].type === type) {
                    sharePlayerInfo.deck[i] = card;
                    break;
                }
            }
            cc.director.getRunningScene().tabUIs[cf.LOBBY_TAB_CARDS].updateCardSlotWithType(type);
            cc.director.getRunningScene().getChildByTag(cf.TAG_CARDINFOUI).destroy();
        } else {
            Utils.addToastToRunningScene(status);
        }
    },

    readCardData: function () {
        let type = this.getByte();
        let level = this.getInt();
        let fragment = this.getInt();
        return new Card(type, level, fragment);
    },
});
