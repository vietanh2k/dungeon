const SlowEffect = Effect.extend({

    ctor: function (time, target, slowType, slowValue, source) {
        this._super(time);

        this.target = target;
        this.slowType = slowType;
        this.slowValue = slowValue;
        this.source = source;
        // todo animation slow
        this.target.retain();
    },

    resetWithAttr: function (playerState, newTime, newSlowValue) {
        this.time = newTime;
        this.countDownTime = newTime;
        this.slowValue = newSlowValue;
    },

    destroy: function (playerState) {
        // todo animation slow
        switch (this.source) {
            case cf.SLOW_SOURCE.TOILGUN:
                this.target.slowEffectFromTOilGun = undefined;
                break;
            case cf.SLOW_SOURCE.TDAMAGE:
                this.target.slowEffectFromTDamage = undefined;
                break;
            default:
                cc.log('Unknown source!');
                break;
        }
        this.target.release();
    }
});
