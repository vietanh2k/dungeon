var TowerUI = cc.Sprite.extend({
    card: null,
    evolution: null,
    initTextures: null,
    currentActions: null,
    actions: null,
    idlePrefixNames: null,
    attackPrefixNames: null,
    idleIDP: null,
    attackIDP: null,
    idleActions: null,
    attackActions: null,
    dir: null,
    DIR: {
        COINCIDE: -1,
        S: 0,
        SSE: 1,
        SE: 2,
        ESE: 3,
        E: 4,
        ENE: 5,
        NE: 6,
        NNE: 7,
        N: 8,
        NNW: 9,
        NW: 10,
        WNW: 11,
        W: 12,
        WSW: 13,
        SW: 14,
        SSW: 15,
    },

    /**
     * Khởi tạo dựa trên Card
     * @param {MCard} card
     * */
    ctor: function (card, evolution) {
        this.card = card;
        this.evolution = evolution;
        this.AnimationSetUp(card);

        this._super(this.initTextures[0]);

        this.part = [];
        for (let i = 1; i <= this.evolution + 1; i++) {
            this.part[i] = new cc.Sprite(this.initTextures[i]);
            this.part[i].setPosition(this.width / 2, this.height / 2);
            this.addChild(this.part[i]);
        }

        this.pedestal = new cc.Sprite(asset.battlePedestals_png[this.evolution]);
        this.pedestal.attr({
            x: this.width / 2,
            y: this.height / 2,
            scale: this.width * 0.6 / this.pedestal.width,
        });
        this.addChild(this.pedestal, -1);

        this.currentActions = [];
        this.loadAllActions();
    },
    AnimationSetUp: function(card){
        if (card.id === 2) {
            this.initTextures = [];
            this.idlePrefixNames = [];
            this.attackPrefixNames = [];
            for (let i = 0; i < 3; i++) {
                this.initTextures[i] = 'asset/tower/frame/cannon_1_2/tower_cannon_idle_' + i + '_0000.png';
                this.idlePrefixNames[i] = 'tower_cannon_idle_' + i + '_';
                this.attackPrefixNames[i] = 'tower_cannon_attack_' + i + '_';
            }
            this.initTextures[3] = 'asset/tower/frame/cannon_3/tower_cannon_idle_3_0000.png';
            this.idlePrefixNames[3] = 'tower_cannon_idle_3_';
            this.attackPrefixNames[3] = 'tower_cannon_attack_3_';
            this.idleIDP = 15;
            this.attackIDP = 9;
        }
    },

    evolute: function () {
        if (this.evolution === 2) {
            cc.log('max evolution already');
            return;
        }
        cc.log('evolute!');
        this.evolution++;
        this.pedestal.setTexture(asset.battlePedestals_png[this.evolution]);
        this.part[this.evolution + 1] = new cc.Sprite(this.initTextures[this.evolution + 1]);
        this.part[this.evolution + 1].setPosition(this.width / 2, this.height / 2);
        this.addChild(this.part[this.evolution + 1]);
    },

    update: function (dt) {
        // testing scenario: idle, spin around, anti-clockwise, 1.25𝜋 rad/s
        if (this.dir == null) {
            this.dir = 0;
        }
        let dir = Math.floor(Date.now() / 1000) % 16;
        this.updateDirection(dir);
    },

    updateDirection: function (dir) {
        if (this.dir === dir) {
            return;
        }
        if (this.idleActions[0] !== null && this.idleActions[0].length > 0) {
            if (this.currentActions[0] !== undefined) {
                this.stopAction(this.currentActions[0]);
                for (let i = 1; i <= this.evolution + 1; i++) {
                    if (this.currentActions[i] !== undefined)
                        this.part[i].stopAction(this.currentActions[i]);
                }
            }
            if (dir !== this.DIR.COINCIDE) {
                this.currentActions[0] = this.idleActions[0][dir];
                this.runAction(this.currentActions[0]);
                for (let i = 1; i <= this.evolution + 1; i++) {
                    this.currentActions[i] = this.idleActions[i][dir];
                    this.part[i].runAction(this.currentActions[i]);
                }
            }
            let isFlippedX = [this.DIR.NNW, this.DIR.NW, this.DIR.WNW, this.DIR.W, this.DIR.WSW, this.DIR.SW, this.DIR.SSW].indexOf(dir) !== -1;
            this.flippedX = isFlippedX;
            for (let i = 1; i <= this.evolution + 1; i++) {
                this.part[i].flippedX = isFlippedX;
            }
            this.dir = dir;
        }
    },

    loadAllActions: function () {
        this.loadIdleActions();
        this.loadAttackActions();
    },

    loadIdleActions: function () {
        this.idleActions = [];
        for (let j = 0; j < 4; j++) {
            this.idleActions[j] = [];
            for (let i = 0; i < 16 /* directions */; i++) {
                let frame = this.loadAnimation(Math.min(i, 16 - i) * this.idleIDP, this.idleIDP, this.idlePrefixNames[j]);
                this.idleActions[j].push(cc.animate(new cc.Animation(frame, 1 / this.idleIDP)).repeatForever());
                this.idleActions[j][i].retain();
            }
        }
    },

    loadAttackActions: function () {
        this.attackActions = [];
        for (let j = 0; j < 4; j++) {
            this.attackActions[j] = [];
            for (let i = 0; i < 16 /* directions */; i++) {
                let frame = this.loadAnimation(Math.min(i, 16 - i) * this.attackIDP, this.attackIDP, this.attackPrefixNames[j]);
                this.attackActions[j].push(cc.animate(new cc.Animation(frame, 1 / this.attackIDP)).repeatForever());
                this.attackActions[j][i].retain();
            }
        }
    },

    loadAnimation: function (from, length, prefixName) {
        let frames = [];
        for (let i = from; i < from + length; i++) {
            let fullName;
            if (i < 10000) {
                fullName = prefixName + '0'.repeat(4 - i.toString().length) + i + '.png';
            } else {
                cc.log('too much frames');
                return [];
            }
            let frame = cc.spriteFrameCache.getSpriteFrame(fullName);
            frames.push(frame);
        }
        return frames;
    }
});