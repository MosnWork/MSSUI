define(function(require, exports, module) {
    return {
        init: function() {
            //初始化新增原型
            $(function() {
                //indexof---数组存在原型，判定是否存在数组中，用于IE7及以下
                if (!Array.indexOf) {
                    Array.prototype.indexOf = function(obj) {
                        for (var i = 0; i < this.length; i++) {
                            if (this[i] == obj) {
                                return i;
                            }
                        }
                        return -1;
                    }
                }
                //待续
            })

            var _type = ["msg", "tips", "dialog", "ajax", "iframe", "loading", "prompt"];


            /**
             * 默认配置
             * @config  参数
             */
            var _config = {
                type: "dialog", //弹出层类型
                mask: false, //遮罩
                width: 0, //弹出层宽度 0表示自动
                height: 0, //弹出层高度 0表示自动
                background: "none", //实际内容框架背景色
                icon: "", //需要加的特殊图标示意   <i class='icon-warning-sign fn-cl-Orange'></i>   橙色警告图标
                skin: '', //皮肤 className
                time: 0, //延时消失 0表示不自动关闭
                animatime: "", //进入动画
                move: false, //是否可拖动
                callback: "", //弹出层回调事件
                title: '', //标题名称
                buttons: [], //按钮层//增加回调函数
                content: "", //内容
                origin: "html", //内容来源  html  ajax  iframe
                url: "" //origin为ajax、iframe时生效
            };


            //一些内置参数
            var _inlay = {
                dom: false //当前对象DOM对象
            }

            //CSS脱离
            var _class = {
                //基础
                mask: "mss-dialog-shade", //遮罩
                radius: "mss-dialog-radius", //圆角
                shadow: "mss-dialog-shadow", //投影
                animated: "animated", //动画
                content: "mss-dialog-content", //提示信息
                //分类
                msg: "mss-dialog-msg", //提示信息
                other: ""
            }









            /**
             * 弹出信息
             * @name    msg
             * @param   {String}            模板名
             * @param   {Boolean}           是否可以点击
             * @param   {Funciton}          回调函数
             * @return  --                  无返回
             */
            var msg = function(op) {
                if (_inlay.dom.length > 0) {
                    _inlay.dom.remove();
                }
                var options = {};
                //合并参数
                if (op && typeof op === 'object') {
                    options = $.extend({
                        content: "",
                        mask: false,
                        time: 3000,
                        icon: "",
                        color: "",
                        background: "none",
                        click: false,
                        animatime: "",
                        callback: ""
                    }, op)
                } else {
                    console.log("参数初始化失败");
                }
                var getHtml = _getHtml("msg", options.mask, options.content, options.animatime);
                _inlay.dom = $(getHtml).appendTo("body");
                _offset(_inlay.dom, 0, 0, "msg");
                //console.log(options.time);
                if (parseInt(options.time) > 0) {
                    var st = setTimeout(function() {
                        _inlay.dom.fadeOut(500, function() {
                            _inlay.dom.remove();
                            if (typeof(options.callback) == "function") {
                                options.callback();
                            }
                        })
                    }, parseInt(options.time));
                }
                if (options.click == true) {
                    _inlay.dom.click(function() {
                        if (parseInt(options.time) > 0) {
                            clearTimeout(st);
                        }
                        _inlay.dom.fadeOut(500, function() {
                            _inlay.dom.remove();
                            if (typeof(options.callback) == "function") {
                                options.callback();
                            }
                        })
                    });
                }
            }


            /**
             * 弹出提示
             * @name    _getHtml
             * @param   {String}            模板类型
             * @param   {Boolean}           遮罩层
             * @param   {data}              json,string,根据实际类容来判定--初始化数据数据
             * @param   {String}            Class 绑定动画或者皮肤加载
             * @return  {html}              HTML代码
             */
            var _getHtml = function(type, bool, data, className) {
                var html = "";
                //判断是否加入遮罩层
                if (bool == true) {
                    html += "<div class=\"" + _class.mask + "\"\ style=\"height:" + $(document).outerHeight(true) + "px\"></div>";
                }
                //根据类型返回实际内容
                //data==字符串
                if (type == "msg") {
                    html += "<div class=\"" + _class.msg + " " + _class.radius + " " + _class.shadow + " " + _class.animated + " " + className + "\"><div  class=\"" + _class.content + "\" style=\"background:"
                    none ";\">" + data + "</div></div>";
                }
                return html;
            }

            /**
             * 计算坐标
             * @name    _offset
             * @param   {Object}            计算对象
             * @param   {width}             用户设定宽度
             * @param   {height}            用户设定高度
             * @param   {String}            类型
             * @return  --                  无
             */
            var _offset = function(obj, w, h, type) {
                var ow = obj.outerWidth();
                var oh = obj.outerHeight();
                if (type == "msg") {
                    ow = ow > document.documentElement.clientWidth * 0.5 ? document.documentElement.clientWidth * 0.5 : ow;
                    oh = oh > document.documentElement.clientHeight * 0.8 ? document.documentElement.clientHeight * 0.8 : oh;
                    obj.css({
                        "width": (ow - 10) + "px",
                        "height": (oh - 10) + "px",
                        "margin-left": "-" + ow / 2 + "px",
                        "margin-top": "-" + oh / 2 + "px"
                    });
                    obj.show();
                }
            }

            /**
             * 关闭当前对象
             * @name    _offset
             * @param   {Object}            计算对象
             * @param   {width}             用户设定宽度
             * @param   {height}            用户设定高度
             * @param   {String}            类型
             * @return  --                  无
             */
            var destroy = function() {
                _inlay.dom.remove();
            }

            //-----------------------
            // 对外接口
            //-----------------------
            return {　
                msg: msg, //弹出提示
                destroy: destroy //关闭对象
            };
        }
    }
});