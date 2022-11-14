/**
 * Created by KienVN on 10/2/2017.
 */

var gv = gv || {};
var testnetwork = testnetwork || {};

testnetwork.Connector = cc.Class.extend({
    ctor: function (gameClient) {
        this.gameClient = gameClient;
        gameClient.packetFactory.addPacketMap(testnetwork.packetMap);
        gameClient.receivePacketSignal.add(this.onReceivedPacket, this);
        this._userName = "username";
    },

    onReceivedPacket: function (cmd, packet) {
        cc.log("onReceivedPacket:", cmd);

        switch (cmd) {
            case gv.CMD.HAND_SHAKE:
                this.sendLoginRequest();
                break;
            case gv.CMD.USER_LOGIN:
                this.sendGetUserInfo();
                fr.getCurrentScreen().onFinishLogin();
                break;
            case gv.CMD.USER_INFO:
                fr.getCurrentScreen().onUserInfo(packet.name, packet.x, packet.y);
                break;
            case gv.CMD.MOVE:
                cc.log("MOVE:", packet.x, packet.y);
                fr.getCurrentScreen().updateMove(packet.x, packet.y);
                break;
            case gv.CMD.OPEN_CHEST_NOW:
                fr.getCurrentScreen().onReceivedServerResponse(packet.status);
                break;
            case gv.CMD.START_COOL_DOWN:
                // fr.getCurrentScreen().onReceivedServerResponse(packet.status);
                break;
            case gv.CMD.MATCH_REPONSE:
                cc.log('matching succeededddddddddddd')
                cc.log(packet.x)
                this.sendConfirmMatch()
                break;
            case gv.CMD.BATTLE_START:
                cc.log('battle start succeededddddddddddd')
                break;

        }
    },
    sendGetUserInfo: function () {
        cc.log("sendGetUserInfo");
        var pk = this.gameClient.getOutPacket(CmdSendUserInfo);
        pk.pack();
        this.gameClient.sendPacket(pk);
    },
    sendLoginRequest: function () {
        var pk = this.gameClient.getOutPacket(CmdSendLogin);
        pk.pack(this.gameClient._userId);
        this.gameClient.sendPacket(pk);


    },
    sendMove: function (direction) {
        cc.log("SendMove:" + direction);
        var pk = this.gameClient.getOutPacket(CmdSendMove);
        pk.pack(direction);
        this.gameClient.sendPacket(pk);
    },

    sendStartCooldownRequest: function (chest) {
        cc.log("Send start cooldown request for chest ID: " + chest.id);
        let pk = this.gameClient.getOutPacket(CmdSendStartCooldownChest);
        pk.putData(chest);
        this.gameClient.sendPacket(pk);
    },
    /**
     * gửi yêu cầu mở chest
     * */
    sendOpenChestRequest: function (chest, gemSpent) {
        cc.log('Send open chest request for chest ID ' + chest.id + ' by spend ' + gemSpent + ' gem(s).');
        let pk = this.gameClient.getOutPacket(CmdSendOpenChest);
        pk.putData(chest, gemSpent);
        this.gameClient.sendPacket(pk);
    },
    sendMatchRequest:function(){
        cc.log("MatchRequest:");
        var pk = this.gameClient.getOutPacket(CmdMatchRequest);
        cc.log(pk)
        pk.pack(null);
        this.gameClient.sendPacket(pk);
    },
    sendConfirmMatch:function(){
        cc.log("Match Confirm:");
        var pk = this.gameClient.getOutPacket(CmdMatchConfirm);
        pk.pack(null);
        this.gameClient.sendPacket(pk);
    }
});



