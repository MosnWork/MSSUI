/**
 * MSSUI.js
 * Mosn 2015.5.27
 * From MosnWork
 *
 * 每个独立模块都加上try防止出错
 *
 */

/*
@ 主函数 MSSUI
@ init 初始化
*/
define(function(require, exports, module) {
    //定义变量
    //定义目标样式对象，所有的对象记录在这里
    var targetID = {
        dropdown: ".mss-dropdown-input", //下拉菜单
        nav: ".mss-nav-item", //导航样式
        table: ".mss-table-checkboxs", //表格多选按钮
        tab: ".mss-tab-item", //标签切换
        tag: ".mss-tag-item-remove", //Tag删除自身
        navbar: ".mss-navbar-list", //导航条
        dialog: ".mss-dialog", //可拖动层
        carousel: ".mss-carousel" //幻灯片
    }

    //临时数据
    var parameter = {
        poptipID: "", //气泡的临时ID
        dialogTarget: "", //当前拖动对象
        dragging: false, //拖动许可
        iX: 0, //以下4个为拖动参数
        iY: 0,
        mX: 0,
        m: 0,
        timers: [], //定时器
        timersDoc: [] //定时器对象
    }



    //初始化
    var init = function() {
        //下拉菜单
        dropdown();
        //导航样式
        nav();
        //气泡提示
        poptip();
        //表格组件
        table();
        //标签切换
        tab();
        //tag
        tag();
        //导航条
        navbar();
        //弹出层拖动
        dialog();
        //幻灯片
        carousel();
        //判断关闭
        closeShow();
    }


    //---------------------
    // dropdown 下拉菜单
    // 是否动态：√
    // 配置方法：
    // 启动：CLASS名：.mss-dropdown-input
    //---------------------
    var dropdown = function() {
        try {
            $("body").on("click", targetID.dropdown, function() {
                if ($(this).parent().siblings("ul").length > 0) {
                    $(this).parent().siblings("ul").show();
                    $(this).parent().siblings("ul").off();
                    $(this).parent().siblings("ul").on("click", "li", function() {
                        if ($(this).find("input").length > 0) {
                            var $vl = [];
                            var $txt = [];
                            $(this).parent().find("li").each(function() {
                                if ($(this).find("input").is(":checked")) {
                                    $vl.push($(this).attr("mss-value"));
                                    $txt.push($(this).find("span").html());
                                }
                            })
                            $(this).parent().siblings("div").find("input[type='text']").val($txt.join(","));
                            $(this).parent().siblings("div").find("input[type='hidden']").val($vl.join(","));
                        } else {
                            $(this).parent().siblings("div").find("input[type='text']").val($(this).find("span").html());
                            $(this).parent().siblings("div").find("input[type='hidden']").val($(this).attr("mss-value"));
                            $(this).parent().hide();
                        }
                    });
                } else {
                    $(this).parent().siblings("div").show();

                    //这里还有一块很重要的没做。这里应该有个触发接口给内部数据返回数据用
                }
            })
        } catch (ex) {
            console.log("下拉菜单初始化错误");
        }
    }

    //---------------------
    // nav 导航样式
    // 是否动态：√
    // 配置方法：
    // 启动：CLASS名：.mss-nav-item
    //---------------------
    var nav = function() {
        try {
            $("body").on("click", targetID.nav, function(e) {
                $(this).addClass("mss-nav-item-current").siblings().removeClass("mss-nav-item-current");
                if ($(e.target).parents(".mss-nav-nosub").length > 0) {
                    return false;
                } else {
                    if ($(e.target).parents(".mss-nav-subitem").length > 0) {
                        $(e.target).parent(".mss-nav-subitem").addClass("mss-nav-subitem-current").siblings().removeClass("mss-nav-subitem-current");
                    }
                }
                $(this).siblings().find("ul").hide();
                $(this).find("ul").show();
            })
        } catch (ex) {
            console.log("导航样式初始化错误");
        }
    }

    //---------------------
    // poptip 气泡提示
    // 是否动态：√
    // 配置方法：
    // 启动：属性：mss-poptip='true'
    // 方向：属性：mss-direction="",top,left,right,bottom
    // 提示：属性：mss-text=""
    //---------------------
    var poptip = function() {
        try {
            $("body").on("mouseover mouseout", "[mss-poptip='true']", function(e) {
                if (e.type == "mouseover") {
                    parameter.poptipID = "poptip" + stamp();
                    //获取当前元素的位置
                    var top = $(this).offset().top;
                    var left = $(this).offset().left;
                    var width = $(this).outerWidth();
                    var height = $(this).outerHeight();
                    //获取想放置的位置
                    var direction = $(this).attr("mss-direction");
                    //定义本身偏移量
                    var mycss = "left:" + left + "px;top:" + (top + height + 7) + "px";
                    //提示文字
                    var text = $(this).attr("mss-text");
                    var html = "<div id=\"" + parameter.poptipID + "\" class=\"mss-poptip\" style=\"" + mycss + "\">";
                    html += "<span class=\"mss-poptip-border\">◆</span><span class=\"mss-poptip-background\">◆</span>";
                    html += "<div class=\"mss-poptip-content\">" + text + "</div>";
                    html += "</div>";
                    var $tip = $(html).appendTo("body");
                    //校正位置
                    switch (direction) {
                        case "top":
                            $tip.addClass("mss-poptip-top");
                            $tip.css({
                                "top": top - $tip.outerHeight(true) - 7 + "px"
                            });
                            break;
                        case "left":
                            $tip.addClass("mss-poptip-left");
                            $tip.css({
                                "top": top + "px",
                                "left": left - $tip.outerWidth(true) - 7 + "px"
                            });
                            break;
                        case "right":
                            $tip.addClass("mss-poptip-right");
                            $tip.css({
                                "top": top + "px",
                                "left": left + width + 7 + "px"
                            });
                            break;
                        default:
                    }
                } else if (e.type == "mouseout") {
                    $("#" + parameter.poptipID).remove();
                }
            })
        } catch (ex) {
            console.log("气泡提示初始化错误");
        }
    }

    //---------------------
    // table 表格多选
    // 是否动态：√
    // 配置方法：
    // 启动：CLASS名：.mss-table-checkboxs
    //---------------------
    var table = function() {
        try {
            $("body").on("click", targetID.table, function() {
                var list = $(this).parents(".mss-table").find(".mss-table-checkbox");
                for (var i = 0; i < list.length; i++) {
                    if ($(this).is(":checked")) {
                        $(list[i]).attr("checked", true);
                    } else {
                        $(list[i]).attr("checked", false);
                    }
                }
            })
        } catch (ex) {
            console.log("表格多选初始化错误");
        }
    }

    //---------------------
    // table 标签切换
    // 是否动态：√
    // 配置方法：
    // 启动：CLASS名：.mss-tab-item
    //---------------------
    var tab = function() {
        try {
            $("body").on("click", targetID.tab, function() {
                $(this).addClass("mss-tab-item-current").siblings().removeClass("mss-tab-item-current");
                $($(this).parent().siblings("div").find(".mss-tab-container-item")[$(this).index()]).addClass("mss-tab-container-item-current").siblings().removeClass("mss-tab-container-item-current");
            })
        } catch (ex) {
            console.log("标签切换初始化错误");
        }
    }

    //---------------------
    // tag Tag
    // 是否动态：√
    // 配置方法：
    // 启动：CLASS名：.mss-tag-item-remove
    //---------------------
    var tag = function() {
        try {
            $("body").on("click", targetID.tag, function() {
                $(this).parent().remove();
            })
        } catch (ex) {
            console.log("标签切换初始化错误");
        }
    }

    //---------------------
    // navbar 导航条
    // 是否动态：√
    // 配置方法：
    // 启动：CLASS名：.mss-navbar-list
    //---------------------
    var navbar = function() {
        try {
            $("body").on("click mouseover mouseout", targetID.navbar + " li", function(e) {
                if (e.type == "mouseover") {
                    $(this).find(".mss-navbar-menu").show();
                } else if (e.type == "mouseout") {
                    $(this).find(".mss-navbar-menu").hide();
                } else if (e.type == "click") {
                    if ($(this).parents(".mss-navbar-menu").length <= 0) {
                        $(this).addClass("mss-navbar-active").siblings().removeClass("mss-navbar-active");
                    }
                }
            })
        } catch (ex) {
            console.log("导航条初始化错误");
        }
    }

    //---------------------
    // dialog 弹出层拖动
    // 是否动态：√
    // 配置方法：
    // 启动：属性：mss-Drag='true'
    //---------------------
    var dialog = function() {
        try {
            $("body").on("mousedown", "[mss-Drag='true']", function(e) {
                //鼠标进入区域开始绑定事件
                //给目标绑定事件
                parameter.dialogTarget = $(this).parents(targetID.dialog);
                parameter.dragging = true;
                parameter.iX = e.clientX;
                parameter.iY = e.clientY;
                parameter.mX = parseInt($(this).parents(targetID.dialog).css("margin-left"));
                parameter.mY = parseInt($(this).parents(targetID.dialog).css("margin-top"));
                $(this).setCapture && $(this).setCapture();
                return false;
            })
            document.onmousemove = function(e) {
                if (parameter.dragging) {
                    var e = e || window.event;
                    var oX = e.clientX - parameter.iX + parameter.mX;
                    var oY = e.clientY - parameter.iY + parameter.mY;

                    //左上限制
                    oX = oX < (document.documentElement.clientWidth / 2 * -1) ? (document.documentElement.clientWidth / 2 * -1) : oX;
                    oY = oY < (document.documentElement.clientHeight / 2 * -1) ? (document.documentElement.clientHeight / 2 * -1) : oY;
                    //右下限制
                    oX = (document.documentElement.clientWidth / 2 + oX + parameter.dialogTarget.outerWidth()) > document.documentElement.clientWidth ? document.documentElement.clientWidth / 2 - parameter.dialogTarget.outerWidth() : oX;
                    oY = (document.documentElement.clientHeight / 2 + oY + parameter.dialogTarget.outerHeight()) > document.documentElement.clientHeight ? document.documentElement.clientHeight / 2 - parameter.dialogTarget.outerHeight() : oY;

                    //校正偏移
                    parameter.dialogTarget.css({
                        "margin-left": oX + "px",
                        "margin-top": oY + "px"
                    });
                    return false;
                }
            };
            $(document).mouseup(function(e) {
                parameter.dragging = false;
                $("body").find("[mss-Drag='true']").each(function() {
                    $(this)[0].releaseCapture();
                })
                window.event ? window.event.cancelBubble = true : e.stopPropagation();
            })
        } catch (ex) {
            console.log("弹出层拖动初始化错误");
        }
    }

    //---------------------
    // carousel 幻灯片
    // 是否动态：X
    // 配置方法：
    // 启动：CLASS名：.mss-carousel
    // 轮播时间： 属性：mss-interval="3000" 
    // 幻灯更换时间：属性：mss-time="1000"
    //---------------------
    var carousel = function() {
        try {
            if ($("body").find(targetID.carousel).length > 0) {
                //先绑定事件点击的切换事件
                $("body").on("click", targetID.carousel + " dt.mss-carousel-move", function(e) {
                    $(this).parents(targetID.carousel).attr("mss-carousel", $(this).index());
                    $(this).addClass("mss-carousel-current").siblings().removeClass("mss-carousel-current");
                    $($(this).parent().siblings("ul").find("li")[$(this).index()]).fadeIn(parseInt($(this).attr("mss-time"))).siblings().fadeOut(parseInt($(this).attr("mss-time")));
                })
                //改变下样式
                $("body").find(targetID.carousel).each(function(i) {
                    $(this).css({
                        "height": $($(this).find("li")[0]).height() + "px"
                    });
                    $(this).attr("mss-carousel", "0");
                    $($(this).find("dt")[0]).click();

                    //给每个幻灯片单独添加定时器
                    //绑定一下定时器
                    parameter.timersDoc.push($(this));
                    parameter.timers[i] = setInterval(function() {
                        var indexSlide = parseInt(parameter.timersDoc[i].attr("mss-carousel")) + 1;
                        indexSlide = indexSlide >= parameter.timersDoc[i].find("li").length ? 0 : indexSlide;
                        $(parameter.timersDoc[i].find("li")[indexSlide]).fadeIn(parseInt(parameter.timersDoc[i].attr("mss-time"))).siblings().fadeOut(parseInt(parameter.timersDoc[i].attr("mss-time")));
                        $(parameter.timersDoc[i].find("dt")[indexSlide]).addClass("mss-carousel-current").siblings().removeClass("mss-carousel-current");
                        parameter.timersDoc[i].attr("mss-carousel", indexSlide);
                    }, parseInt(parameter.timersDoc[i].attr("mss-interval")));
                })
                window.onresize = function() {
                    $("body").find(targetID.carousel).each(function() {
                        $(this).css({
                            "height": $($(this).find("li")[0]).height() + "px"
                        })
                    })
                }
            }
        } catch (ex) {
            console.log("幻灯片初始化错误");
        }

    }

    
    //---------------------
    // closeShow 所有打开的需要关闭都在这里做判断关闭
    //---------------------
    var closeShow = function() {
        //增加页面点击事件
        $(document).on("click", function(e) {
            //下拉判断
            if ($(e.target).parents(".mss-dropdown").length <= 0) {
                $(targetID.dropdown).parent().siblings().hide();
            }
        });
    }

    //---------------------
    // stamp 时间戳-返回时间戳
    //---------------------
    var stamp = function() {
        var current = new Date();
        return current.getTime();
    }

    //返回函数区
    return {
        init: init
    }
});