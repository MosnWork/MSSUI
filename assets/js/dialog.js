define(function(require, exports, module) {
    return {
        init: function() {
            //
            // 所有 下划线方法为内置，不暴露
            //

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

            /**
             * 默认配置
             * @config  参数
             */
            var _options = {
                type: "dialog", //弹出层类型
                mask: false, //遮罩
                width: 0, //弹出层宽度 0表示自动
                height: 0, //弹出层高度 0表示自动
                icon: "", //需要加的特殊图标示意   <i class='icon-warning-sign fn-cl-Orange'></i>   橙色警告图标
                skin: '', //皮肤 className
                padding: -1, //内容主体默认边距//，tips，prompt，load 默认为：20，dialog，ajax 默认为：10  msg,iframe 默认为：0
                time: 0, //延时消失 0表示不自动关闭
                animatime: "", //进入动画
                close: true, //是否可拖动
                move: false, //是否可拖动
                callback: "", //弹出层回调事件
                title: '', //标题名称
                buttons: [], //按钮层//增加回调函数
                content: "", //内容
                url: "" //origin为ajax、iframe时生效
            }

            //一些内置参数
            var _inlay = {
                dom: "", //当前对象DOM对象
                mask: "",
                button: "", //按钮框
                index: 0, //层次
                padding: ["msg", "tips", "loading"], //需要增加边距的类型
                type: ["msg", "tips", "dialog", "ajax", "iframe", "load", "prompt"]
            }

            //CSS脱离
            var _class = {
                //基础
                mask: "mss-dialog-shade", //遮罩
                radius: "mss-dialog-radius", //圆角
                padding: "mss-dialog-padding", //边距
                shadow: "mss-dialog-shadow", //投影
                animated: "animated", //动画
                //分类
                box: "mss-dialog-box", //载体
                title: "mss-dialog-title", //标题
                close: "mss-dialog-close", //关闭
                content: "mss-dialog-content", //实际内容框
                buttons: "mss-dialog-button", //按钮框
                button: "mss-dialog-btn", //实际按钮
                marginLeftRight: "fn-mlr10",
                input: "mss-form-input-txt", //prompt模式下输入框的样式
                other: ""
            }

            //内置加载条动画
            var _animated = [{
                html: "<div style=\"position: absolute;left:50%;margin-left:-30px;top:50%;margin-top:-12px;height:24px;width:60px;\"><img src=\"../../assets/images/loading-0.gif\" border=\"0\"></div>"
            }]

            /**
             * 初始化
             * @name    init
             * @param   {String}            模板名
             * @param   {Boolean}           是否可以点击
             * @param   {Funciton}          回调函数
             * @return  --                  无返回
             */
            var dialog = function(ops) {

                //当前函数二次初始化时，先重置所有参数
                destroy();
                if (ops && typeof ops === 'object') {
                    $.extend(_options, ops);
                }
                try {
                    if (_inlay.type.indexOf(_options.type) < 0) {
                        console.log("未指定类型");
                        _resetting();
                        return false;
                    }


                    console.log(_options);


                    //声明层次
                    _index();
                    //验证数据
                    _validate();
                    //建立遮罩
                    if (_options.mask == true) {
                        _inlay.mask = $("<div class=\"" + _class.mask + "\"\ style=\"height:" + $(document).outerHeight(true) + "px;z-index:" + _inlay.index + "\"></div>").appendTo("body");
                    }
                    //建立数据模型
                    _inlay.dom = $(_view()).appendTo("body");
                    if (_options.buttons.length > 0) {
                        _inlay.button = $(_button()).appendTo(_inlay.dom);
                    }
                    //校正偏移量
                    _offset();
                    //绑定事件
                    _addEvent();
                    //导入数据
                    if (_options.type == "ajax") {
                        _getUrl();
                    }
                    //最终展示
                    _inlay.dom.show();
                } catch (ex) {
                    console.log(ex);
                }
            }

            /**
             * 渲染主框架
             * @name    _view
             * @return  {Html}           HTML代码
             */
            var _view = function() {
                var html = "";
                //宽高
                var style = "";
                if (_options.width > 0) {
                    style += "width:" + _options.width + "px;";
                }
                if (_options.height > 0) {
                    style += "height:" + _options.height + "px;";
                }
                //部分功能增加边距---进行体识别
                var padding = _options.type == "msg" ? _class.padding + " " + _class.radius : "";
                var loadingbg = "";
                //主体
                html += "<div class=\"" + _class.box + " " + _class.shadow + " " + padding + " " + _class.animated + " " + _options.animatime + " " + _options.skin + "\" style=\"z-index:" + (_inlay.index + 1) + ";" + style + loadingbg + "\">";
                //判定标题
                //判定可移动
                var move = _options.move == true ? "mss-Drag='true'" : "";
                if (_options.title != "") {
                    html += "<div class=\"" + _class.title + "\" " + move + ">" + _options.icon + _options.title + "</div>";
                }
                //msg 背景空掉
                var bgcolor = (_options.type == "msg" || _options.type == "load") ? "background:none;" : "";
                var edge = "padding:" + _options.padding + "px;";
                //添加实际内容
                html += "<div class=\"" + _class.content + "\" style=\"" + bgcolor + edge + "\">" + _options.content + "</div>";
                //添加关闭
                if (_options.close == true) {
                    html += "<div class=\"" + _class.close + "\">X</div>";
                }
                //主体尾
                html += "</div>";
                return html;
            };

            /**
             * 渲染按钮
             * @name    _button
             * @return  {Html}           HTML代码
             */
            var _button = function() {
                var html = "";
                html += "<div class=\"" + _class.buttons + "\">";
                for (var i = 0; i < _options.buttons.length; i++) {
                    html += "<button  class=\"" + _class.button + " " + _class.marginLeftRight + " " + _options.buttons[i].elCls + "\">" + _options.buttons[i].text + "</button>";
                }
                html += "</div>";
                return html;
            };

            /**
             * 校正偏移
             * @name    _offset
             */
            var _offset = function() {
                var w = _inlay.dom.outerWidth();
                var cw = w - _inlay.dom.width();
                var h = _inlay.dom.outerHeight();
                var ch = h - _inlay.dom.height();
                w = w > document.documentElement.clientWidth * 0.8 ? document.documentElement.clientWidth * 0.8 : w;
                h = h > document.documentElement.clientHeight * 0.8 ? document.documentElement.clientHeight * 0.8 : h;
                var th = _inlay.dom.find("." + _class.title).length > 0 ? parseInt(_inlay.dom.find("." + _class.title).outerHeight(true)) : 0;
                var bh = _inlay.button == "" ? 0 : _inlay.button.outerHeight(true);
                _inlay.dom.css({
                    "width": (w - cw) + "px",
                    "height": (h - ch) + "px",
                    "margin-left": "-" + w / 2 + "px",
                    "margin-top": "-" + h / 2 + "px"
                });
                _inlay.dom.find("." + _class.content).css({
                    "height": (h - ch - th - bh - parseInt(_inlay.dom.find("." + _class.content).css("padding-top")) * 2) + "px"
                });
            };

            /**
             * 声明层次
             * @name    _index
             */
            var _index = function() {
                //var indexlist = $("body").find("*");取得所有元素
                var indexlist = $("body").find("." + _class.box);
                for (var i = 0; i < indexlist.length; i++) {
                    _inlay.index = parseInt($(indexlist[i]).css("z-index")) > _inlay.index ? parseInt($(indexlist[i]).css("z-index")) : _inlay.index;
                }
                _inlay.index = _inlay.index < 1000 ? 1000 : _inlay.index;
                _inlay.index += 1;
            };

            /**
             * 变量重置
             * @name    _resetting
             * @return  {Boolean}           验证结果
             */
            var _validate = function() {
                if (_options.type == "msg") {
                    if (_options.content == "") {
                        return false;
                    }
                    //校正部分参数
                    _options.mask = false;
                    _options.close = false;
                    _options.width = 0;
                    _options.height = 0;
                    _options.move = false;
                    _options.title = '';
                    _options.buttons = [];
                    if (_options.padding < 0) {
                        _options.padding = 0;
                    }
                }
                if (_options.title == "") {
                    _options.close = false;
                }
                if (_options.type == "tips") {
                    if (_options.padding < 0) {
                        _options.padding = 20;
                    }
                }
                if (_options.type == "load") {
                    _options.content = _animated[0].html;
                    _options.width = 200;
                    _options.height = 100;
                    _options.mask = false;
                    _options.close = false;
                    _options.move = false;
                    _options.callback = "";
                    _options.title = '';
                    _options.buttons = [];
                    if (_options.padding < 0) {
                        _options.padding = 20;
                    }
                }
                if (_options.type == "dialog") {
                    if (_options.padding < 0) {
                        _options.padding = 10;
                    }
                }
                if (_options.type == "ajax") {
                    _options.content = _animated[0].html;
                    if (_options.padding < 0) {
                        _options.padding = 10;
                    }
                }
                if (_options.type == "prompt") {
                    _options.content = "<input type=\"text\" class=\"" + _class.input + "\"/>";
                    if (_options.padding < 0) {
                        _options.padding = 20;
                    }
                }
                if (_options.type == "iframe") {
                    _options.content = "<iframe src=\"" + _options.url + "\" width=\"100%\" height=\"100%\" frameborder=\"0\"> </iframe>";
                    if (_options.padding < 0) {
                        _options.padding = 0;
                    }
                }
                return false;
            };

            /**
             * 变量重置
             * @name    _resetting
             */
            var _resetting = function() {
                _options.type = "dialog";
                _options.mask = false;
                _options.width = 0;
                _options.height = 0;
                _options.background = "none";
                _options.padding = -1;
                _options.icon == "";
                _options.skin = '';
                _options.time = 0;
                _options.animatime = "";
                _options.move = false;
                _options.callback = "";
                _options.title = '';
                _options.buttons = [];
                _options.content = "";
                _options.origin = "html";
                _options.url = "";
                _inlay.dom = "";
                _inlay.mask = "";
            }

            /**
             * 绑定事件
             * @name    _addEvent
             */
            var _addEvent = function() {
                //关闭
                if (_options.close == true) {
                    _inlay.dom.find("." + _class.close).click(function() {
                        if (_inlay.mask.length > 0) {
                            _inlay.mask.remove();
                        }
                        _inlay.dom.remove();
                        if (typeof(_options.callback) == "function") {
                            _options.callback();
                        }
                        _resetting();
                    })
                }
                //遮罩层
                if (_inlay.mask != "") {
                    _inlay.mask.click(function() {
                        if (_inlay.mask.length > 0) {
                            _inlay.mask.remove();
                        }
                        _inlay.dom.remove();
                        if (typeof(_options.callback) == "function") {
                            _options.callback();
                        }
                        _resetting();
                    })
                }
                //按钮
                if (_inlay.button.length > 0) {
                    _inlay.dom.find("." + _class.button).each(function(i) {
                        //$(this).attr("mss-dialog-index",i);
                        var index = i;
                        //增加原型
                        var baseClose = function() {
                            this.close = function() {
                                if (arguments.length > 0 && arguments[0] == true) {
                                    if (typeof(_options.callback) == "function") {
                                        _options.callback();
                                    }
                                }
                                destroy();
                            }
                        }
                        $(this).click(function() {
                            _options.buttons[i].handler.prototype = new baseClose();
                            var instance = new _options.buttons[i].handler();
                            if (_options.type == "prompt") {
                                instance.callback(_inlay.dom.find("." + _class.input).val());
                            } else {
                                instance.callback();
                            }
                        })
                    })
                }
                //延迟关闭
                if (_options.time > 0) {
                    setTimeout(function() {
                        if (_inlay.dom != "") {
                            if (arguments.length > 0 && arguments[0] == true) {
                                if (typeof(_options.callback) == "function") {
                                    _options.callback();
                                }
                            }
                            destroy();
                        }
                    }, parseInt(_options.time))
                }
                //修正弹出层层次
                if (_options.type == "msg") {
                    _inlay.dom.click(function() {
                        if (typeof(_options.callback) == "function") {
                            _options.callback();
                        }
                        destroy();
                    });
                } else if (_options.close == false && _options.buttons.length == 0 && _options.mask == false && _options.type != "load") {
                    _inlay.dom.click(function() {
                        if (typeof(_options.callback) == "function") {
                            _options.callback();
                        }
                        destroy();
                    });
                } else {
                    _inlay.dom.click(function() {
                        _index();
                        _inlay.dom.css({
                            "z-index": _inlay.index
                        });
                    });
                }
            }

            /**
             * 异步事件
             * @name    _getUrl
             */
            var _getUrl = function() {
                $.ajax({
                    type: "get",
                    url: _options.url,
                    dataType: "html",
                    async: true,
                    success: function(data) {
                        if (_inlay.dom.length > 0) {
                            _inlay.dom.find("." + _class.content).html(data);
                        }
                    },
                    error: function() {
                        if (_inlay.dom.length > 0) {
                            _inlay.dom.find("." + _class.content).html("Ajax Failure!");
                        }
                    }
                })
            }


            /**
             * 销毁
             * @name    destroy
             */
            var destroy = function() {
                //删除当前对象
                if (_inlay.dom.length > 0) {
                    _inlay.dom.remove();
                }
                //删除遮罩
                if (_inlay.mask.length > 0) {
                    _inlay.mask.remove();
                }
                //删除按钮
                if (_inlay.button.length > 0) {
                    _inlay.button.remove();
                }
                //销毁当前对象后继续重置所有参数
                _resetting();
            }

            //-----------------------
            // 对外接口
            //-----------------------
            return {　
                dialog: dialog,
                destroy: destroy
            }
        }
    }
});