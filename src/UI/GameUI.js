
var GameUI = cc.Layer.extend({
    mapWidth: null,
    mapHeight: null,
    cellWidth: null,
    healthA: null,
    _gameStateManager: null,
    createObjectByTouch: null,
    deleteObjectByTouch: null,

    ctor: function (pkg) {
        cc.spriteFrameCache.addSpriteFrames(res.explosion2_plist, res.explosion2_png);
        cc.spriteFrameCache.addSpriteFrames(res.mapSheet_plist, res.mapSheet_png);
        this.delayTouch = false
        this.cardTouchSlot = -1
        this.listCard = []
        this._super();
        this._gameStateManager = new GameStateManager(pkg)
        this.init();
        this.scheduleUpdate();

        for (let i = 0; i <= 3; i++) {
            for (let j = 0; j < cf.TOWER_UI.length; j++) {
                if (cf.TOWER_UI[j] !== undefined) {
                    cc.spriteFrameCache.addSpriteFrames('res/tower/frame/' + cf.TOWER_UI[j].name + '/tower_' + cf.TOWER_UI[j].name + '_idle_' + i + '.plist');
                    cc.spriteFrameCache.addSpriteFrames('res/tower/frame/' + cf.TOWER_UI[j].name + '/tower_' + cf.TOWER_UI[j].name + '_attack_' + i + '.plist');
                }
            }
        }

        GameUI.instance = this;

    },
    init: function () {
        winSize = cc.director.getWinSize();
        this.initDeckCard();
        this.initBackGround();

        this.initCellSlot(this._gameStateManager.playerA._map._mapController.intArray, GAME_CONFIG.RULE_A)
        this.initCellSlot(this._gameStateManager.playerB._map._mapController.intArray, GAME_CONFIG.RULE_B)
        this.showPathUI(this._gameStateManager.playerA._map._mapController.listPath, GAME_CONFIG.RULE_A)
        this.showPathUI(this._gameStateManager.playerB._map._mapController.listPath, GAME_CONFIG.RULE_B)

        this.addTouchListener()

        return true;
    },

    initDeckCard: function () {
        this.cardPlayable = [];
        this.cardInQueue = [];
        let deck = sharePlayerInfo.deck;
        for (let i = 0; i < 4; i++) {
            this.cardPlayable[i] = deck[i].type;
        }
        for (let i = 0; i < 4; i++) {
            this.cardInQueue[i] = deck[i + 4].type;
        }
        // for (let i = 0; i < 4; i++) {
        //     this.cardPlayable[i] = 0+i;
        // }
        // for (let i = 0; i < 4; i++) {
        //     this.cardInQueue[i] = 0+i;
        // }
    },

    /**
     * Nếu có thẻ đang được chọn: sử dụng thẻ đó
     * Nếu hiện tại không chọn thẻ nào: mở UI dùng kĩ năng trụ và đổi ưu tiên mục tiêu
     */
    addTouchListener: function () {
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            // swallowTouches: true,
            onTouchBegan: (touch, event) => {
                if (this.cardTouchSlot >= 0) {
                    if (GameStateManagerInstance.playerA.energy >= this.listCard[this.cardTouchSlot - 1].energy) {
                        this.activeCard(this.listCard[this.cardTouchSlot - 1], touch.getLocation());
                    } else {
                        Utils.addToastToRunningScene('Không đủ năng lượng!');
                        this.resetCardTouchState();
                    }
                    this.removeCurrentTowerActionsUI();
                    return true;
                } else if (!this.isShowingTowerOptionsUI) {
                    if (!isPosInMap(touch.getLocation(), 1)) {
                        return false;
                    }
                    let position = convertIndexToMapPos(convertPosToIndex(touch.getLocation(), 1));
                    let tower = GameStateManagerInstance.playerA.getMap().getTowerAtPosition(position);
                    if (tower === undefined) {
                        return false;
                    }
                    this.showTowerOptionsUI(tower);
                    return true;
                }
                this.removeCurrentTowerActionsUI();
                return true;
            },
            onTouchEnded: (touch, event) => {
                cc.log(this.cardTouchSlot + ' end touch!');
            },
        }, this);
    },

    showTowerOptionsUI: function (tower) {
        let zOrder = GAME_CONFIG.RENDER_START_Z_ORDER_VALUE + winSize.height + 1;
        this.isShowingTowerOptionsUI = true;

        this.towerShowRangeUI = new cc.Sprite(asset.towerRange_png);
        this.towerShowRangeUI.attr({
            x: tower.x,
            y: tower.y,
            scale: tower.getRange() * CELLWIDTH * 2 / this.towerShowRangeUI.height,
        });
        this.addChild(this.towerShowRangeUI, zOrder);

        this.circleFrame = new cc.Sprite(asset.circleFrame_png);
        this.circleFrame.setPosition(tower.x, tower.y);
        this.addChild(this.circleFrame, zOrder);

        let frameRadius = 0.94 * this.circleFrame.width / 2;

        this.targetFullHPBtn = new ccui.Button(asset.targetIcon_png);
        this.targetFullHPBtn.setZoomScale(0);
        this.targetFullHPBtn.attr({
            x: tower.x - frameRadius * Math.cos(Math.PI * 0.1),
            y: tower.y - frameRadius * Math.sin(Math.PI * 0.1),
        });
        this.targetFullHPBtn.addClickEventListener(() => {
            testnetwork.connector.sendActions([[new ChangePrioritizedTargetAction(cf.PRIORITIZED_TARGET.FULL_HP, tower.position.x, tower.position.y, gv.gameClient._userId), 0]]);
        });
        this.addChild(this.targetFullHPBtn, zOrder);

        let targetFullHPIcon = new cc.Sprite(asset.targetFullHP_png);
        targetFullHPIcon.attr({
            x: this.targetFullHPBtn.width / 2,
            y: this.targetFullHPBtn.height / 2,
            scale: 0.8,
        });
        this.targetFullHPBtn.addChild(targetFullHPIcon);

        this.targetLowHPBtn = new ccui.Button(asset.targetIcon_png);
        this.targetLowHPBtn.setZoomScale(0);
        this.targetLowHPBtn.attr({
            x: tower.x - frameRadius * Math.cos(Math.PI * 0.3),
            y: tower.y + frameRadius * Math.sin(Math.PI * 0.3),
        });
        this.targetLowHPBtn.addClickEventListener(() => {
            testnetwork.connector.sendActions([[new ChangePrioritizedTargetAction(cf.PRIORITIZED_TARGET.LOW_HP, tower.position.x, tower.position.y, gv.gameClient._userId), 0]]);
        });
        this.addChild(this.targetLowHPBtn, zOrder);

        let targetLowHPIcon = new cc.Sprite(asset.targetLowHP_png);
        targetLowHPIcon.attr({
            x: this.targetLowHPBtn.width / 2,
            y: this.targetLowHPBtn.height / 2,
            scale: 0.8,
        });
        this.targetLowHPBtn.addChild(targetLowHPIcon);

        this.targetFurthestBtn = new ccui.Button(asset.targetIcon_png);
        this.targetFurthestBtn.setZoomScale(0);
        this.targetFurthestBtn.attr({
            x: tower.x + frameRadius * Math.cos(Math.PI * 0.3),
            y: tower.y + frameRadius * Math.sin(Math.PI * 0.3),
        });
        this.targetFurthestBtn.addClickEventListener(() => {
            testnetwork.connector.sendActions([[new ChangePrioritizedTargetAction(cf.PRIORITIZED_TARGET.FURTHEST, tower.position.x, tower.position.y, gv.gameClient._userId), 0]]);
        });
        this.addChild(this.targetFurthestBtn, zOrder);

        let targetFurthestIcon = new cc.Sprite(asset.targetFurthest_png);
        targetFurthestIcon.attr({
            x: this.targetFurthestBtn.width / 2,
            y: this.targetFurthestBtn.height / 2,
            scale: 0.8,
        });
        this.targetFurthestBtn.addChild(targetFurthestIcon);

        this.targetNearestBtn = new ccui.Button(asset.targetIcon_png);
        this.targetNearestBtn.setZoomScale(0);
        this.targetNearestBtn.attr({
            x: tower.x + frameRadius * Math.cos(Math.PI * 0.1),
            y: tower.y - frameRadius * Math.sin(Math.PI * 0.1),
        });
        this.targetNearestBtn.addClickEventListener(() => {
            testnetwork.connector.sendActions([[new ChangePrioritizedTargetAction(cf.PRIORITIZED_TARGET.NEAREST, tower.position.x, tower.position.y, gv.gameClient._userId), 0]]);
        });
        this.addChild(this.targetNearestBtn, zOrder);

        let targetNearestIcon = new cc.Sprite(asset.targetNearest_png);
        targetNearestIcon.attr({
            x: this.targetNearestBtn.width / 2,
            y: this.targetNearestBtn.height / 2,
            scale: 0.8,
        });
        this.targetNearestBtn.addChild(targetNearestIcon);

        this.destroyTowerBtn = new ccui.Button(asset.targetIcon_png);
        this.destroyTowerBtn.setZoomScale(0);
        this.destroyTowerBtn.attr({
            x: tower.x,
            y: tower.y - frameRadius,
        });
        this.destroyTowerBtn.addClickEventListener(() => {
            testnetwork.connector.sendActions([[new DestroyTowerAction(tower.position.x, tower.position.y, gv.gameClient._userId), 0]]);
        });
        this.addChild(this.destroyTowerBtn, zOrder);

        let destroyTowerIcon = new cc.Sprite(asset.panelBtnClose_png);
        destroyTowerIcon.attr({
            x: this.destroyTowerBtn.width / 2,
            y: this.destroyTowerBtn.height * 0.52,
            scale: 0.8,
        });
        this.destroyTowerBtn.addChild(destroyTowerIcon);
    },

    removeCurrentTowerActionsUI: function () {
        if (this.isShowingTowerOptionsUI) {
            this.isShowingTowerOptionsUI = false;

            this.towerShowRangeUI.removeFromParent(true);
            this.circleFrame.removeFromParent(true);
            this.targetFullHPBtn.removeFromParent(true);
            this.targetLowHPBtn.removeFromParent(true);
            this.targetFurthestBtn.removeFromParent(true);
            this.targetNearestBtn.removeFromParent(true);
            this.destroyTowerBtn.removeFromParent(true);
        }
    },

    /*
    * deploy tower cho 2 client
    * */
    activateCard: function (card_type, position, uid) {
        // this.activateCardTower(card_type, position, uid);
        var card = sharePlayerInfo.collection.find(element => element.type === card_type);
        // 999: cell with position
        switch (card.concept) {
            case 'tower':
                this.activateCardTower(card_type, position, uid);
                break;
            case 'monster':
                // this.touchMoveMonster(target);
                break;
            case 'potion':
                this.activateCardPotion(card_type, position, uid);
                break;
            default:
                cc.log('Card concept \"' + card.concept + '\" not found in config.');
                break;
        }
    },

    activateCardTower: function (cardType, position, uid) {
        if (uid === gv.gameClient._userId) {
            this.createObjectByTouch = false
            let loc = convertLogicalPosToIndex(position, 1);

            const playerAMap = this._gameStateManager.playerA._map
            let cellA = playerAMap.getCellAtPosition(position);
            if (!cellA._objectOn && cellA.monsters.length !== 0) {
                return;
            }

            if (this._gameStateManager.playerA._map._mapController.intArray[loc.x][loc.y] < cf.MAP_CELL.TOWER_CHECK_HIGHER) {
                this._gameStateManager.playerA._map._mapController.intArray[loc.x][loc.y] += cf.MAP_CELL.TOWER_ADDITIONAL;
            }
            this._gameStateManager.playerA._map.updatePathForCells()
            this.showPathUI(this._gameStateManager.playerA._map._mapController.listPath, 1)
            this._gameStateManager.playerA._map.deployOrUpgradeTower(cardType, position);
        } else {
            let loc = convertLogicalPosToIndex(position, 2);

            const playerBMap = this._gameStateManager.playerB._map
            let cellB = playerBMap.getCellAtPosition(position);
            if (!cellB._objectOn && cellB.monsters.length !== 0) {
                return;
            }

            if (this._gameStateManager.playerB._map._mapController.intArray[loc.x][loc.y] < cf.MAP_CELL.TOWER_CHECK_HIGHER) {
                this._gameStateManager.playerB._map._mapController.intArray[loc.x][loc.y] += cf.MAP_CELL.TOWER_ADDITIONAL;
            }
            this._gameStateManager.playerB._map.updatePathForCells()
            this.showPathUI(this._gameStateManager.playerB._map._mapController.listPath, 2)
            this._gameStateManager.playerB._map.deployOrUpgradeTower(cardType, position);
        }
    },

    activateCardPotion: function (card_type, position, uid, mapCast) {
        cc.log("deploy spell tai frame ="+ GameStateManagerInstance.frameCount)
        cc.log("vi tri = "+ position.x+'  '+position.y)
        if (uid == gv.gameClient._userId ) {
            if(mapCast == 1) {
                this._gameStateManager.playerA._map.deploySpell(card_type, position, uid, mapCast)
            }else {
                this._gameStateManager.playerB._map.deploySpell(card_type, position, uid, mapCast)
            }
        } else {
            if(mapCast == 1) {
                this._gameStateManager.playerB._map.deploySpell(card_type, position, uid, mapCast)
            }else {
                this._gameStateManager.playerA._map.deploySpell(card_type, position, uid, mapCast)
            }

        }
    },


    /**Convert Screen location in gridXY into logical position (game object position)
     * @param {cc.p} loc
     * @return {Vec2} in-game position*/
    screenLoc2Position: function (loc) {
        return new Vec2((loc.x) * MAP_CONFIG.CELL_WIDTH + MAP_CONFIG.CELL_WIDTH / 2.0, (loc.y - 1) * MAP_CONFIG.CELL_HEIGHT + MAP_CONFIG.CELL_HEIGHT / 2.0)
    },
    nodeHasMonsterAbove: function (loc) {
        var monsterList = GameStateManagerInstance.playerA.getMap().monsters;
        var map = GameStateManagerInstance.playerA.getMap()
        let ret = false

        monsterList.forEach((monster, id, list) => {
            if(monster.isAtLocation(map, loc)){
                ret = true
                return true
            }
        })

        return ret
    },

    showPathUI: function (path, rule) {
        while (this.getChildByName(res.highlightPath + rule) != null) {

            this.removeChild(this.getChildByName(res.highlightPath + rule))
        }
        while (this.getChildByName(res.iconArrow + rule) != null) {
            this.removeChild(this.getChildByName(res.iconArrow + rule))
        }
        var node = new Vec2(0, 0)
        var count = 0
        var delay = 1
        while (node.x != MAP_CONFIG.MAP_WIDTH || node.y != MAP_CONFIG.MAP_HEIGHT) {
            var dir = path[node.x][node.y].sub(node)
            var numDir
            if (dir.x == 1 && dir.y == 0) numDir = 6
            if (dir.x == -1 && dir.y == 0) numDir = 4
            if (dir.x == 0 && dir.y == -1) numDir = 2
            if (dir.x == 0 && dir.y == 1) numDir = 8

            var obj = this.addObjectUI('#battle/UI/ui_transparent_square.png', node.x, node.y, 1, 0, rule)
            this.addChild(obj, 0, res.highlightPath + rule)

            var arrow = this.addObjectUI('#battle/UI/ui_icon_arrow.png', node.x, node.y, 0.5, numDir, rule)
            this.addChild(arrow, 0, res.iconArrow + rule)
            var seq = cc.sequence(cc.DelayTime(0.5), cc.fadeOut(0), cc.DelayTime(delay), cc.fadeIn(0), cc.DelayTime(0.5), cc.fadeOut(0.5));
            arrow.runAction(seq)
            delay += 0.1
            var nodeNext = path[node.x][node.y]
            node.x = nodeNext.x
            node.y = nodeNext.y
            count++
            if (count > 100) break
        }
    },



    initBackGround: function () {
        var backg0 = new cc.Sprite(res.mapbackground00);
        backg0.setAnchorPoint(0, 0)
        backg0.setScaleY(winSize.height / backg0.getContentSize().height)
        backg0.setScaleX(winSize.width / backg0.getContentSize().width)
        this.addChild(backg0);
        this.addObjectBackground(res.mapbackground03, 0, 5.65 / 15, 0.01, -2.35 / 15)
        this.addObjectBackground(res.mapbackground02, 0, 5.65 / 15, 0, 4.55 / 15)
        var backgroundBattle = ccs.load(res.backgroundBattle, "").node;
        this.addChild(backgroundBattle);



        this.addObjectBackground(res.river0, 0.8, 0, 0, 1 / 15)
        this.addObjectBackground(res.river1, 0.8, 0, 0, 1 / 15)
        this.addObjectBackground('#map/cell_start_02.png', 1 / 8, 0, -3 / 8, 1 / 15)
        this.addObjectBackground('#map/cell_start_02.png', 1 / 8, 0, -2 / 8, 1 / 15)
        this.addObjectBackground('#map/cell_start_01.png', 1 / 8, 0, 3 / 8, 1 / 15)
        this.addObjectBackground('#map/cell_start_01.png', 1 / 8, 0, 2 / 8, 1 / 15)

        this.addObjectBackground('#map/map_background_0001.png', 7 / 8, 0, 0, -2 / 15)
        this.addObjectBackground('#map/map_background_0000.png', 7 / 8, 0, 0, 4 / 15)
        this.addObjectBackground('#battle/UI/ui_grid.png', 7 / 8, 0, 0, 4 / 15)
        this.addObjectBackground('#battle/UI/ui_grid.png', 7 / 8, 0, 0, -2 / 15)
        this.addObjectBackground('#map/grid.png', 2 / 8, 0, -2.5 / 8, 0.49 / 15)
        this.addObjectBackground('#map/grid2.png', 2 / 8, 0, 2.5 / 8, 1.51 / 15)

        this.addObjectBackground('#map/map_monster_gate_player.png', 1.5 / 8, 0, -2.1 / 8, 1.1 / 15)
        let gateEnemy = this.addObjectBackground('#map/map_monster_gate_player.png', 1.5 / 8, 0, 2.1 / 8, 1.1 / 15)
        gateEnemy.setFlippedX(true)
        this.addObjectBackground('#map/map_house.png', 1 / 6.5, 0, -3.9 / 8, 6.2 / 15)
        this.addObjectBackground('#map/map_house.png', 1 / 6.5, 0, 3.9 / 8, -3.8 / 15)



        this.addObjectBackground('#map/map_decoration_0002.png', 0, 2.2 / 15, 9 / 15, 1 / 15)
        this.addObjectBackground('#map/map_decoration_0001.png', 0, 2.3 / 15, -8.15 / 15, 1.25 / 15)
        var backgroundBattle2 = ccs.load(res.backgroundBattle2, "").node;
        this.addChild(backgroundBattle2);
        let resultAnimation = new sp.SkeletonAnimation("res/map/fx/as_duoi.json",
            "res/map/fx/as_duoi.atlas")
        resultAnimation.setScale(CELLWIDTH/50)
        resultAnimation.setPosition(winSize.width / 2 + WIDTHSIZE * 6.2 / 8, winSize.height / 2 + HEIGHTSIZE * -4.4 / 15)
        resultAnimation.setAnimation(0, "slots", true)
        this.addChild(resultAnimation)
        let resultAnimation2 = new sp.SkeletonAnimation("res/map/fx/as_duoi.json",
            "res/map/fx/as_duoi.atlas")
        resultAnimation2.setScale(CELLWIDTH/50)
        resultAnimation2.setPosition(winSize.width / 2 + WIDTHSIZE * -1.55 / 8, winSize.height / 2 + HEIGHTSIZE * 5.6/ 15)
        resultAnimation2.setAnimation(0, "slots", true)
        this.addChild(resultAnimation2)
        // this.addObjectBackground(res.grass1, 1 / 11, 0, -8 / 15, -1.5 / 15)
        // this.addObjectBackground(res.tree0, 1 / 4, 0, -8.5 / 15, -0.5 / 15)
        //
        // this.addObjectBackground(res.rock3, 1 / 8, 0, -8.5 / 15, -2 / 15)
        // this.addObjectBackground(res.tree1, 1 / 5, 0, -8.5 / 15, -2.6 / 15)
        //
        //
        // this.addObjectBackground(res.grass1, 1 / 10, 0, 3.5 / 15, -5 / 15)
        // this.addObjectBackground(res.grass1, 1 / 10, 0, -7.5 / 15, -4.5 / 15)
        // this.addObjectBackground(res.tree2, 1 / 5, 0, -8 / 15, -5 / 15)
        // this.addObjectBackground(res.grass1, 1 / 11, 0, 8 / 15, 0.1 / 15)
        // this.addObjectBackground(res.tree1, 1 / 5, 0, 8.5 / 15, -0.5 / 15)
        // this.addObjectBackground(res.grass0, 1 / 10, 0, 8 / 15, -2.8 / 15)
        // this.addObjectBackground(res.rock3, 1 / 6, 0, 9 / 15, -3.3 / 15)
        // this.addObjectBackground(res.tree2, 1 / 5, 0, 8.5 / 15, -1.5 / 15)
        // this.addObjectBackground(res.rock4, 1 / 7, 0, -8.5 / 15, -4 / 15)
        // this.addObjectBackground(res.tree2, 1 / 3.5, 0, 8.8 / 15, -4.5 / 15)
        // this.addObjectBackground(res.tree1, 1 / 3.7, 0, -6 / 15, -5.6 / 15)


        // this.healthA = new ccui.Text(this._gameStateManager.playerA.health, res.font_magic, 30)
        this.addHealthUI()
        this.addTimerUI()
        this.addHouseBoxUI()
        this.addWaveUI()
        this.addDeckUI()
        this.addInforBoxUI()
    },

    addObjectBackground: function (res, scaleW, scaleH, positionX, positionY) {
        var obj = new cc.Sprite(res);
        if (scaleW > 0) {
            obj.setScale(WIDTHSIZE / obj.getContentSize().width * scaleW)
        } else if (scaleH > 0) {
            obj.setScale(HEIGHTSIZE / obj.getContentSize().height * scaleH)
        }
        obj.setPosition(winSize.width / 2 + WIDTHSIZE * positionX, winSize.height / 2 + HEIGHTSIZE * positionY)
        this.addChild(obj, 0, res);
        return obj
    },

    addTimerUI: function () {
        this.addObjectBackground('#battle/battle_timer_background.png', 0.9 / 8, 0, 0, 1 / 15)
        // this.addObjectBackground(res.timer2,0.8/8,0,0,1/15)
        var timeBar = cc.ProgressTimer.create(cc.Sprite.create(res.timer_png));
        timeBar.setType(cc.ProgressTimer.TYPE_RADIAL);
        timeBar.setBarChangeRate(cc.p(1, 0));
        timeBar.setMidpoint(cc.p(0.5, 0.5))
        timeBar.setScale(WIDTHSIZE / timeBar.getContentSize().width * 0.9 / 8)
        timeBar.setPosition(winSize.width / 2, winSize.height / 2 + HEIGHTSIZE * 1 / 15);
        this.addChild(timeBar, 0, 'timeBar');



        var time3 = this.addObjectBackground(res.timerBorder_png, 0.9 / 8, 0, 0, 1 / 15)
        time3.visible = false
        var numTime = new ccui.Text(GAME_CONFIG.TIME_WAVE, res.font_magic, 24)
        numTime.setPosition(winSize.width / 2, winSize.height / 2 + HEIGHTSIZE * 1 / 15)
        var whiteColor = new cc.Color(255, 255, 255, 255);
        numTime.setTextColor(whiteColor)
        numTime.enableShadow()
        this.addChild(numTime, 0, 'time')
        var touchLayer = new ccui.Button(res.timerBorder_png)
        touchLayer.setScale(WIDTHSIZE / touchLayer.getContentSize().width * 0.9/8);
        touchLayer.setPosition(winSize.width / 2, winSize.height / 2 + HEIGHTSIZE * 1 / 15)
        touchLayer.opacity = 0
        touchLayer.addClickEventListener(()=>{
            if (GameStateManagerInstance.canTouchNewWave) {
                // GameStateManagerInstance._timer.resetTime(GAME_CONFIG.TIME_WAVE)
                this.getNewWave()
                testnetwork.connector.sendActions([[new NextWaveAction(this._gameStateManager.waveCount), 0]]);
                cc.log('touch1111111111111111111111')
            }

        })
        this.addChild(touchLayer)
    },
    addHealthUI: function () {
        var healthA = new ccui.Text(this._gameStateManager.playerA.health, res.font_magic, 30)
        healthA.setScale(WIDTHSIZE / healthA.getContentSize().height * 0.8 / 15)
        healthA.setPosition(winSize.width / 2 + WIDTHSIZE * 3.9 / 8, winSize.height / 2 + HEIGHTSIZE * -4.25 / 15)
        var blueColor = new cc.Color(34, 119, 234, 255);
        healthA.setTextColor(blueColor)
        healthA.enableShadow()
        this.addChild(healthA, 0, 'healthA1')
        var healthB = new ccui.Text(this._gameStateManager.playerB.health, res.font_magic, 30)
        healthB.setScale(WIDTHSIZE / healthB.getContentSize().height * 0.8 / 15)
        healthB.setPosition(winSize.width / 2 + WIDTHSIZE * -3.9 / 8, winSize.height / 2 + HEIGHTSIZE * 5.7 / 15)
        var redColor = new cc.Color(242, 61, 65, 255);
        healthB.enableShadow()
        healthB.setTextColor(redColor)
        this.addChild(healthB, 0, 'healthB1')
    },
    addHouseBoxUI: function () {
        var houseBox = new cc.Sprite(res.house_box)
        houseBox.setScale(WIDTHSIZE / houseBox.getContentSize().width * 2 / 8)
        houseBox.setPosition(winSize.width + CELLWIDTH * 0.32, winSize.height / 2 + CELLWIDTH)

        var houseIcon = new cc.Sprite(res.house_icon)
        houseIcon.setScale(WIDTHSIZE / houseIcon.getContentSize().height * 0.75 / 8)
        houseIcon.setPosition(winSize.width + CELLWIDTH * -0.35, winSize.height / 2 + CELLWIDTH * 1.02)

        var healthA = new ccui.Text(this._gameStateManager.playerA.health, res.font_magic, 30)
        healthA.setScale(WIDTHSIZE / healthA.getContentSize().height * 0.9 / 15)
        healthA.setPosition(winSize.width + CELLWIDTH * -0.35, winSize.height / 2 + CELLWIDTH * 0.4)
        var blueColor = new cc.Color(34, 119, 234, 255);
        healthA.enableShadow()
        healthA.setTextColor(blueColor)

        var healthB = new ccui.Text(this._gameStateManager.playerB.health, res.font_magic, 30)
        healthB.setScale(WIDTHSIZE / healthB.getContentSize().height * 0.9 / 15)
        healthB.setPosition(winSize.width + CELLWIDTH * -0.35, winSize.height / 2 + CELLWIDTH * 1.62)
        var redColor = new cc.Color(242, 61, 65, 255);
        healthB.enableShadow()
        healthB.setTextColor(redColor)

        this.addChild(houseBox)
        this.addChild(houseIcon)
        this.addChild(healthA, 0, 'healthA2')
        this.addChild(healthB, 0, 'healthB2')


    },
    addWaveUI: function () {
        var waveBox = new cc.Sprite(res.house_box)
        waveBox.setScaleX(CELLWIDTH / waveBox.getContentSize().width * 1.5)
        waveBox.setScaleY(CELLWIDTH / waveBox.getContentSize().height * 0.85)
        waveBox.setPosition(CELLWIDTH * 0.25, winSize.height / 2 + CELLWIDTH * 1.1)

        var lbWave = new ccui.Text('Lượt:', res.font_magic, 30)
        lbWave.setScale(CELLWIDTH / lbWave.getContentSize().height * 0.25)
        lbWave.setPosition(CELLWIDTH * 0.4, winSize.height / 2 + CELLWIDTH * 1.3)
        var blueColor2 = new cc.Color(173, 194, 228, 255);
        lbWave.enableShadow()
        lbWave.setTextColor(blueColor2)

        var strNumWave = this._gameStateManager.curWave + '/' + GAME_CONFIG.MAX_WAVE
        var lbNumWave = new ccui.Text(strNumWave, res.font_magic, 30)
        lbNumWave.setScale(CELLWIDTH / lbNumWave.getContentSize().height * 0.35)
        lbNumWave.setPosition(CELLWIDTH * 0.48, winSize.height / 2 + CELLWIDTH * 0.95)
        var blueColor = new cc.Color(255, 255, 248, 255);
        lbNumWave.enableShadow()
        lbNumWave.setTextColor(blueColor)

        this.addChild(waveBox)
        this.addChild(lbWave)
        this.addChild(lbNumWave, 0, 'lbNumWave')

    },
    updateHealthUI: function (dt) {
        if (this.getChildByName('healthA1') != null) {
            this.getChildByName('healthA1').setString(this._gameStateManager.playerA.health)
        }
        if (this.getChildByName('healthA2') != null) {
            this.getChildByName('healthA2').setString(this._gameStateManager.playerA.health)
        }
        if (this.getChildByName('healthB1') != null) {
            this.getChildByName('healthB1').setString(this._gameStateManager.playerB.health)
        }
        if (this.getChildByName('healthB2') != null) {
            this.getChildByName('healthB2').setString(this._gameStateManager.playerB.health)
        }
    },

    addEnergyBarUI:function (){
        var energyBar = ccs.load(res.energyBar, "").node;
        energyBar.setPosition(winSize.width/2+CELLWIDTH*0.5, winSize.height/2- HEIGHTSIZE/2+CELLWIDTH*0.3)
        this.addChild(energyBar,0,'energyBar')

        var energy = new cc.Sprite(res.energyIcon)
        var whiteColor = new cc.Color(255,255,255,255);
        var blackColor = new cc.Color(0,0,0,255);
        var lbNumEnergy = new ccui.Text(this._gameStateManager.playerA.energy, res.font_magic, 40)
        lbNumEnergy.setPosition(energy.getContentSize().width*0.5,energy.getContentSize().height/2)
        lbNumEnergy.enableShadow()
        lbNumEnergy.setTextColor(whiteColor)
        lbNumEnergy.enableOutline(blackColor,1)
        energy.addChild(lbNumEnergy,0,'numEnergyBar')
        energy.setScale(CELLWIDTH/energy.getContentSize().height*0.58)
        energy.setPosition(winSize.width/2- WIDTHSIZE/2+CELLWIDTH*1.32, winSize.height/2- HEIGHTSIZE/2+CELLWIDTH*0.35)
        this.addChild(energy,0,'iconEnergyBar')


    },

    addInforBoxUI: function () {
        var OpponentInfor = ccs.load(res.scene, "").node;
        OpponentInfor.getChildByName('name').setString(shareOpponentInfo.name)
        this.addChild(OpponentInfor);

    },

    addDeckUI:function (){
        this.addObjectBackground(res.deck,0,2.65/15,0,-6.15/15)
        this.addListCardUI()
        this.addEnergyBarUI()
        var btnChat = ccui.Button('res/battle/battle_btn_chat.png');
        btnChat.setScale(CELLWIDTH/btnChat.getNormalTextureSize().width*0.85)
        btnChat.setPosition(winSize.width/2-WIDTHSIZE/2+CELLWIDTH*0.53, winSize.height /2-HEIGHTSIZE/2+CELLWIDTH*2.5)
        this.addChild(btnChat,0);

        var lbWave = new ccui.Text('Tiếp theo:', res.font_magic, 30)
        lbWave.setScale(CELLWIDTH/lbWave.getContentSize().height*0.21)
        lbWave.setPosition(winSize.width/2-WIDTHSIZE/2+CELLWIDTH*0.53, winSize.height /2-HEIGHTSIZE/2+CELLWIDTH*1.8)
        var whiteColor = new cc.Color(245,241,220,255);
        var blackColor = new cc.Color(0,0,0,255);
        lbWave.setTextColor(whiteColor)
        lbWave.enableShadow()
        lbWave.enableOutline(blackColor,1)
        this.addChild(lbWave,0);

    },

    addListCardUI: function () {
        let move = false;
        var listener1 = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: (touch, event) => {
                var target = event.getCurrentTarget();
                var locationInNode = target.convertToNodeSpace(touch.getLocation());
                var s = target.getContentSize();
                var rect = cc.rect(0, 0, s.width, s.height);
                return !!cc.rectContainsPoint(rect, locationInNode);
            },

            /** chỉ kéo thả đc khi ko có thẻ nào đang được chọn
             * @return */
            onTouchMoved: (touch, event) => {
                let target = event.getCurrentTarget();
                if(this.cardTouchSlot === -1) {
                    move = true;
                    this.touchMoveCard(target,touch.getLocation());
                }
            },

            onTouchEnded: (touch, event) => {
                let target = event.getCurrentTarget();
                if(move && this.previewObject != undefined){
                    move = false;
                    this.previewObject.removeFromParent(true);
                    this.previewObject = undefined
                    if(GameStateManagerInstance.playerA.energy >= target.energy){
                        this.activeCard(target, touch.getLocation())
                    } else {
                        Utils.addToastToRunningScene('Không đủ năng lượng!');
                        this.resetCardTouchState()
                    }
                }else{
                    if (target.getParent().cardTouchSlot !== target.numSlot) {
                        this.resetCardTouchState()
                        target.y += CELLWIDTH * 0.5
                        target.onTouch = true
                        target.getParent().cardTouchSlot = target.numSlot
                        target.setCardUpUI()

                        target.getParent().getChildByName('btnRemoveCard'+target.getParent().cardTouchSlot).visible = true
                        target.getParent().getChildByName('cancelCard'+target.getParent().cardTouchSlot).visible = true
                    }else if(target.onTouch == true){
                        target.y -= CELLWIDTH * 0.5
                        target.onTouch = false

                        target.getParent().getChildByName('btnRemoveCard'+target.getParent().cardTouchSlot).visible = false
                        target.getParent().getChildByName('cancelCard'+target.getParent().cardTouchSlot).visible = false
                        target.getParent().cardTouchSlot = -1

                        target.setCardDownUI()

                    }
                }
                // MW.DELAY_TOUCH = true;
                // this.runAction(cc.sequence(cc.delayTime(0.25),cc.callFunc(()=> this.readyTouch(), this)));
                // if (this.previewObject !== undefined) {
                //     let target = event.getCurrentTarget();
                //     this.cardTouchSlot = target.numSlot
                //     let rule = getRule(target);
                //     this.previewObject.removeFromParent(true);
                //     this.previewObject = undefined;
                //     let pos = touch.getLocation();
                //     let cor = convertPosToIndex(pos, rule);
                //     if(GameStateManagerInstance.playerA.energy >= target.energy){
                //         if (this.towerUIMap[cor.x] !== undefined && this.towerUIMap[cor.x][cor.y] !== undefined) {
                //             // fixme khác loại trụ?
                //             if (this.towerUIMap[cor.x][cor.y].evolution >= 2) {
                //                 Utils.addToastToRunningScene('Đã đạt cấp tiến hóa tối đa!');
                //                 this.resetCardTouchState()
                //             } else {
                //                 this.towerUIMap[cor.x][cor.y].evolute();
                //                 this.updateCardSlot(target.energy)
                //             }
                //         }
                //         else if (isPosInMap(pos, rule) && GameStateManagerInstance.playerA.getMap()._mapController.intArray[cor.x][cor.y] <= 0) {
                //             MW.MOUSE = pos;
                //             this.createObjectByTouch = true;
                //
                //         } else {
                //             this.resetCardTouchState()
                //             return;
                //         }
                //     }else{
                //         Utils.addToastToRunningScene('Không đủ năng lượng!');
                //         this.resetCardTouchState()
                //     }
                //
                // }else if (target.getParent() != null) {
                //
                //     if (target.getParent().cardTouchSlot !== target.numSlot) {
                //         target.getParent().resetCardTouchState()
                //         target.x += 0
                //         target.y += CELLWIDTH * 0.5
                //         target.onTouch = true
                //         target.getParent().cardTouchSlot = target.numSlot
                //         target.setCardUpUI()
                //
                //         target.getParent().getChildByName('btnRemoveCard'+target.getParent().cardTouchSlot).visible = true
                //         target.getParent().getChildByName('cancelCard'+target.getParent().cardTouchSlot).visible = true
                //     }else if(target.onTouch == true){
                //         target.x += 0
                //         target.y -= CELLWIDTH * 0.5
                //         target.onTouch = false
                //
                //         target.getParent().getChildByName('btnRemoveCard'+target.getParent().cardTouchSlot).visible = false
                //         target.getParent().getChildByName('cancelCard'+target.getParent().cardTouchSlot).visible = false
                //         target.getParent().cardTouchSlot = -1
                //
                //         target.setCardDownUI()
                //
                //     }
                // }
            }
        });
        for (let i = 1; i <= GAME_CONFIG.NUM_CARD_PLAYABLE; i++) {
            var cardBox = new cc.Sprite('res/battle/battle_card_box.png')
            cardBox.setScale(CELLWIDTH / cardBox.getContentSize().width * 1.43)
            cardBox.setPosition(winSize.width/2-WIDTHSIZE/2+CELLWIDTH*2.1+(i-1)*CELLWIDTH*1.7, winSize.height /2-HEIGHTSIZE/2+CELLWIDTH*1.55)
            this.addChild(cardBox)
            var arr = this.cardPlayable
            var card = new MCard(arr[i-1])
            card.setScale(CELLWIDTH / card.getContentSize().width * 1.15)
            card.setPosition(winSize.width/2-WIDTHSIZE/2+CELLWIDTH*2.1+(i-1)*CELLWIDTH*1.7, winSize.height /2-HEIGHTSIZE/2+CELLWIDTH*1.55)
            this.addChild(card,0,'cardPlayable'+i)
            card.numSlot = i
            this.listCard.push(card)
            cc.eventManager.addListener(listener1.clone(), card);
        }
        for (let i = 1; i <= GAME_CONFIG.NUM_CARD_PLAYABLE; i++) {

            var btnRemoveCard =new ccui.Button('res/battle/battle_btn_destroy.png');
            btnRemoveCard.setScale(CELLWIDTH / btnRemoveCard.getContentSize().width * 1.4)
            btnRemoveCard.setPosition(winSize.width/2-WIDTHSIZE/2+CELLWIDTH*2.1+(i-1)*CELLWIDTH*1.7, winSize.height /2-HEIGHTSIZE/2+CELLWIDTH*0.8)
            btnRemoveCard.visible = false

            btnRemoveCard.addClickEventListener(()=> {
                if(this.cardTouchSlot >= 0) {
                    if (GameStateManagerInstance.playerA.energy >= GAME_CONFIG.ENERGY_DESTROY_CARD) {
                        this.updateCardSlot(this.cardTouchSlot, GAME_CONFIG.ENERGY_DESTROY_CARD);
                    } else {
                        Utils.addToastToRunningScene('Không đủ năng lượng!');
                    }
                }
            });
            this.addChild(btnRemoveCard, 0 , 'btnRemoveCard'+i);
            var cancelUI = ccs.load(res.cancelCard, "").node;
            cancelUI.setPosition(winSize.width/2-WIDTHSIZE/2+CELLWIDTH*2.1+(i-1)*CELLWIDTH*1.7, winSize.height /2-HEIGHTSIZE/2+CELLWIDTH*0.81)
            cancelUI.visible = false
            this.addChild(cancelUI, 0 , 'cancelCard'+i)

        }
        var card5 = new MCard(this.cardInQueue[0])
        card5.setScale(CELLWIDTH / card5.getContentSize().width * 0.8)
        card5.setPosition(winSize.width/2-WIDTHSIZE/2+CELLWIDTH*0.55, winSize.height /2-HEIGHTSIZE/2+CELLWIDTH*0.9)
        card5.getChildByName('energy').visible = false
        this.addChild(card5,0,'cardNext')
    },

    /** UI khi kéo thả card
     * @param MCard, posUI
     * @return */
    touchMoveCard: function (target, posUI) {
        switch (target.concept) {
            case 'tower':
                this.touchMoveTower(target, posUI);
                break;
            case 'monster':
                this.touchMoveMonster(target);
                break;
            case 'potion':
                this.touchMovePotion(target,posUI);
                break;
            default:
                cc.log('Card concept \"' + target.concept + '\" not found in config.');
                break;
        }
    },
    touchMoveTower: function (target, posUI) {
        let rule = getRule(target);
        if (this.previewObject === undefined) {
            this.previewObject = this.generatePreviewObject(target);
            this.addChild(this.previewObject);
        }
        this.previewObject.setPosition(getMiddleOfCell(posUI, rule));
        if (isPosInMap(posUI, rule)) {
            this.updateRangeOfPreviewObject(convertPosToIndex(posUI, rule), rule);
        }
        this.previewObject.visible = isPosInMap(this.previewObject, rule);
    },

    touchMoveMonster: function (target) {

    },

    touchMovePotion: function (target,posUI) {
        let rule = getRule(target);
        if (this.previewObject === undefined) {
            this.previewObject = this.generatePreviewPotion(target);
            this.addChild(this.previewObject);
        }
        this.previewObject.setPosition(posUI);
        // this.previewObject.visible = isPosInMap(this.previewObject, rule);
    },


    /** thả 1 card khi đã check có đủ NL rồi
     * @param target
     * @param posUI
     * @return
     */
    activeCard: function (target, posUI) {
        cc.log(target.concept)
        switch (target.concept) {
            case 'tower':
                this.activeCardTower(target, posUI);
                break;
            case 'monster':
                this.activeCardMonster(target, posUI);
                break;
            case 'potion':
                this.activeCardPotion(target, posUI);
                break;
            default:
                cc.log('Card concept \"' + target.concept + '\" not found in config.');
                break;
        }
    },

    /** check đường đi,... xem có đặt trụ được không
     * @param target
     * @param posUI
     * @return {void}
     */
    activeCardTower: function (target, posUI) {
        let canPutTower = true;
        if (isPosInMap(posUI, 1)) {
            let intIndex = convertPosToIndex(posUI, 1);
            if (GameStateManagerInstance.playerA.getMap()._mapController.intArray[intIndex.x][intIndex.y] <= cf.MAP_CELL.BUFF_OR_NORMAL_CHECK_NOT_HIGHER || GameStateManagerInstance.playerA.getMap()._mapController.intArray[intIndex.x][intIndex.y] > cf.MAP_CELL.TOWER_CHECK_HIGHER) {
                let tmp = GameStateManagerInstance.playerA._map._mapController.intArray[intIndex.x][intIndex.y];
                if (GameStateManagerInstance.playerA.getMap()._mapController.intArray[intIndex.x][intIndex.y] < cf.MAP_CELL.TOWER_CHECK_HIGHER) {
                    GameStateManagerInstance.playerA._map._mapController.intArray[intIndex.x][intIndex.y] += cf.MAP_CELL.TOWER_ADDITIONAL;
                }
                if (!this.nodeHasMonsterAbove(intIndex) && GameStateManagerInstance.playerA._map._mapController.isExistPath()) {
                    let posLogic = this.screenLoc2Position(intIndex);
                    if (GameStateManagerInstance.playerA.getMap().checkUpgradableTower(target.type, posLogic)) {
                        let loc = convertLogicalPosToIndex(posLogic, 1);
                        this.addTimerBeforeCreateTower(convertIndexToPos(loc.x, loc.y, 1));
                        testnetwork.connector.sendActions([[new ActivateCardAction(target.type, posLogic.x, posLogic.y,
                            gv.gameClient._userId), GAME_CONFIG.TICK_FOR_DELAY_TOWER]]);
                        this.updateCardSlot(target.numSlot, target.energy);
                    }
                } else {
                    GameStateManagerInstance.playerA._map._mapController.intArray[intIndex.x][intIndex.y] = tmp;
                    canPutTower = false;
                }
            } else {
                canPutTower = false;
            }
            if (!canPutTower) {
                Utils.addToastToRunningScene('Không đặt được chỗ này!');
            }
        }
        this.resetCardTouchState();
    },

    activeCardMonster: function (target, posUI) {

    },

    activeCardPotion: function (target, posUI) {

        let canActive = false;
        let rule = getRule(target);
        if( rule == 3){
            canActive = isPosInMap(posUI, 1) || isPosInMap(posUI, 2);
        }else {
            canActive = isPosInMap(posUI, rule);
        }
        if(canActive) {
            let mapCastAt = getMapCastAt(posUI) ;
            let indexFloat = convertPosUIToLocLogic(posUI, mapCastAt)
            let posLogic = this.screenLoc2Position(indexFloat)
            this.addSpellUIBeforeExplose(target.type, posUI)
            testnetwork.connector.sendActions([[new ActivateSpellAction(target.type, posLogic.x, posLogic.y,
                gv.gameClient._userId, mapCastAt),0]]);
            this.updateCardSlot(target.numSlot, target.energy);
        }

        // if(isPosInMap(posUI, 1) || isPosInMap(posUI, 2) ) {
        //
        //     var indexFloat = convertPosUIToLocLogic(posUI)
        //     var posLogic = this.screenLoc2Position(indexFloat)
        //     // this._gameStateManager.playerA._map.deploySpell(target.type, posLogic)
        //     // var a = new SpellFallUI(target.type, posUI)
        //     // this.addChild(a);
        //     testnetwork.connector.sendActions([[new ActivateSpellAction(target.type, posLogic.x, posLogic.y,
        //         gv.gameClient._userId),0]]);
        //     this.updateCardSlot(target.numSlot, target.energy);
        // }
    },

    addSpellUIBeforeExplose: function (cardType, posUI) {
        let spell;
        switch (cardType) {
            case 0:
                spell = new SpellFallUI( posUI, 'effect_atk_fire', 'animation_fireball', GameStateManagerInstance.getSpellConfig(0));
                break;
            case 1:
                spell = new SpellFallUI(posUI, 'effect_atk_ice', 'animation_ice_ball', GameStateManagerInstance.getSpellConfig(1));
                break;
            case 2:
                spell = new SpellFieldUI(posUI, 'effect_buff_heal', 4, GameStateManagerInstance.getSpellConfig(2)[0]);
                break;
            case 3:
                spell = new SpellFieldUI(posUI, 'effect_buff_speed', (GameStateManagerInstance.getSpellConfig(3)[1]/1000), GameStateManagerInstance.getSpellConfig(3)[0]);
                break;
            default:
                spell = new SpellFallUI( posUI, 'effect_atk_fire', 'animation_fireball', GameStateManagerInstance.getSpellConfig(0));
                break;
        }
        this.addChild(spell);
    },

    generatePreviewPotion: function (target) {
        let card = new Card(target.type, 1, 0);
        // let radius = card.spellInfo.radius;
        let radius =0.8
        let rangePreview = cc.Sprite('res/battle/battle_potion_range.png');
        rangePreview.setScale(2.3*CELLWIDTH/rangePreview.getContentSize().width*radius)

        return rangePreview;
    },


    generatePreviewObject: function (target) {
        let towerPreview = new TowerUI(target, 0);
        let card = new Card(target.type, 1, 0);
        towerPreview.setScale(cf.TOWER_SCALE[card.id - 100]);
        towerPreview.range = card.towerInfo.stat[(card.evolution + 1).toString()].range;
        towerPreview.rangePreview = cc.Sprite(asset.towerRange_png);
        towerPreview.rangePreview.attr({
            x: towerPreview.width / 2,
            y: towerPreview.height / 2,
            scale: towerPreview.range * CELLWIDTH * 2 / towerPreview.rangePreview.height / towerPreview.scale,
        });
        towerPreview.addChild(towerPreview.rangePreview);

        return towerPreview;
    },

    updateRangeOfPreviewObject: function (index, rule) {
        if (this.previewObject === undefined || rule === 2) {
            return;
        }
        if (rule === 1) {
            if (this._gameStateManager.playerA._map._mapController.intArray[index.x][index.y] === cf.MAP_CELL.BUFF_RANGE || this._gameStateManager.playerA._map._mapController.intArray[index.x][index.y] === cf.MAP_CELL.BUFF_RANGE + cf.MAP_CELL.TOWER_ADDITIONAL) {
                this.previewObject.rangePreview.setScale(this.previewObject.range * CELLWIDTH * 2 / this.previewObject.rangePreview.height / this.previewObject.scale * cf.MAP_BUFF.RANGE);
            } else {
                this.previewObject.rangePreview.setScale(this.previewObject.range * CELLWIDTH * 2 / this.previewObject.rangePreview.height / this.previewObject.scale);
            }
        }
    },

    generateTowerUI: function (type, evolution, corX, corY) {
        let towerUI = new TowerUI(type, evolution);
        towerUI.setScale(CELLWIDTH * 4 / towerUI.width);
        let pos = this._gameStateManager.playerA.convertCordinateToPos(corX, corY);
        towerUI.setPosition(pos);
        return towerUI;
    },


    /** Trừ energy và update thẻ mới trong queue
     * @param slot (1,2,3,4), numEnergy
     * @return */
    updateCardSlot: function (numSlot, numEnergy) {
        this._gameStateManager.playerA.energy -= numEnergy
        // this._gameStateManager.playerA.energy -= 0
        this.cardInQueue.push(this.listCard[numSlot - 1].type)
        this.listCard[numSlot - 1].updateNewCard(this.cardInQueue[0])
        this.cardInQueue.shift()
        this.getChildByName('cardNext').updateNewCard(this.cardInQueue[0])
        this.cardPlayable[numSlot - 1] = this.listCard[numSlot - 1].type

        this.resetCardTouchState()



    },

    /*
    * reset về không chọn thẻ nào cả
    * */
    resetCardTouchState: function () {
        for (var i = 1; i <= GAME_CONFIG.NUM_CARD_PLAYABLE; i++) {
            var card = this.getChildByName('cardPlayable' + i)
            if (card.onTouch == true) {
                card.x += 0
                card.y -= CELLWIDTH * 0.5
                card.onTouch = false
                card.setCardDownUI()
                this.getChildByName('btnRemoveCard' + this.cardTouchSlot).visible = false
                this.getChildByName('cancelCard' + this.cardTouchSlot).visible = false
            }
        }
        this.cardTouchSlot = -1
    },



    updateEnergyUI: function (dt) {
        if (this.getChildByName('iconEnergyBar') != null) {
            this.getChildByName('iconEnergyBar').getChildByName('numEnergyBar').setString(this._gameStateManager.playerA.energy);
        }

        if (this.getChildByName('energyBar') != null) {
            var percen = GameStateManagerInstance.playerA.energy/GAME_CONFIG.MAX_ENERGY*100
            if(percen > 100) {
                percen = 100
            }
            this.getChildByName('energyBar').getChildByName('loading').setPercent(percen);

        }
    },

    updateTimer: function (dt) {
        // this._gameStateManager._timer.updateRealTime(dt)
        var time = Math.floor(this._gameStateManager._timer.curTime + 0.5)
        this.getChildByName('time').setString(time)
        var percen = 100 - this._gameStateManager._timer.curTime / GAME_CONFIG.TIME_WAVE * 100
        this.getChildByName('timeBar').setPercentage(percen)
        if (this._gameStateManager.canTouchNewWave) {
            this.getChildByName(res.timerBorder_png).visible = true
        }
    },

    /*
        * reset trạng thái wave mới
        * */
    getNewWave: function () {
        this.getChildByName(res.timerBorder_png).visible = false
        var strNumWave = this._gameStateManager.curWave + '/' + GAME_CONFIG.MAX_WAVE
        this.getChildByName('lbNumWave').setString(strNumWave)
        // this._gameStateManager._timer.resetTime(GAME_CONFIG.TIME_WAVE)
        //this.callMonster()
    },

    /*callMonster: function () {
        var monster = this._gameStateManager.playerA._map.addMonster()
        this.addChild(monster, 2000)
        var monster2 = this._gameStateManager.playerB._map.addMonster()
        this.addChild(monster2, 2000)
    },

    addMonsterToBoth: function () {
        this.getNewWave()
        const monster = this._gameStateManager.playerA._map.addMonster()
        this.addChild(monster, 2000)
        const monster2 = this._gameStateManager.playerB._map.addMonster()
        this.addChild(monster2, 2000)
    },*/

    activateNextWave: function (monstersId) {
        cc.log("next wave tai frame ="+ GameStateManagerInstance.frameCount)
        this._gameStateManager.updateStateNewWave()
        this.getNewWave()
        this._gameStateManager.activateNextWave(this, monstersId)
    },

    initCellSlot: function (mapArray, rule) {
        for (let i = 0; i < MAP_CONFIG.MAP_WIDTH + 1; i++) {
            for (let j = 0; j < MAP_CONFIG.MAP_HEIGHT + 1; j++) {
                let obj;
                switch (mapArray[i][j]) {
                    case cf.MAP_CELL.BUFF_DAMAGE:
                        obj = this.addObjectUI('#battle/battle_item_damage.png', i, j, 1, 0, rule)
                        this.addChild(obj, 0, res.buffD + rule)
                        break;
                    case cf.MAP_CELL.BUFF_ATTACK_SPEED:
                        obj = this.addObjectUI('#battle/battle_item_attack_speed.png', i, j, 1, 0, rule)
                        this.addChild(obj, 0, res.buffS + rule)
                        break;
                    case cf.MAP_CELL.BUFF_RANGE:
                        obj = this.addObjectUI('#battle/battle_item_range.png', i, j, 1, 0, rule)
                        this.addChild(obj, 0, res.buffR + rule)
                        break;
                    case cf.MAP_CELL.TREE:
                        obj = this.addObjectUI('#map/map_forest_obstacle_1.png', i, j, 0.85, 0, rule)
                        this.addChild(obj, 0, res.treeUI + rule)
                        break;
                    case cf.MAP_CELL.HOLE:
                        obj = this.addObjectUI('#battle/UI/ui_hole.png', i, j, 0.85, 0, rule)
                        this.addChild(obj, 0, res.hole + rule)
                        break;
                    default:
                        continue;
                }
            }
        }
    },

    //scale * cellwidth
    addObjectUI: function (_res, corX, corY, _scale, direc, rule) {
        var convert
        var object = new cc.Sprite(_res)
        object.setScale(_scale * CELLWIDTH / object.getContentSize().height)
        var pos = convertIndexToPos(corX, corY, rule)
        object.setPosition(pos)
        if (direc == 8) {
            object.setRotation(90)
        }
        if (direc == 4) {
            object.setRotation(180)
        }
        if (direc == 2) {
            object.setRotation(270)
        }
        if (_res == res.iconArrow && rule == 2) object.setRotation(object.getRotation() + 180)
        return object
    },

    getEnergyUI: function (pos, numEnergy) {
        var energy = new cc.Sprite(res.energyIcon)
        energy.setPosition(pos.x, pos.y)

        var lbAddIcon = new ccui.Text('+', res.font_magic, 70)
        lbAddIcon.setPosition(-energy.getContentSize().width * 1 / 3, energy.getContentSize().height / 2)
        var blueColor2 = new cc.Color(255, 255, 255, 255);
        lbAddIcon.enableShadow()
        lbAddIcon.setTextColor(blueColor2)

        var lbNumEnergy = new ccui.Text(numEnergy, res.font_magic, 70)
        lbNumEnergy.setPosition(energy.getContentSize().width * 1.3, energy.getContentSize().height / 2)
        lbNumEnergy.enableShadow()
        lbNumEnergy.setTextColor(blueColor2)

        energy.addChild(lbAddIcon)
        energy.addChild(lbNumEnergy)
        energy.setScale(CELLWIDTH / energy.getContentSize().height * 0.3)
        energy.setCascadeOpacityEnabled(true)
        var seq1 = cc.MoveTo(0.3, cc.p(pos.x, pos.y + CELLWIDTH * 0.5))
        var seq2 = cc.fadeOut(0.5)
        var seq3 = cc.CallFunc(() => this.removeChild(energy), this)
        var seq = cc.sequence(seq1, cc.delayTime(0.7), seq2, seq3)
        energy.runAction(seq)
        energy.setLocalZOrder(GAME_CONFIG.RENDER_START_Z_ORDER_VALUE + winSize.height)
        this.addChild(energy)

    },

    checkEndBattle: function () {
        if (this._gameStateManager.winner == 1) {
            this.blockEndBattleLayer()
            this.showResultBattleUI('win')
        }
        if (this._gameStateManager.winner == 2) {
            this.blockEndBattleLayer()
            this.showResultBattleUI('lose')
        }
        if (this._gameStateManager.winner == 0) {
            this.blockEndBattleLayer()
            this.showResultBattleUI('draw')
        }

    },

    blockEndBattleLayer: function () {
        this.unscheduleAllCallbacks()
        var blockLayer = new cc.Sprite(res.house_box)
        blockLayer.setScaleX(1.3 * winSize.width / blockLayer.getContentSize().width)
        blockLayer.setScaleY(1.3 * winSize.height / blockLayer.getContentSize().height)
        blockLayer.setPosition(winSize.width / 2, winSize.height / 2)
        this.addChild(blockLayer, 4000)
        blockLayer.setOpacity(0)
        let seq = cc.sequence(cc.delayTime(0.5), cc.fadeIn(0.15))
        blockLayer.runAction(seq)
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function (touch, event) {

                return true;

            }
        }, blockLayer);

    },
    showResultBattleUI: function (resultString) {

        var end = new EndBattleUI(resultString,15)
        this.addChild(end, 4000)
    },

    backToLobby:function () {
        fr.view(LobbyScene)
        // let lobbyScene = new LobbyScene();
        // cc.director.runScene(new cc.TransitionFade(0.5, lobbyScene));

    },


    update: function (dt) {
        this.updateTimer(dt)
        var children = this.children;
        // for (i in children) {
        //     children[i].update(dt);
        // }
        this._gameStateManager.update(dt)

        this.updateHealthUI(dt)
        this.updateEnergyUI(dt)
        this.checkEndBattle()


    },
    addTimerBeforeCreateTower: function (pos) {
        let timerBackground = new cc.Sprite(res.timerBackground_png);
        timerBackground.setPosition(pos);
        timerBackground.setScale(WIDTHSIZE / timerBackground.getContentSize().width * 0.08);
        this.addChild(timerBackground, GAME_CONFIG.RENDER_START_Z_ORDER_VALUE + winSize.height + cf.TIMER_LOCAL_Z_ORDER);

        let timerBorder = new cc.Sprite(res.timerBorder_png);
        timerBorder.setPosition(pos);
        timerBorder.setScale(timerBackground.scale);
        this.addChild(timerBorder, GAME_CONFIG.RENDER_START_Z_ORDER_VALUE + winSize.height + cf.TIMER_LOCAL_Z_ORDER);

        let timerTower = cc.ProgressTimer.create(cc.Sprite.create(res.timer_png));
        timerTower.setType(cc.ProgressTimer.TYPE_RADIAL);
        timerTower.setBarChangeRate(cc.p(1, 0));
        timerTower.setMidpoint(cc.p(0.5, 0.5));
        timerTower.setPercentage(100);
        timerTower.setPosition(pos);
        timerTower.setScale(WIDTHSIZE / timerTower.getContentSize().width * 0.08);
        this.addChild(timerTower, GAME_CONFIG.RENDER_START_Z_ORDER_VALUE + winSize.height + cf.TIMER_LOCAL_Z_ORDER);

        timerTower.runAction(
            cc.sequence(
                cc.progressTo(cf.DROP_TOWER_DELAY, 0),
                cc.callFunc(() => {
                    timerBackground.removeFromParent(true);
                    timerBorder.removeFromParent(true);
                }),
                cc.removeSelf()
            )
        );
    },
});

GameUI.scene = function () {
    var scene = new cc.Scene();
    var layer = new GameUI();
    scene.addChild(layer);
    return scene;
};

GameUI.instance = null
