let TCannonBullet = Bullet.extend({
    name: 'cannon',
    concept: "bullet",
    type: 'chasing',

    ctor: function (target, speed, damage, radius, position, fromTower, targetType, level) {
        this._super(res.TCannon_Bullet, target, speed, damage, radius, position, fromTower, targetType, level);
    },

    explose: function (playerState, pos) {
        const map = playerState.getMap();
        let objectList = map.getObjectInRange(pos, this.radius);
        for (let object of objectList) {
            if (this.canAttack(object) && (this.targetType === 'all' || this.targetType === object.class)) {
                object.takeDamage(playerState, this.damage, this.fromTower);
                if (this.level === 3) {
                    object.stunEffect = new StunEffect(this.getStunDuration(), object);
                    playerState.getMap().addEffect(object.stunEffect);
                }
                object.hurtUI();
            }
        }
        this.isDestroy = true;
        this.active = false;
        this.visible = false;

        GameUI.instance.removeChild(this);
        if (this.target && this.target.release) {
            this.target.release();
        }
    },

    getStunDuration: function () {
        return 0.2;
    },
});

let TIceGunBullet = Bullet.extend({
    name: 'cannon',
    concept: "bullet",
    type: 'chasing',

    ctor: function (target, speed, damage, radius, position, fromTower, targetType, level) {
        this._super(res.TIceGun_Bullet, target, speed, damage, radius, position, fromTower, targetType, level);
    },

    explose: function (playerState, pos) {
        const map = playerState.getMap();
        let objectList = map.getObjectInRange(pos, this.radius);
        for (let object of objectList) {
            if (this.canAttack(object) && (this.targetType === 'all' || this.targetType === object.class)) {
                object.takeDamage(playerState, this.damage, this.fromTower);
                object.tIceGunEffect = new TIceGunEffect(this.getFreezeDuration(), object, this.level === 3);
                playerState.getMap().addEffect(object.tIceGunEffect);
                object.hurtUI();
            }
        }
        this.isDestroy = true;
        this.active = false;
        this.visible = false;

        GameUI.instance.removeChild(this);
        if (this.target && this.target.release) {
            this.target.release();
        }
    },

    getFreezeDuration: function () {
        // let bulletIceGunBuff = Utils.getAllObjectValues(cf.TARGET_BUFF.targetBuff).find(element => element.name === 'bulletIceGun');
        // if (bulletIceGunBuff === undefined) {
        //     Utils.addToastToRunningScene('Cannot find bullet ice gun buff!');
        //     return 0;
        // }
        // Utils.addToastToRunningScene('Freeze duration: ' + bulletIceGunBuff.duration.toString(this.level));
        // return bulletIceGunBuff.duration.toString(this.level);
        return 1.5;
    },
});
