var wxApiUtil = {
    config:{
//        appId: 'wx6f2e55ea7bf6832e',//axyr // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
        appId: '',//"", //必填，公众号的唯一标识   20171226 芝麻花开
        timestamp: "", // 必填，生成签名的时间戳
        nonceStr: "",// 必填，生成签名的随机串
        signature: "",// 必填，签名，见附录1
    },
    //检查是否微信环境
    checkWXEnvironment:function(){
        var ua = navigator.userAgent.toLowerCase();
        if(ua.match(/MicroMessenger/i)=="micromessenger") {
            return true;
        } else {
            return false;
        }
    },
    /**
     * 微信中跳转到携带code的指定页，返回目标url
     * @param toUrl 目标url地址可带参，形如："http://www.zmhkedu.com/web/websiteMove/login.html?actype=2"
     * @returns {string}
     */
    getUrlTakeCode:function(toUrl){
        var urlTakeCode="https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx49e446dd2cfa2762&redirect_uri="+encodeURIComponent(toUrl)
            +"&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect";
        return urlTakeCode;
    },

    //绑定微信公众号支付处理事件
    /**
     * 绑定微信公众号支付处理事件
     * @param prepayId “预支付交易会话标识”，微信统一下单接口中获取
     * @param getPaySignFun 获取支付签名的方法，第一个参数是接口参数，第二个参数是获取成功之后的回调
     * @param callback 支付成功之后的回调方法
     */
    initWXPay:function(prepayId,getPaySignFun,callback){
        var onBridgeReady = function(){
        var timeStamp = Date.parse(new Date())/1000+"";
        var getPaySign_actobj = {
            "appId":wxApiUtil.config.appid,//"wx2421b1c4370ec43b",     //公众号名称，由商户传入
            "timeStamp":timeStamp,//"1395712654",         //时间戳，自1970年以来的秒数
            "nonceStr":Math.random().toString(36).substr(2, 15),//"e61463f8efa94090b1f366cccfbbb444", //随机串
            "package":"prepay_id="+prepayId,//"prepay_id=u802345jgfjsdfgsdg888",
            "signType":"MD5",         //微信签名方式：
        };
        getPaySignFun(getPaySign_actobj,function(data){
            var paySign = data.resultdata.paySign;
            getPaySign_actobj.paySign = paySign;
            WeixinJSBridge.invoke(
                'getBrandWCPayRequest', getPaySign_actobj,
                function(res){
                    // 使用以下方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回    ok，但并不保证它绝对可靠。
                    if(res.err_msg == "get_brand_wcpay_request:ok" ) {
                        // showMessage('success',"微信支付成功，可以进行页面跳转了");
                        callback&&callback();
                    }
                   // else{
                   //     showMessage('alert',JSON.stringify(res));
                   // }
                }
            );
        });
        };
        if (typeof WeixinJSBridge == "undefined"){
        if( document.addEventListener ){
            document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
        }else if (document.attachEvent){
            document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
            document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
        }
        }else{
        onBridgeReady();
        }
    },

    /**
     * 初始化微信分享配置，调用之前需要调后台接口获取微信签名，并为wxApiUtil.config下面的三个属性赋值
     * @param sendTitle 分享主题
     * @param sendDescribe 分享描述
     * @param sendImgurl 分享图片url地址
     */
    initShareConfig:function(sendTitle,sendDescribe,sendImgurl){
        //通过config接口注入权限验证配置
        wx.config({
            // beta: true,
            debug: false,
//        appId: 'wx6f2e55ea7bf6832e',//axyr // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
            appId: wxApiUtil.config.appId,//"wx49e446dd2cfa2762", //必填，公众号的唯一标识   20171226 芝麻花开
            timestamp: wxApiUtil.config.timestamp, // 必填，生成签名的时间戳
            nonceStr: wxApiUtil.config.nonceStr,// 必填，生成签名的随机串
            signature: wxApiUtil.config.signature,// 必填，签名，见附录1
            jsApiList: [// 必填，需要使用的JS接口列表，所有JS接口列表见附录2
                'updateTimelineShareData',
                'updateAppMessageShareData'
            ]
        });
        wx.ready(function () {
            // var send_title = "AI智能测评（自检）";//getcookie("send_title");
            // var send_describe = "AI智能测评分为四个部分：学业现状自检、兴趣选课测量、高校专业选择、未来职业评估";//getcookie("send_describe");
            // var send_imgurl = "http://www.zmhkedu.com/web/website/images/logo.png";//getcookie("send_imgurl");
            wx.updateAppMessageShareData({
                title: sendTitle,//'评估产品分享给好友title测试',
                desc: sendDescribe,//"评估产品分享描述测试",
                link:wxApiUtil.config.share_url,//"http://www.zmhkedu.com/web/websiteMove/weixinShareTest.html?suid="+_UserObject.user_id,
                imgUrl: sendImgurl,
                trigger: function (res) {
                },
                success: function (res) {
                    //给出"分享成功"提示信息或不做任何操作
                    // layer.msg("分享成功",{//，当前分享人："+getUrlPara("uid"), {
                    //     icon: 1,
                    //     time: 3000
                    // });
                    // console.log("分享成功");
                    // alert("分享配置成功");
                },
                cancel: function (res) {
                },
                fail: function (res) {
                    // alert("wx.error" + JSON.stringify(res));
                    console.log("wx.error" + JSON.stringify(res))
                }
            });
            // 2.2 监听“分享到朋友圈”按钮点击、自定义分享内容及分享结果接口
            wx.updateTimelineShareData({
                title: sendDescribe,//'评估产品分享到朋友圈title测试',
                link:wxApiUtil.config.share_url,//"http://www.zmhkedu.com/web/websiteMove/weixinShareTest.html?suid="+_UserObject.user_id,
                imgUrl: sendImgurl,
                trigger: function (res) {
                },
                success: function (res) {
                    //给出"分享成功"提示信息或不做任何操作
                    // layer.msg("分享成功",{//，当前分享人："+getUrlPara("uid"), {
                    //     icon: 1,
                    //     time: 3000
                    // });
                    // console.log("分享成功");
                },
                cancel: function (res) {
                },
                fail: function (res) {
                    // alert("wx.error" + JSON.stringify(res));
                    console.log("wx.error" + JSON.stringify(res))
                }
            });
            wx.error(function (res) {
                // alert("wx.error" + JSON.stringify(res));
                console.log("wx.error" + JSON.stringify(res))
            });
        });
    }
};
