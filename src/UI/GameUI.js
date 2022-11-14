MAP_WIDTH = 7;
MAP_HEIGHT = 5;
MAP_RATIO = 15/8;
NUM_CARD_PLAYABLE = 4

var GameUI = cc.Layer.extend({
    mapWidth: null,
    mapHeight: null,
    cellWidth: null,
    healthA: null,
    _gameStateManager:null,
    createObjectByTouch:null,
    deleteObjectByTouch:null,

    ctor:function (pkg) {
        this.createObjectByTouch = false
        this.deleteObjectByTouch = false
        this.cardTouchSlot = -1
        this.listCard = []
        this.cardInQueue = [1,7,0,6]
        this.cardPlayable = [2,3,5,4]
        this._super();
        this._gameStateManager = new GameStateManager(pkg)
        this.init();
        this.scheduleUpdate();

    },
    init:function () {

        winSize = cc.director.getWinSize();

        this.initBackGround();
        this.initCellSlot(this._gameStateManager.playerA._map._mapController.intArray, this._gameStateManager.playerA.rule)
        this.initCellSlot(this._gameStateManager.playerB._map._mapController.intArray, this._gameStateManager.playerB.rule)
        this.showPathUI(this._gameStateManager.playerA._map._mapController.path, 1)
        this.showPathUI(this._gameStateManager.playerB._map._mapController.path, 2)
        // cc.log(this._gameStateManager.playerA._map.monsters[0])
        // this.addChild(this._gameStateManager.playerA._map.monsters[0],2000)
        // this._gameStateManager.playerA._map.monsters[0].updateCurNode()
        this.callMonster()
        // this._gameStateManager.playerA._map.monsters[0].updateDes()

        // this.schedule(this.update, 0.1);
        // var map = new MapController(this)
        this.addTouchListener()



        return true;
    },
    addTouchListener:function(){
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            // swallowTouches: true,
            onTouchBegan: function (touch, event){
                cc.log("touch began2: "+ touch.getLocationX());
                MW.MOUSE.x = touch.getLocationX();
                MW.MOUSE.y = touch.getLocationY();
                MW.TOUCH = true;
                return true;

            }

        } , this);
    },
    checkTouch: function (){
        if(MW.TOUCH){
            MW.TOUCH = false
            var pos = new cc.p(MW.MOUSE.x, MW.MOUSE.y)
            var loc = this._gameStateManager.playerA.convertPosToCor(pos)
            cc.log(loc.x+'---'+loc.y)
            if(loc.x >=0 && loc.x < this._gameStateManager.playerA._map._mapController.intArray.length &&
                loc.y >=0 && loc.y < this._gameStateManager.playerA._map._mapController.intArray[0].length) {
                if (this._gameStateManager.playerA._map._mapController.intArray[loc.x][loc.y] <= 0) {
                    if(this.cardTouchSlot >= 0 && this._gameStateManager.playerA.energy >= this.listCard[this.cardTouchSlot-1].energy )
                    {
                        cc.log('touch right')
                        this.createObjectByTouch = true
                    }else{
                        this.resetCardTouchState()
                    }
                } else if (this._gameStateManager.playerA._map._mapController.intArray[loc.x][loc.y] > 0) {
                    this.deleteObjectByTouch = true
                }
            }else{
                this.resetCardTouchState()
            }
        //check touch time
            var timer = this.getChildByName(res.timer3)
            var vecTime = new Vec2(timer.x,timer.y)
            var vecClick = new Vec2(pos.x, pos.y)
            var dist = (vecClick.sub(vecTime)).length()
            if (dist< 0.9*timer.getContentSize().width/2 ){
                cc.log('timeeeeeeeeeeeeeeeeeeeeeee')
                if(this._gameStateManager.canTouchNewWave){
                    this.getNewWave()
                }
            }
        }

    },

    createObjectByTouch2: function (){
        if(this.createObjectByTouch ){
            this.createObjectByTouch = false
            cc.log('creat right')
            var pos = new cc.p(MW.MOUSE.x, MW.MOUSE.y)
            var loc = this._gameStateManager.playerA.convertPosToCor(pos)
            var rand = Math.floor(Math.random() * 2)+1;
            var tmp = this._gameStateManager.playerA._map._mapController.intArray[loc.x][loc.y]
            this._gameStateManager.playerA._map._mapController.intArray[loc.x][loc.y] = rand
            if(!this.isNodehasMonsterAbove(loc) && this._gameStateManager.playerA._map._mapController.isExistPath()){
                this._gameStateManager.playerA._map._mapController.findPath()
                this.showPathUI(this._gameStateManager.playerA._map._mapController.path,1)
                var tree = this.addObjectUI(res.treeUI, loc.x, loc.y, 0.85,0, 1)
                this.addChild(tree,0,res.treeUI+1)
                this.updateCardSlot(this.listCard[this.cardTouchSlot-1].energy)
                }else{
                this._gameStateManager.playerA._map._mapController.intArray[loc.x][loc.y] = tmp
                this.resetCardTouchState()
            }


        }

    },
    isNodehasMonsterAbove:function (loc){

        var children = this.children
        for (i in children) {
            if(children[i]._curNode != undefined ){
                var monsterLocArr = children[i]._curNode.split('-');
                var monsterLoc = new cc.p(parseInt(monsterLocArr[0]), parseInt(monsterLocArr[1]));
                if(monsterLoc.x == loc.x && monsterLoc.y == loc.y){
                    return true
                }
            }
        }

        return false
    },


    showPathUI:function (path, rule){
        while(this.getChildByName(res.highlightPath+rule) != null){

            this.removeChild(this.getChildByName(res.highlightPath+rule))
        }
        cc.log(res.highlightPath+rule)
        while(this.getChildByName(res.iconArrow+rule) != null){
            this.removeChild(this.getChildByName(res.iconArrow+rule))
        }
        var nodeX = 0
        var nodeY = 0
        var count = 0
        var delay = 1
        while(nodeX != MAP_WIDTH || nodeY != MAP_HEIGHT){
            var dir = path[nodeX+'-'+nodeY].direc
            var obj = this.addObjectUI(res.highlightPath,nodeX,nodeY,1,0,rule)
            this.addChild(obj,0,res.highlightPath+rule)

            var arrow = this.addObjectUI(res.iconArrow,nodeX,nodeY,0.5,dir,rule)
            this.addChild(arrow,0,res.iconArrow+rule)
            var seq = cc.sequence(cc.DelayTime(0.5),cc.fadeOut(0),cc.DelayTime(delay),cc.fadeIn(0), cc.DelayTime(0.5), cc.fadeOut(0.5));
            arrow.runAction(seq)
            delay += 0.1
            var parent = path[nodeX+'-'+nodeY].parent
            var parentList = parent.split('-');
            nodeX = parseInt(parentList[0])
            nodeY = parseInt(parentList[1])
            count++
            if(count>100) break
        }
    },

    initBackGround:function()
    {
        var backg0 = new cc.Sprite(res.mapbackground00);
        backg0.setAnchorPoint(0,0)
        backg0.setScaleY(winSize.height/backg0.getContentSize().height)
        backg0.setScaleX(winSize.width/backg0.getContentSize().width)
        this.addChild(backg0);

        this.addObjectBackground(res.river0,1,0,0,1/15)
        this.addObjectBackground(res.river1,1,0,0,1/15)
        this.addObjectBackground(res.mapbackground03,0,6/15,0.01,-2.5/15)
        this.addObjectBackground(res.mapbackground02,0,6/15,0,4.5/15)
        this.addObjectBackground(res.cell_start2,1/8,0,-3/8,1/15)
        this.addObjectBackground(res.cell_start2,1/8,0,-2/8,1/15)
        this.addObjectBackground(res.cell_start1,1/8,0,3/8,1/15)
        this.addObjectBackground(res.cell_start1,1/8,0,2/8,1/15)

        this.addObjectBackground(res.mapbackground01,7/8,0,0,-2/15)
        this.addObjectBackground(res.mapbackground0,7/8,0,0,4/15)
        this.addObjectBackground(res.gridui,7/8,0,0,4/15)
        this.addObjectBackground(res.gridui,7/8,0,0,-2/15)
        this.addObjectBackground(res.grid1,2/8,0,-2.5/8,0.5/15)
        this.addObjectBackground(res.grid2,2/8,0,2.5/8,1.5/15)

        this.addObjectBackground(res.gate2,1.5/8,0,-2.1/8,1.1/15)
        this.addObjectBackground(res.gate1,1.5/8,0,2.1/8,1.1/15)


        this.addObjectBackground(res.rock4,1/8.5,0,-6/15,7/15)
        this.addObjectBackground(res.grass3,1/7,0,8.5/15,6.5/15)
        this.addObjectBackground(res.grass2,1/15,0,8.7/15,6.3/15)
        this.addObjectBackground(res.tree0,1/5,0,8/15,5.5/15)
        this.addObjectBackground(res.rock0,1/9,0,8/15,4.2/15)
        this.addObjectBackground(res.tree2,1/3,0,8/15,3.5/15)
        this.addObjectBackground(res.tree1,1/5,0,7/15,7.5/15)
        this.addObjectBackground(res.tree3,1/5,0,5.5/15,7.5/15)
        this.addObjectBackground(res.grass1,1/10,0,-7.7/15,5.3/15)
        this.addObjectBackground(res.tree1,1/5,0,-8.2/15,4.5/15)
        this.addObjectBackground(res.tree3,1/6,0,-8/15,3.5/15)
        this.addObjectBackground(res.grass0,1/12,0,-2.2/15,7/15)
        this.addObjectBackground(res.tree0,1/5.5,0,-3.2/15,7.5/15)
        this.addObjectBackground(res.tree2,1/3.5,0,-4.5/15,7.5/15)
        this.addObjectBackground(res.rock3,1/7,0,-0.2/15,7/15)
        this.addObjectBackground(res.grass1,1/11,0,3.5/15,7/15)

        this.addObjectBackground(res.decorate,0,2.2/15,9/15,1/15)
        this.addObjectBackground(res.decorate1,0,2.3/15,-8.15/15,1.25/15)
        this.addObjectBackground(res.grass1,1/11,0,-8/15,-1.5/15)
        this.addObjectBackground(res.tree0,1/4,0,-8.5/15,-0.5/15)

        this.addObjectBackground(res.rock3,1/8,0,-8.5/15,-2/15)
        this.addObjectBackground(res.tree1,1/5,0,-8.5/15,-2.6/15)


        this.addObjectBackground(res.grass1,1/10,0,3.5/15,-5/15)
        this.addObjectBackground(res.grass1,1/10,0,-7.5/15,-4.5/15)
        this.addObjectBackground(res.tree2,1/5,0,-8/15,-5/15)
        this.addObjectBackground(res.grass1,1/11,0,8/15,0.1/15)
        this.addObjectBackground(res.tree1,1/5,0,8.5/15,-0.5/15)
        this.addObjectBackground(res.grass0,1/10,0,8/15,-2.8/15)
        this.addObjectBackground(res.rock3,1/6,0,9/15,-3.3/15)
        this.addObjectBackground(res.tree2,1/5,0,8.5/15,-1.5/15)
        this.addObjectBackground(res.rock4,1/7,0,-8.5/15,-4/15)
        this.addObjectBackground(res.tree2,1/3.5,0,8.8/15,-4.5/15)
        this.addObjectBackground(res.tree1,1/3.7,0,-6/15,-5.6/15)

        this.addObjectBackground(res.house,1/6.5,0,-3.9/8,6.2/15)
        this.addObjectBackground(res.house,1/6.5,0,3.9/8,-3.8/15)
        this.addObjectBackground(res.deck,0,2.9/15,0,-6.05/15)
        // this.healthA = new ccui.Text(this._gameStateManager.playerA.health, res.font_magic, 30)
        this.addHealthUI()
        this.addTimerUI()
        this.addHouseBoxUI()
        this.addWaveUI()
        this.addEnergyBarUI()
        this.addDeckUI()
        this.addInforBoxUI()
    },

    addObjectBackground:function (res, scaleW,scaleH, positionX, positionY) {
        var obj = new cc.Sprite(res);
        if(scaleW > 0){
            obj.setScale(WIDTHSIZE/obj.getContentSize().width*scaleW)
        }else if(scaleH > 0){
            obj.setScale(HEIGHTSIZE/obj.getContentSize().height*scaleH)
        }
        obj.setPosition(winSize.width/2 + WIDTHSIZE*positionX, winSize.height/2+HEIGHTSIZE*positionY)
        this.addChild(obj,0,res);
        return obj
    },

    addTimerUI:function () {
        this.addObjectBackground(res.timer1,0.8/8,0,0,1/15)
         // this.addObjectBackground(res.timer2,0.8/8,0,0,1/15)
        var timeBar = cc.ProgressTimer.create(cc.Sprite.create(res.timer2));
        timeBar.setType(cc.ProgressTimer.TYPE_RADIAL);
        timeBar.setBarChangeRate(cc.p(1,0));
        timeBar.setMidpoint(cc.p(0.5,0.5))
        timeBar.setScale(WIDTHSIZE/timeBar.getContentSize().width*0.8/8)
        timeBar.setPosition(winSize.width/2, winSize.height/2+HEIGHTSIZE*1/15);
        this.addChild(timeBar,0,'timeBar');


        var numTime = new ccui.Text(TIME_WAVE, res.font_magic, 24)
        numTime.setPosition(winSize.width/2, winSize.height/2+HEIGHTSIZE*1/15)
        var whiteColor = new cc.Color(255,255,255,255);
        numTime.setTextColor(whiteColor)
        numTime.enableShadow()
        this.addChild(numTime,0,'time')
        var time3 = this.addObjectBackground(res.timer3,0.8/8,0,0,1/15)
        time3.visible = false
    },
    addHealthUI:function () {
        var healthA = new ccui.Text(this._gameStateManager.playerA.health, res.font_magic, 30)
        healthA.setScale(WIDTHSIZE/healthA.getContentSize().height*0.8/15)
        healthA.setPosition(winSize.width/2 + WIDTHSIZE*3.9/8, winSize.height/2+HEIGHTSIZE*-4.25/15)
        var blueColor = new cc.Color(34,119,234,255);
        healthA.setTextColor(blueColor)
        healthA.enableShadow()
        this.addChild(healthA, 0 , 'healthA1')
        var healthB = new ccui.Text(this._gameStateManager.playerB.health, res.font_magic, 30)
        healthB.setScale(WIDTHSIZE/healthB.getContentSize().height*0.8/15)
        healthB.setPosition(winSize.width/2 + WIDTHSIZE*-3.9/8, winSize.height/2+HEIGHTSIZE*5.7/15)
        var redColor = new cc.Color(242,61,65,255);
        healthB.enableShadow()
        healthB.setTextColor(redColor)
        this.addChild(healthB, 0 , 'healthB1')
    },
    addHouseBoxUI:function () {
        var houseBox = new cc.Sprite(res.house_box)
        houseBox.setScale(WIDTHSIZE/houseBox.getContentSize().width*2/8)
        houseBox.setPosition(winSize.width+CELLWIDTH*0.32, winSize.height/2+CELLWIDTH)

        var houseIcon = new cc.Sprite(res.house_icon)
        houseIcon.setScale(WIDTHSIZE/houseIcon.getContentSize().height*0.75/8)
        houseIcon.setPosition(winSize.width+CELLWIDTH*-0.35, winSize.height/2+CELLWIDTH*1.02)

        var healthA = new ccui.Text(this._gameStateManager.playerA.health, res.font_magic, 30)
        healthA.setScale(WIDTHSIZE/healthA.getContentSize().height*0.9/15)
        healthA.setPosition(winSize.width + CELLWIDTH*-0.35, winSize.height/2+CELLWIDTH*0.4)
        var blueColor = new cc.Color(34,119,234,255);
        healthA.enableShadow()
        healthA.setTextColor(blueColor)

        var healthB = new ccui.Text(this._gameStateManager.playerB.health, res.font_magic, 30)
        healthB.setScale(WIDTHSIZE/healthB.getContentSize().height*0.9/15)
        healthB.setPosition(winSize.width + CELLWIDTH*-0.35, winSize.height/2+CELLWIDTH*1.62)
        var redColor = new cc.Color(242,61,65,255);
        healthB.enableShadow()
        healthB.setTextColor(redColor)

        this.addChild(houseBox)
        this.addChild(houseIcon)
        this.addChild(healthA, 0 , 'healthA2')
        this.addChild(healthB, 0 , 'healthB2')


    },
    addWaveUI:function () {
        var waveBox = new cc.Sprite(res.house_box)
        waveBox.setScaleX(CELLWIDTH/waveBox.getContentSize().width*1.5)
        waveBox.setScaleY(CELLWIDTH/waveBox.getContentSize().height*0.85)
        waveBox.setPosition(CELLWIDTH*0.25, winSize.height/2+CELLWIDTH*1.1)

        var lbWave = new ccui.Text('Lượt:', res.font_magic, 30)
        lbWave.setScale(CELLWIDTH/lbWave.getContentSize().height*0.25)
        lbWave.setPosition(CELLWIDTH*0.4, winSize.height/2+CELLWIDTH*1.3)
        var blueColor2 = new cc.Color(173,194,228,255);
        lbWave.enableShadow()
        lbWave.setTextColor(blueColor2)

        var strNumWave = this._gameStateManager.curWave +'/'+MAX_WAVE
        var lbNumWave = new ccui.Text(strNumWave, res.font_magic, 30)
        lbNumWave.setScale(CELLWIDTH/lbNumWave.getContentSize().height*0.35)
        lbNumWave.setPosition(CELLWIDTH*0.48, winSize.height/2+CELLWIDTH*0.95)
        var blueColor = new cc.Color(255,255,248,255);
        lbNumWave.enableShadow()
        lbNumWave.setTextColor(blueColor)

        this.addChild(waveBox)
        this.addChild(lbWave)
        this.addChild(lbNumWave,0, 'lbNumWave')

    },
    updateHealthUI:function (dt) {
        if(this.getChildByName('healthA1') != null) {
            this.getChildByName('healthA1').setString(this._gameStateManager.playerA.health)
        }
        if(this.getChildByName('healthA2') != null) {
            this.getChildByName('healthA2').setString(this._gameStateManager.playerA.health)
        }
        if(this.getChildByName('healthB1') != null) {
            this.getChildByName('healthB1').setString(this._gameStateManager.playerB.health)
        }
        if(this.getChildByName('healthB2') != null) {
            this.getChildByName('healthB2').setString(this._gameStateManager.playerB.health)
        }
    },

    addEnergyBarUI:function (){
        var energy = new cc.Sprite(res.energyIcon)
        var whiteColor = new cc.Color(255,255,255,255);
        var blackColor = new cc.Color(0,0,0,255);
        var lbNumEnergy = new ccui.Text(this._gameStateManager.playerA.energy, res.font_magic, 40)
        lbNumEnergy.setPosition(energy.getContentSize().width*0.5,energy.getContentSize().height/2)
        lbNumEnergy.enableShadow()
        lbNumEnergy.setTextColor(whiteColor)
        lbNumEnergy.enableOutline(blackColor,1)
        energy.addChild(lbNumEnergy,0,'numEnergyBar')
        energy.setScale(CELLWIDTH/energy.getContentSize().height*0.65)
        energy.setPosition(winSize.width/2- WIDTHSIZE/2+CELLWIDTH*1.3, winSize.height/2- HEIGHTSIZE/2+CELLWIDTH*0.4)
        this.addChild(energy,0,'iconEnergyBar')

        // var energyBarBackground = new cc.Sprite('asset/lobby/lobby_card_progress_background_deck.png')
        // energyBarBackground.setScaleY(CELLWIDTH/energyBarBackground.getContentSize().height*0.25)
        // energyBarBackground.setScaleX(CELLWIDTH/energyBarBackground.getContentSize().width*6)
        // energyBarBackground.setPosition(winSize.width/2+CELLWIDTH*1, winSize.height/2- HEIGHTSIZE/2+CELLWIDTH*0.4)
        // this.addChild(energyBarBackground)

    },

    addInforBoxUI:function (){


    },

    addDeckUI:function (){
       this.addListCardUI()
        var btnChat = ccui.Button('asset/battle/battle_btn_chat.png');
        btnChat.setScale(CELLWIDTH/btnChat.getNormalTextureSize().width*0.9)
        btnChat.setPosition(winSize.width/2-WIDTHSIZE/2+CELLWIDTH*0.3, winSize.height /2-HEIGHTSIZE/2+CELLWIDTH*2.6)
        this.addChild(btnChat,0);

        var lbWave = new ccui.Text('Tiếp theo:', res.font_magic, 30)
        lbWave.setScale(CELLWIDTH/lbWave.getContentSize().height*0.24)
        lbWave.setPosition(winSize.width/2-WIDTHSIZE/2+CELLWIDTH*0.3, winSize.height /2-HEIGHTSIZE/2+CELLWIDTH*1.85)
        var whiteColor = new cc.Color(245,241,220,255);
        var blackColor = new cc.Color(0,0,0,255);
        lbWave.setTextColor(whiteColor)
        lbWave.enableShadow()
        lbWave.enableOutline(blackColor,1)
        this.addChild(lbWave,0);

    },

    addListCardUI:function (){
        var listener1 = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function (touch, event) {
                var target = event.getCurrentTarget();
                var locationInNode = target.convertToNodeSpace(touch.getLocation());
                var s = target.getContentSize();
                var rect = cc.rect(0, 0, s.width, s.height);
                if (cc.rectContainsPoint(rect, locationInNode)) {
                    return true;
                }
                return false;
            },
            // onTouchMoved: function (touch, event) {
            //     // var target = event.getCurrentTarget();
            //     // var delta = touch.getDelta();
            //     // target.x += delta.x;
            //     // target.y += delta.y;
            // },
            onTouchEnded: function (touch, event) {
                var target = event.getCurrentTarget();
                if(target.getParent() != null){
                    if(target.getParent().cardTouchSlot != target.numSlot){
                        target.getParent().resetCardTouchState()
                        target.x += 0
                        target.y += CELLWIDTH*0.5
                        target.onTouch = true
                        target.getParent().cardTouchSlot= target.numSlot
                        target.setCardUpUI()
                        target.getParent().getChildByName('btnRemoveCard'+target.getParent().cardTouchSlot).visible = true
                    }else if(target.onTouch == true){
                        target.x += 0
                        target.y -= CELLWIDTH*0.5
                        target.onTouch = false
                        target.getParent().getChildByName('btnRemoveCard'+target.getParent().cardTouchSlot).visible = false
                        target.getParent().cardTouchSlot = -1
                        target.setCardDownUI()

                    }
                }
            }
        });
        for(var i=1;i<=NUM_CARD_PLAYABLE;i++) {
            var cardBox = new cc.Sprite('asset/battle/battle_card_box.png')
            cardBox.setScale(CELLWIDTH / cardBox.getContentSize().width * 1.5)
            cardBox.setPosition(winSize.width/2-WIDTHSIZE/2+CELLWIDTH*2.1+(i-1)*CELLWIDTH*1.8, winSize.height /2-HEIGHTSIZE/2+CELLWIDTH*1.7)
            this.addChild(cardBox)
            var arr = this.cardPlayable
            var card = new MCard(arr[i-1])
            card.setScale(CELLWIDTH / card.getContentSize().width * 1.25)
            card.setPosition(winSize.width/2-WIDTHSIZE/2+CELLWIDTH*2.1+(i-1)*CELLWIDTH*1.8, winSize.height /2-HEIGHTSIZE/2+CELLWIDTH*1.7)
            this.addChild(card,0,'cardBackGround'+i)
            card.numSlot = i
            this.listCard.push(card)
            cc.eventManager.addListener(listener1.clone(), card);
        }
        for(var i=1;i<=NUM_CARD_PLAYABLE;i++) {

            var btnRemoveCard =new ccui.Button('asset/battle/battle_btn_destroy.png');
            btnRemoveCard.setScale(CELLWIDTH / btnRemoveCard.getContentSize().width * 1.55)
            btnRemoveCard.setPosition(winSize.width/2-WIDTHSIZE/2+CELLWIDTH*2.1+(i-1)*CELLWIDTH*1.8, winSize.height /2-HEIGHTSIZE/2+CELLWIDTH*0.9)
            btnRemoveCard.visible = false
            btnRemoveCard.addClickEventListener(()=> this.updateCardSlot(3));
            this.addChild(btnRemoveCard, 0 , 'btnRemoveCard'+i);


        }
        var card5 = new MCard(this.cardInQueue[0])
        card5.setScale(CELLWIDTH / card5.getContentSize().width * 0.9)
        card5.setPosition(winSize.width/2-WIDTHSIZE/2+CELLWIDTH*0.3, winSize.height /2-HEIGHTSIZE/2+CELLWIDTH*0.9)
        this.addChild(card5,0,'cardBackGroundd')






    },

    updateCardSlot:function (numEnergy) {
        cc.log('aaaaaaaaaaaaaaaaaaaa')
        if(this.cardTouchSlot>=0 && this._gameStateManager.playerA.energy >= numEnergy) {
            this._gameStateManager.playerA.energy -= numEnergy
            this.cardInQueue.push(this.listCard[this.cardTouchSlot - 1].cardID)
            this.listCard[this.cardTouchSlot - 1].updateNewCard(this.cardInQueue[0])
            this.cardInQueue.shift()
            this.getChildByName('cardBackGroundd').updateNewCard(this.cardInQueue[0])
            this.cardPlayable[this.cardTouchSlot - 1] = this.listCard[this.cardTouchSlot - 1].cardID

        }
        this.resetCardTouchState()



    },
    resetCardTouchState:function () {
        for(var i=1; i<=NUM_CARD_PLAYABLE; i++){
            var card = this.getChildByName('cardBackGround'+i)
            if(card.onTouch == true){
                card.x += 0
                card.y -= CELLWIDTH*0.5
                card.onTouch = false
                card.setCardDownUI()
                this.getChildByName('btnRemoveCard'+this.cardTouchSlot).visible = false
                this.cardTouchSlot = -1
            }
        }
    },



    updateEnergyUI:function (dt) {
        if(this.getChildByName('iconEnergyBar') != null) {
            this.getChildByName('iconEnergyBar').getChildByName('numEnergyBar').setString(this._gameStateManager.playerA.energy)
        }
    },

    updateTimer:function (dt) {
        this._gameStateManager._timer.updateRealTime(dt)
        var time = Math.floor(this._gameStateManager._timer.curTime+0.5)
        this.getChildByName('time').setString(time)
        var percen = 100-this._gameStateManager._timer.curTime/TIME_WAVE*100
        this.getChildByName('timeBar').setPercentage(percen)
        if(time == 0){
            this.getNewWave()
        }
        if(this._gameStateManager.canTouchNewWave){
            this.getChildByName(res.timer3).visible = true
        }
    },

    getNewWave:function () {
        this.getChildByName(res.timer3).visible = false
        this._gameStateManager.updateStateNewWave()
        var strNumWave = this._gameStateManager.curWave +'/'+MAX_WAVE
        this.getChildByName('lbNumWave').setString(strNumWave)
        this._gameStateManager._timer.resetTime(TIME_WAVE)
        this.callMonster()
    },

    callMonster:function () {
        var monster = this._gameStateManager.playerA._map.addMonster()
        this.addChild(monster,2000)
        var monster2 = this._gameStateManager.playerB._map.addMonster()
        this.addChild(monster2,2000)
    },

    convertCordinateToPos:function (corX, corY) {
        var x = winSize.width/2 - WIDTHSIZE/2 + (corX+1)*this.cellWidth
        var y = winSize.height/2 - HEIGHTSIZE/2 + (MAP_HEIGHT- corY+3.5)*this.cellWidth
        var p = new cc.p(x,y)
        return p

    },

    convertPosToCor:function (pos) {
        var x = Math.floor((pos.x - winSize.width/2 + WIDTHSIZE/2 )/this.cellWidth - 0.5)
        var y = Math.floor((pos.y - winSize.height/2+HEIGHTSIZE/2)/this.cellWidth)
        var p = new cc.p(x,y)
        return p

    },

    initCellSlot:function ( mapArray, rule) {
        var arr = this._gameStateManager.playerA._map._mapController.intArray
        for(var i=0;i<MAP_WIDTH+1;i++){
            for(var j=0; j <MAP_HEIGHT+1; j++){
                if(mapArray[i][j] == -1) {
                    var obj = this.addObjectUI(res.buffD, i, j, 1,0,rule)
                    this.addChild(obj,0,res.buffD+rule)
                }
                if(mapArray[i][j] == -2) {
                    var obj = this.addObjectUI(res.buffS, i, j,1,0, rule)
                    this.addChild(obj,0,res.buffD+rule)
                }
                if(mapArray[i][j] == -3) {
                    var obj = this.addObjectUI(res.buffR, i, j, 1,0,rule)
                    this.addChild(obj,0,res.buffD+rule)
                }
                if(mapArray[i][j] == 1) {
                    var obj = this.addObjectUI(res.treeUI, i, j,0.85,0, rule)
                    this.addChild(obj,0,res.buffD+rule)
                }
                if(mapArray[i][j] == 2) {
                    var obj = this.addObjectUI(res.hole, i, j,0.85,0, rule)
                    this.addChild(obj,0,res.buffD+rule)
                }
            }
        }
    },
    
    //scale * cellwidth
    addObjectUI:function (_res, corX ,corY,_scale,direc, rule ) {
        var object = new cc.Sprite(_res)
        object.setScale(_scale*CELLWIDTH/object.getContentSize().height)
        var pos
        if(rule == 1) {
            pos = this._gameStateManager.playerA.convertCordinateToPos(corX, corY)
        }
        else{
            pos = this._gameStateManager.playerA.convertCordinateToPos2(corX, corY,2)
        }
        object.setPosition(pos)
        if(direc == 8){
            object.setRotation(90)
        }
        if(direc == 4){
            object.setRotation(180)
        }
        if(direc == 2){
            object.setRotation(270)
        }
        if(_res == res.iconArrow && rule == 2) object.setRotation(object.getRotation()+180)
        return object
    },

    getEnergyUI:function (pos, numEnergy){
        var energy = new cc.Sprite(res.energyIcon)
        energy.setPosition(pos.x, pos.y)

        var lbAddIcon = new ccui.Text('+', res.font_magic, 70)
        lbAddIcon.setPosition(-energy.getContentSize().width*1/3,energy.getContentSize().height/2)
        var blueColor2 = new cc.Color(255,255,255,255);
        lbAddIcon.enableShadow()
        lbAddIcon.setTextColor(blueColor2)

        var lbNumEnergy = new ccui.Text(numEnergy, res.font_magic, 70)
        lbNumEnergy.setPosition(energy.getContentSize().width*1.3,energy.getContentSize().height/2)
        lbNumEnergy.enableShadow()
        lbNumEnergy.setTextColor(blueColor2)

        energy.addChild(lbAddIcon)
        energy.addChild(lbNumEnergy)
        energy.setScale(CELLWIDTH/energy.getContentSize().height*0.3)

        var seq1 = cc.MoveTo(0.3, cc.p(pos.x, pos.y+CELLWIDTH*0.5))
        var seq2 = cc.fadeOut(0)
        var seq3 = cc.CallFunc(()=> this.removeChild(energy), this)
        var seq = cc.sequence(seq1,cc.delayTime(0.5),seq2,seq3)
        energy.runAction(seq)
        this.addChild(energy)

    },

    checkEndBattle:function () {
        if(this._gameStateManager.winner == 1){
            this.blockEndBattleLayer()
            this.showResultBattleUI('win')
        }
        if(this._gameStateManager.winner == 2){
            this.blockEndBattleLayer()
            this.showResultBattleUI('lose')
        }
        if(this._gameStateManager.winner == 0){
            this.blockEndBattleLayer()
            this.showResultBattleUI('draw')
        }

    },

    blockEndBattleLayer:function () {
        this.unscheduleAllCallbacks()
        var blockLayer = new cc.Sprite(res.house_box)
        blockLayer.setScaleX(1.3*winSize.width/blockLayer.getContentSize().width)
        blockLayer.setScaleY(1.3*winSize.height/blockLayer.getContentSize().height)
        blockLayer.setPosition(winSize.width/2, winSize.height/2)
        this.addChild(blockLayer,4000)
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function (touch, event){
                cc.log("touch began2333333333: "+ touch.getLocationX());

                return true;

            }
        } , blockLayer);

    },
    showResultBattleUI:function (resultString) {

        var resultAnimation = new sp.SkeletonAnimation("asset/battle_result/fx/fx_result_"+resultString+".json",
            "asset/battle_result/fx/fx_result_"+resultString+".atlas")
        resultAnimation.setScale(8.9*WIDTHSIZE/ resultAnimation.getBoundingBox().width)
        resultAnimation.setPosition(winSize.width/ 2, winSize.height/2+CELLWIDTH*0.2)
        resultAnimation.setAnimation(0, "fx_result_"+resultString+"_idle", true)
        this.addChild(resultAnimation,4001)

        var btnBack = ccui.Button('asset/common/common_btn_blue.png');
        btnBack.setTitleText('Trở Về')
        btnBack.setTitleFontName(res.font_magic)

        btnBack.setScale((WIDTHSIZE*1.4/7)/btnBack.getNormalTextureSize().height)
        btnBack.setTitleFontSize(23)
        btnBack.setPosition(winSize.width/2, winSize.height/2+HEIGHTSIZE*-3.85/9)
        this.addChild(btnBack,4002);
    },


    update:function (dt) {
        this.checkTouch()
        this.createObjectByTouch2();
        this.updateTimer(dt)
        var children = this.children;
        for (i in children) {
            children[i].update(dt);
        }
        this._gameStateManager.update(dt)

        this.updateHealthUI(dt)
        this.updateEnergyUI(dt)
        this.checkEndBattle()


    },

});

GameUI.scene = function () {
    var scene = new cc.Scene();
    var layer = new GameUI();
    scene.addChild(layer);
    return scene;
};