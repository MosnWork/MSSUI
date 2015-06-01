define(function(require, exports, module) {
    //默认参数
    var options = {
        title: "MSSUI弹出层", //弹出层标题
        width: 0, //弹出层宽度
        height: 0, //弹出层高度
        mask: true, //是否需要遮罩层
        buttons: [{
            text: '自定义', //文字
            elCls: 'fn-bg-Blue', //样式
            handler: function(obj) {
                this.callback = function() {
                    if (confirm("确认要关闭？")) {
                        this.close();
                    }
                }
            }
        }, {
            text: '取消', //文字
            elCls: '', //样式
            handler: function() {
                this.callback = function() {
                    alert("s");
                }
            }
        }], //按钮层//增加回调函数
        loader: {
            isload: true, //是否异步
            isiframe: true, //是否iframe
            url: 'http://www.mui.com/app/debug/iframe.html',
            params: {
                a: 'a'
            }, //附加的参数
            ispost: true, //提交方式
            content: "" //显示内容
        } //加载数据
    };




    //---------------------
    // dialog 弹出层
    //---------------------
    var dialog = function(opsg) {
        try {
            //合并参数
            if (opsg && typeof opsg === 'object') {
                $.extend(options, opsg);
            }
            //未设置宽高定义
            if (options.width == 0) {
                options.width = parseInt(document.documentElement.clientWidth * 0.8);
            }
            if (options.height == 0) {
                options.height = parseInt(document.documentElement.clientHeight * 0.8);
            }

            //定义宽高设置

            options.width = options.width > parseInt(document.documentElement.clientWidth * 0.8) ? parseInt(document.documentElement.clientWidth * 0.8) : options.width;
            options.height = options.height > parseInt(document.documentElement.clientHeight * 0.8) ? parseInt(document.documentElement.clientHeight * 0.8) : options.height;

            var html = "";
            //判断是否需要弹出层
            if (options.mask == true) {
                html += "<div class=\"mss-mask\"\ style=\"height:" + $(document).outerHeight(true) + "px\"></div>";
            }
            //添加弹出层
            html += "<div class=\"mss-dialog\" style=\"width:" + options.width + "px;height:" + options.height + "px;margin-left:-" + options.width / 2 + "px;margin-top:-" + (document.documentElement.clientHeight / 2 + options.height) + "px;\">";

            html += "<div class=\"mss-dialog-title\" mss-Drag=\"true\"><h5 class=\"fn-text-indent\">" + options.title + "</h5></div>";

            var giveWidth = "";
            if (options.loader.isload == true && options.loader.isiframe == true) {

            } else {
                giveWidth = "width:" + parseInt(options.width - 20) + "px;padding-left:10px";
            }


            if (options.buttons.length < 1) {
                html += "<div class=\"mss-dialog-container\" style=\"height:" + (options.height - 36) + "px;" + giveWidth + "\"></div>";
            } else {
                html += "<div class=\"mss-dialog-container\" style=\"height:" + (options.height - 84) + "px;" + giveWidth + "\"></div>";
            }
            html += "</div>";
            //关闭按钮
            var closeHtml = "<div class=\"mss-dialog-close\">X</div>";
            //加到对象
            var $dialog = $(html).appendTo("body");
            var $close = $(closeHtml).appendTo($dialog.find(".mss-dialog-title"));


            //增加按钮

            if (options.buttons.length > 0) {

                $("<div class=\"mss-dialog-button\"></div>").appendTo($dialog.find(".mss-dialog-title").parent());
                try {
                    for (var i = 0; i < options.buttons.length; i++) {
                        //记录序号
                        var backI = i;
                        //增加原型
                        var baseClose = function() {
                            this.close = function() {
                                $close.click();
                            }
                        }
                        //添加按钮
                        $("<button data-button=\"" + i + "\" class=\"mss-button fn-mlr10 " + options.buttons[i].elCls + "\">" + options.buttons[i].text + "</button>").appendTo($dialog.find(".mss-dialog-button")).click(function() {
                            //讲原型增加到方法内
                            options.buttons[parseInt($(this).attr("data-button"))].handler.prototype = new baseClose();
                            var instance = new options.buttons[parseInt($(this).attr("data-button"))].handler();
                            //options.buttons[parseInt($(this).attr("data-button"))].handler();
                            instance.callback();
                        });
                    }
                } catch (ex) {
                    $("按钮配置错误").appendTo($dialog.find(".mss-dialog-button"));
                }
            }

            //动画出现
            $dialog.find(".mss-dialog-title").parent().stop().animate({
                "margin-top": options.height / 2 * -1 + "px"
            }, 300);

            //绑定关闭按钮
            $close.click(function() {
                $close.parent().parent().stop().animate({
                    "margin-top": (document.documentElement.clientHeight / 2 + options.height) * -1 + "px"
                }, 300, function() {
                    $dialog.remove();
                });
            })


            //开始添加数据了
            //累死    

            if (options.loader.isload == true) {
                //是异步

                //定义内容变量
                var $content;
                //先判断是否是iframe
                if (options.loader.isiframe == true) {
                    //拼接字符串URL
                    var $url = options.loader.url + "?";
                    for (var key in options.loader.params) {
                        $url += key + "=" + options.loader.params[key] + "&";
                    }
                    $content = $("<iframe src=\"" + $url + "\" width=\"100%\" height=\"100%\" frameborder=\"0\"> </iframe>").appendTo($dialog.find(".mss-dialog-container"));
                    //$dialog.find(".mss-dialog-container").html($content);
                } else {
                    //给自己一个遮罩
                    var $mask = $("<div class=\"mss-mask\"\><div class=\"mss-mask-load\"><i class=\"icon-spinner icon-spin\"></i>正在加载中...</div></div>").appendTo($dialog.find(".mss-dialog-container").parent());
                    $.ajax({
                        type: options.loader.ispost == true ? "post" : "get",
                        url: options.loader.url,
                        dataType: "html",
                        data: options.loader.params,
                        async: true,
                        success: function(data) {
                            if (data.status == true || data.status == "true") {
                                $dialog.find(".mss-dialog-container").html(data);
                                $mask.remove();
                            } else {
                                alert("获取数据失败");
                                $mask.remove();
                                $close.click();
                            }
                        },
                        error: function() {
                            alert("异步失败");
                            $mask.remove();
                            $close.click();
                        }
                    })
                }
            } else {
                //不是异步讲内容直接塞进去
                $dialog.find(".mss-dialog-container").html(options.loader.content);
            }
        } catch (ex) {
            console.log("弹出层插件启动失败");
        }
    }


    //返回函数区
    return {
        dialog: dialog
    }
});