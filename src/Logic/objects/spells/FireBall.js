FIREBALL_WIDTH = 180

const FireBall = Spell.extend({
    ctor: function (playerState, position) {
        this._super(playerState, position);
        const config = cf.POTION.potion[SPELL_ID.FIREBALL]
        // this.initOpponentUI(position)
        // this.initFromConfig(playerState, config)
        this.radius = 0.8
        this.canCast = true
        return true;
    },

    //
    // initOpponentUI: function (position) {
    //     if (this.renderRule === 1) {
    //         this.speed2 = 10 * MAP_CONFIG.CELL_WIDTH
    //         this.position= new Vec2(position.x, position.y-MAP_CONFIG.CELL_WIDTH*4)
    //     }else{
    //         this.position= new Vec2(position.x, position.y+MAP_CONFIG.CELL_WIDTH*4)
    //         this.speed2 = -10 * MAP_CONFIG.CELL_WIDTH
    //     }
    // },

    logicUpdate: function (playerState, dt){
        if(this.canCast == true) {
            this.canCast = false
            this.explose(this._playerState, null)
            this.destroy()
        }

    },

    // fall: function (distance){
    //     this.position.y += distance
    //     if(this.renderRule == 1) {
    //         if (this.position.y >= this.castPosition.y) {
    //             this.cast(2)
    //             this.runAction(cc.sequence(cc.delayTime(0.05),cc.callFunc(()=>{
    //                 this.explose(this._playerState, null);
    //             })))
    //         }
    //     }else{
    //         if(this.position.y <= this.castPosition.y){
    //             this.cast(2)
    //             this.runAction(cc.sequence(cc.delayTime(0.05),cc.callFunc(()=>{
    //                 this.explose(this._playerState, null);
    //             })))
    //
    //         }
    //     }
    //
    //
    //
    //     //this.debug(map)
    // },

    explose: function (playerState, pos) {
        const map = playerState.getMap();
        const monsters = map.queryEnemiesCircle(this.castPosition,MAP_CONFIG.CELL_WIDTH*this.radius)
        for (let i = 0; i < monsters.length; i++) {
            monsters[i].takeDamage(playerState, 50)
            monsters[i].hurtUI()
        }
        // let objectList = map.getObjectInRange(this.castPosition, 1.5);
        // for (let object of objectList) {
        //     if (this.canAttack(object)) {
        //         object.takeDamage(5);
        //         object.hurtUI();
        //     }
        // }
        // for (let monster of monsters) {
        //     cc.log('66666666666666666666666666')
        //     monster.takeDamage(50)
        //     monster.hurtUI()
        // }
    }
});