var _TOWER_CONFIG;

/**
 * Abstract class*/
var Tower = TowerUI.extend({
    render: function (playerState) {
        if (!this._is_set_pos) {
            this.renderRule = playerState.rule
            var self = this

            if (this.renderRule === 1) {
                // dir.set(dir.x, -dir.y)
                let dx = winSize.width / 2 - WIDTHSIZE / 2 + CELLWIDTH / 2
                let dy = winSize.height / 2 - HEIGHTSIZE / 2 + CELLWIDTH * 3
                let height = dy + CELLWIDTH * 5
                let x = this.position.x / MAP_CONFIG.CELL_WIDTH * CELLWIDTH
                let y = this.position.y / MAP_CONFIG.CELL_HEIGHT * CELLWIDTH

                this.x = dx + x
                this.y = height - y
            } else {
                // dir.set(-dir.x, dir.y)
                let dx = winSize.width / 2 - WIDTHSIZE / 2 + CELLWIDTH / 2
                let dy = winSize.height / 2 - HEIGHTSIZE / 2 + CELLWIDTH * 3
                let height = dy + CELLWIDTH * 6
                let width = dx + CELLWIDTH * 7

                let x = this.position.x / MAP_CONFIG.CELL_WIDTH * CELLWIDTH
                let y = this.position.y / MAP_CONFIG.CELL_HEIGHT * CELLWIDTH

                this.setPosition(width - x, height + y)
            }
            this._is_set_pos = true
        }

    },
    getAttackSpeed: function () {
        return this.getConfig()["stat"][this.getLevel()]['attackSpeed'] / 1000;
    },
    getPending: function () {
        return this.pendingSecond;
    },
    resetPending: function () {
        this.pendingSecond = this.getConfig()["buildingTime"] / 1000;
    },
    updatePending: function (dt) {
        if (this.pendingSecond > 0) {
            this.pendingSecond -= dt;
        }
    },
    prioritize: function (map, object) {
        if (map.getDistanceBetween(object.position, this.position) <= this.getRange()) {
            this.target.unshift(object);
        }
    },
    fire: function () {
        if (this.target.length > 0) {
            let bullet = this.getNewBullet(this.target[0]);
            this.map.addNewBullet(bullet);
            var direction = this.target[0].position.sub(this.position).normalize();
            this.changDirectionHandle(direction);
        }

    },
    /**
     * Chuyển hướng của tháp
     * @param {Vec2} direction
     * */
    changDirectionHandle: function (direction) {
        var dirs = [
            [ 10,9,8,7,6],
            [ 11,1,1,1,5],
            [ 12,1,1,1,4],
            [ 13,1,1,1,3],
            [ 14,15,0,1,2],
        ]

        direction.set(Math.round(direction.x*2), Math.round(direction.y*2))
        if (direction) {
            const dir = dirs[direction.y +2][direction.x +2]
            this.updateDirection(dir)
        }


        // cc.log("changDirectionHandle is not overwritten!")
    },
    getNewBullet: function (object) {
        var speed = this.getConfig()['stat'][this.getLevel()]['bulletSpeed'],
            damage = this.getConfig()['stat'][this.getLevel()]['damage'],
            radius = this.getConfig()['stat'][this.getLevel()]['bulletRadius'],
            position = new Vec2(this.position.x, this.position.y);
        return new Bullet(object, speed, damage, radius, position);
    },
    /**
     * Update logic (tướng ứng với update trong thiết kế)
     * @param {PlayerState} playerState
     * @param {Number} dt
     * */
    logicUpdate: function (playerState, dt) {
        if (this.health <= 0) {
            this.active = false;
        }
        this.status = 'idle'
        if (this.active) {
            // this.update(dt);

            // cc.log('updating Tower')
            if (this.getPending() > 0) {
                this.updatePending(dt);
                this.visible = false;

            } else {
                this.visible = true;
                this.target = [];
                var self = this;
                const map = playerState.getMap()
                map.getObjectInRange(this.position, self.getRange()).map(function (obj) {
                    // cc.log("found target" + this.position + "range" + self.getRange() + "B: "+obj.position)
                    if (self.checkIsTarget(obj)) {
                        self.target.push(obj);
                        // cc.log('found target')
                        // cc.log(obj)
                    }
                })
                if (this.attackCoolDown <= 0) {
                    if (this.target.length > 0) {
                        this.status = 'attack'
                        this.fire();
                        this.attackCoolDown = self.getAttackSpeed();
                    }

                } else {
                    this.attackCoolDown -= dt;
                }
            }

        }

    },
    checkIsTarget: function (another) {
        return (another.concept == "monster" || another.concept == "tree");
    },
    getLevel: function () {
        return this.level;
    },
    getRange: function () {
        return this.getConfig()['stat'][this.getLevel()]['range']
    },
    getConfig: function () {
        if (_TOWER_CONFIG == undefined || _TOWER_CONFIG == null) {
            _TOWER_CONFIG = cc.loader.getRes("config/Tower.json");
        }
        _TOWER_CONFIG["tower"][this.instance]["buildingTime"] = _TOWER_CONFIG.buildingTime
        return _TOWER_CONFIG["tower"][this.instance]
    },
    destroy: function () {
        this.isDestroy = true
        if (this.getParent() != null) {
            this.getParent().getEnergyUI(cc.p(this.x, this.y), 5)
        }
        this.visible = false;
        this.active = false;
    },
    upgrade: function (card) {
        this.evolute();
        if(this.level<3){
            this.level += 1;
        }
    }

    }
)

Tower.TOWER_FACTORY = {}

Tower.prototype.readConfig = function () {
    if (_TOWER_CONFIG == undefined) {

        _TOWER_CONFIG = cc.loader.getRes("config/Tower.json");
    }
    return _TOWER_CONFIG;
}

/**
 * @param {Card} card
 * @return {Tower} tower
 * */
Tower.getOrCreate = function (card) {
    if (Tower.TOWER_FACTORY == undefined) {
        Tower.TOWER_FACTORY = {}
    }
    return Tower.TOWER_FACTORY[card.id]();
}

