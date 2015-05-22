/**
 * MSS_Iframe.js
 * Mosn 2015.4.16
 * From MosnWork
 */

/*
@ 主函数 MSS_Iframe
@ init 初始化
*/
var MSS_Iframe = (function() {
    //---------------------
    // 初始参数
    //---------------------
    var options = {
        menuDate: [], //全局数据对象
        isTop: false, //是否需要顶部导航
        icon: "icon-file" //自定义图标
    }
    var quantity = 0;
    //---------------------
    // 初始化配置
    //---------------------
    var init = function(opsg) {
        //合并参数
        if (opsg && typeof opsg === 'object') {
            $.extend(options, opsg);
        }
        quantity = 0;
        //给JQ新增一个发放
        addJsonFind();
        //初始化绑定控制事件
        bindingEvents();
        //不需要顶部导航先删除DOM，放下下面初始化会有bug
        //导航也不能放在这里，不然页面会出BUG，无语啊
        if (opsg.isTop == false) {
            $(".h-nav").remove();
        }
        //---------------------
        // 为了兼容没用media 用css样式控制自适应
        //---------------------
        //启动开始
        mediaChange();
        //改变响应
        window.onresize = function() {
            mediaChange();
        }
        //---------------------
        // 自适应结束
        //---------------------
        //判断是否需要顶部导航
        if (opsg.isTop == true) {
            treeTop(); //执行顶部方式
        } else {
            navTree(options.menuDate); //执行左侧方式
        }

        //看看有没有已经打开的记录，有的话就全部打开
        if (setCookie("mssNav") == undefined || setCookie("mssNav") == "" || setCookie("mssNav") == "undefined" || setCookie("mssNav") == "null" || setCookie("mssNav") == null) {
            if (setCookie("mssopen") == undefined || setCookie("mssopen") == "" || setCookie("mssopen") == "undefined" || setCookie("mssopen") == "null" || setCookie("mssopen") == null) {
                setCookie("mssNav", null);
                setCookie("mssopen", "-1");
            } else {
                var oldID = setCookie("mssopen").split(",");
                setCookie("mssNav", null);
                reduction(oldID);
            }
        } else {
            var oldID = setCookie("mssNav").split(",");
            setCookie("mssNav", null);
            reduction(oldID);
        }
    };

    //---------------------
    // reduction 还原已打开
    //---------------------
    var reduction = function(openArr) {
        //递归找到原来打开的再打开
        doExchange(options.menuDate, openArr);
        //这里玩下原始的当前页
        if (setCookie("mssopen") == undefined || setCookie("mssopen") == "" || setCookie("mssopen") == "undefined" || setCookie("mssopen") == "null" || setCookie("mssopen") == null) {
            changeSelect("-1");
        } else {
            changeSelect(setCookie("mssopen"));
        }
    }

    //---------------------
    // doExchange 递归找已经打开的
    //---------------------
    var doExchange = function(data, isArr) {
        for (var i = 0; i < data.length; i++) {
            if (isArr.indexOf(data[i].id.toString()) >= 0) {
                outcomeUrl(data[i].id.toString(), data[i].text, data[i].href);
            }
            doExchange(data[i].nodes, isArr);
        }
    }

    //---------------------
    // bindingEvents 绑定事件
    //---------------------
    var bindingEvents = function() {
        //工作区导航点击选择
        $(".iframe-nav-box").delegate("dt", "click mousedown", function(e) {
            //右击事件
            if (e.which == 3) {
                e ? e.stopPropagation() : event.cancelBubble = true;
                writeYmenu($(this), e.pageX, e.pageY, $(this).attr('mss-id'));
            } else {
                //去打开iframe
                changeSelect($(this).attr('mss-id'));
            }
        });

        //点击除指定外，隐藏
        $(document).on("click", function(e) { //点击除指定input外，隐藏
            if ($(e.target).parents(".iframe-nav-box").length > 0 || $(e.target).parents(".right-click-menu").length > 0) {

            } else {
                $(".right-click-menu").remove();
            }
        });

        //回首页
        $(".h-nav-home").click(function() {
            changeSelect("-1");
        });
        
        //关闭工作区导航的右击菜单
        $(".iframe-nav-box").on("contextmenu", function(e) {
            return false;
        });
        //左右移动事件
        $(".iframe-nav-left").click(function() {
            quantity--;
            changeMove();
        });
        $(".iframe-nav-right").click(function() {
            quantity++;
            changeMove();
        });
        //关闭选择页面
        $(".iframe-nav-box").delegate(".icon-remove", "click", function(e) {
            e ? e.stopPropagation() : event.cancelBubble = true;
            //当前id
            var did = $(this).parent().attr("mss-id");
            //如果当前页打开，找到他的前一个打开
            if ($(this).parent().hasClass("current")) {
                $(this).parent().prev().click();
                setCookie("mssopen", $(this).parent().prev().attr("mss-id"));
            }

            //关闭掉当前
            var $ctn = $(".iframe-nav-box").find("dt");
            for (var i = 0; i < $ctn.length; i++) {
                if ($($ctn[i]).attr("mss-id") == did) {
                    $($ctn[i]).remove();
                }
            }
            var $cbn = $(".iframe-box").find("li");
            for (var i = 0; i < $cbn.length; i++) {
                if ($($cbn[i]).attr("mss-id") == did) {
                    $($cbn[i]).remove();
                }
            }
            //到cookie里面去移除一下
            var hasopen = setCookie("mssNav").split(",");
            for (var i = 0; i < hasopen.length; i++) {
                if (hasopen[i] == did) {
                    hasopen.splice(i, 1);
                }
            }
            setCookie("mssNav", hasopen.join(","));
        });
    }

    //左右开始计算正式移动
    var changeMove = function() {
        if (quantity < 0) {
            quantity = 0;
        }
        if (quantity > $(".iframe-nav-box").find("dt").length) {
            quantity = $(".iframe-nav-box").find("dt").length;
        }
        var moveX = getNavWidth(quantity);
        var fuLLx = getNavWidth($(".iframe-nav-box").find("dt").length);
        //保证不超越最大可偏移量
        moveX = moveX > (fuLLx - ($(".iframe-nav-box").width() - 30)) ? (fuLLx - ($(".iframe-nav-box").width() - 30)) : moveX;
        //保证不低于最小偏移量
        moveX = moveX < 0 ? 0 : moveX;
        moveX = fuLLx < ($(".iframe-nav-box").width() - 30) ? 0 : moveX;
        $(".iframe-nav-box dl").stop().animate({
            "left": moveX * -1 + "px"
        }, 500);
        //校正数为0的数量
        if (quantity == 0) {
            $(".iframe-nav-box dl").stop().animate({
                "left": "0px"
            }, 500);
        }
    }

    //---------------------
    // changeSelect 根据ID打开当前页
    //---------------------
    var changeSelect = function(id) {
        //设置当前打开iframe cookie
        setCookie("mssopen", id);
        var dangi = 0;
        var $tn = $(".iframe-nav-box").find("dt");
        for (var i = 0; i < $tn.length; i++) {
            if ($($tn[i]).attr("mss-id") == id) {
                dangi = i;
                $($tn[i]).addClass("current").siblings().removeClass("current");
            }
        }
        var $bn = $(".iframe-box").find("li");
        for (var i = 0; i < $bn.length; i++) {
            if ($($bn[i]).attr("mss-id") == id) {
                $($bn[i]).addClass("current").siblings().removeClass("current");
            }
        }
        //校正当前页是否在可显示区域
        //当前偏移区域
        var dl = Math.abs(parseInt($(".iframe-nav-box dl").css("left")));
        //最大偏移区域
        var ml = getNavWidth(dangi);

        if (dl > ml) {
            for (var i = 0; i < 9999; i++) {
                quantity--;
                if (getNavWidth(quantity) < ml) {
                    break;
                }
            }
            quantity--;
        }
        if (dl + $(".iframe-nav-box").width() - 30 < ml) {
            for (var i = 0; i < 9999; i++) {
                quantity++;
                if (getNavWidth(quantity) + $(".iframe-nav-box").width() - 30 >= ml) {
                    break;
                }
            }
            quantity++;
        }
        changeMove();
    }

    //---------------------
    // getNavWidth 获取移动导航的最大宽度
    //---------------------
    var getNavWidth = function(p) {
        var ln = $(".iframe-nav-box").find("dt");
        var width = 0;
        for (var i = 0; i < p; i++) {
            width += $(ln[i]).outerWidth(true);
        }
        return width;
    }

    //---------------------
    // treeTop 顶部菜单
    //---------------------
    var treeTop = function() {
        //开始写入顶部菜单
        var html = '<div class=\"h-nav-box\"><ul>';
        for (var i = 0; i < options.menuDate.length; i++) {
            html += "<li mss-key='" + options.menuDate[i].id + "'>" + options.menuDate[i].text + "</li>";
        }
        html += "</ul></div>";
        var topItem = $(html).appendTo(".h-nav");
        //计算下UL的宽度为了给手机做滑动
        var ulw = 10;
        topItem.find("li").each(function() {
            ulw += $(this).outerWidth(true);
        });
        //跟正UL的宽度
        $(topItem.find("ul")[0]).css({
            "width": ulw + "px"
        });
        //绑定事件
        topItem.on("click", "li", function() {
            $(this).addClass("current").siblings().removeClass("current");
            navTree(options.menuDate.findObj("id", $(this).attr("mss-key")).nodes);
        })
        $(topItem.find("li")[0]).click();
    }

    //---------------------
    // navTree 左侧菜单  如果顶级的图标你想替换的话 这里可以改的
    //---------------------
    var navTree = function(tdata) {
        //开始写入左侧菜单
        var navHtml = "<ul>";
        for (var i = 0; i < tdata.length; i++) {
            navHtml += "<li>";
            if (tdata[i].href == "") {
                navHtml += "<p><i class=\"" + options.icon + "\"></i>" + tdata[i].text + "</p>";
            } else {
                navHtml += "<p><i class=\"" + options.icon + "\"></i><a mss-id=\"" +
                    tdata[i].id + "\" mss-href=\"" + tdata[i].href + "\">" + tdata[i].text + "</a></p>";
            }
            navHtml += eachTree(tdata[i].nodes);
            navHtml += "</li>";
        }
        navHtml += "</ul>";
        $(".mynav").empty();
        var $ln = $(navHtml).appendTo(".mynav");

        $ln.off();
        //先绑定一个折叠的方法，这个我写的有点坑，偷懒吧
        //我把折叠的方法绑定在图标上，主要是怕文字本身有子节点需要点击就麻烦了
        $ln.on("click", "p", function() {
            var $ul = $($(this).parent().find("ul")[0]); //控制节点
            $ul.slideToggle("500");
        })
        $ln.on("click", "a", function(e) {
            //阻止冒泡
            e ? e.stopPropagation() : event.cancelBubble = true;
            //改变其他所有P标签的图标
            var hp = $ln.find("p");
            for (var i = 0; i < hp.length; i++) {
                $(hp[i]).removeClass("current");
            }
            $(this).parent().addClass("current");
            //去打开目标
            outcomeUrl($(this).attr("mss-id"), $(this).html(), $(this).attr("mss-href"));
        })
    }

    //---------------------
    // eachTree 遍历数据生成html
    //---------------------
    var eachTree = function(data) {
        if (data.length < 1) {
            return "";
        }
        var navHtml = "<ul class='list'>";
        for (var i = 0; i < data.length; i++) {
            navHtml += "<li>";
            if (data[i].href == "") {
                navHtml += "<p><i class=\"" + options.icon + "\"></i>" + data[i].text + "</p>";
            } else {
                navHtml += "<p><i class=\"" + options.icon + "\"></i><a mss-id=\"" +
                    data[i].id + "\" mss-href=\"" + data[i].href + "\">" + data[i].text + "</a></p>";
            }
            navHtml += eachTree(data[i].nodes);
            navHtml += "</li>";
        }
        navHtml += "</ul>";
        return navHtml;
    }

    //---------------------
    // outcomeUrl 生成左侧导航以及iframe
    //---------------------
    var outcomeUrl = function(id, name, iurl) {
        //判断存在性
        if (setCookie("mssNav") == undefined || setCookie("mssNav") == "" || setCookie("mssNav") == "undefined" || setCookie("mssNav") == "null" || setCookie("mssNav") == null) {
            setCookie("mssNav", id);
        } else {
            //判断是否打开
            if (setCookie("mssNav").split(",").indexOf(id) >= 0) {
                //已经打开了一个，去找到并展示
                var isln = $(".iframe-nav-box").find("dt");
                for (var i = 0; i < isln.length; i++) {
                    if ($(isln[i]).attr("mss-id") == id) {
                        $(isln[i]).click();
                        break;
                    }
                }
                return false;
            }
            setCookie("mssNav", setCookie("mssNav") + "," + id);
        }
        //开始写入右侧
        //写入菜单
        var nhtml = "<dt mss-id=\"" + id + "\">" + name + "<i class=\"icon-remove\"></i></dt>";
        var $fn = $(nhtml).appendTo($(".iframe-nav").find("dl"));
        //写入Iframe
        var ihtml = "<li mss-id=\"" + id + "\"><iframe width=\"100%\" height=\"100%\" frameborder=\"0\" src=\"" + iurl + "\"></iframe></li>";
        $(".iframe-box").append(ihtml);
        $fn.click();
    }

    //---------------------
    // writeYmenu 右击菜单
    //---------------------
    var writeYmenu = function(obj, x, y, key) {
        $(".right-click-menu").remove();
        var html = "<div class='right-click-menu' style='left:" + x + "px;top:" + y + "px;'><ul>";
        html += "<li data-handle='refresh'><i class='icon-refresh'></i>刷新当前页</li>";
        html += "<li data-handle='remove'><i class='icon-remove'></i>关闭当前页</li>";
        html += "<li data-handle='left'><i class='icon-remove-sign'></i>关闭左侧</li>";
        html += "<li data-handle='right'><i class='icon-remove-sign'></i>关闭右侧</li>";
        html += "</ul></div>";
        var Ymenu = $(html).appendTo("body");
        Ymenu.on("click", "li", function(e) {
            //阻止冒泡
            e ? e.stopPropagation() : event.cancelBubble = true;
            var $li = $(e.target).attr("data-handle");
            Ymenuhandle($li, key);
        });
    }

    //---------------------
    // Ymenuhandle 右击菜单操作
    //---------------------
    var Ymenuhandle = function(hal, key) {
        //当前tabs
        var ifs = $(".iframe-box").find("li");
        var ils = $(".iframe-nav-box").find("dt");
        switch (hal) {
            case "refresh":
                //找到节点刷新
                for (var i = 0; i < ifs.length; i++) {
                    if ($(ifs[i]).attr("mss-id") == key) {
                        $(ifs[i]).find("iframe")[0].contentWindow.location.reload(true);
                    }
                }
                break;
            case "remove":
                //找到节点删除
                for (var i = 0; i < ils.length; i++) {
                    if ($(ils[i]).attr("mss-id") == key) {
                        $(ils[i]).find(".icon-remove").click();
                    }
                }
                break;
            case "left":
                //找到节点删除
                for (var i = 1; i < ils.length; i++) {
                    if ($(ils[i]).attr("mss-id") == key) {
                        break;
                    } else {
                        $(ils[i]).find(".icon-remove").click();
                    }
                }
                //找到当前选中的校正一下滑动
                var ipls = $(".iframe-nav-box").find("dt");
                for (var i = 1; i < ipls.length; i++) {
                    if ($(ipls[i]).hasClass("current")) {
                        $(ipls[i]).click();
                        break;
                    }
                }
                break;
            case "right":
                //找到节点删除
                var isclode = false;
                for (var i = 1; i < ils.length; i++) {
                    if (isclode == true) {
                        $(ils[i]).find(".icon-remove").click();
                    }
                    if ($(ils[i]).attr("mss-id") == key) {
                        isclode = true;
                    }
                }
                break;
        }
        $(".right-click-menu").remove();
    }

    //---------------------
    // media  自适应，NND 引用插件不合算就用JS做吧
    //---------------------
    var mediaChange = function() {
        //这个是计算工作区大小的，15是工作区上下padding的大小
        $(".main").css({
            "height": $(window).height() - $(".header").height() - 15 + "px"
        });

        $(".iframe-box").css({
            "height": $(".myiframe").height() - 30 + "px"
        });


        //自动适应的 一般用CSS就可以改好，尽量别动
        if ($(window).width() < 480) {
            $(".h-info").find("span").addClass("media");
            $(".h-nav-user").addClass("h-nav-user-media");
            $(".h-nav-box").addClass("h-nav-box-media");
        } else {
            $(".h-info").find("span").removeClass("media");
            $(".h-nav-user").removeClass("h-nav-user-media");
            $(".h-nav-box").removeClass("h-nav-box-media");
        }

        //这里有个25是外层padding+内层一个margin的大小
        if ($(window).width() < 640) {
            $(".mynav").addClass("mynav-media");
            $(".mywork").addClass("mywork-media");
            $(".mywork").css({
                "height": $(window).height() - $(".header").height() - 25 - $(".mynav").height() + "px"
            });
            $(".myiframe").addClass("myiframe-media");
        } else {
            $(".mynav").removeClass("mynav-media");
            $(".mywork").removeClass("mywork-media");
            $(".mywork").css({
                "height": "100%"
            });
            $(".myiframe").removeClass("myiframe-media");
        }
    }

    //---------------------
    // addJsonFind  根据key  val 找到JSON数组里面符合条件的第一个JSON对象  如果没找到返回空对象
    //---------------------
    var addJsonFind = function() {
        Array.prototype.findObj = function(fkey, fval) {
            var thisJson = this;
            for (var i = 0; i < thisJson.length; i++) {
                var xobj = thisJson[i];
                for (var key in xobj) {
                    if (key == fkey) {
                        if (xobj[key] == fval) {
                            return xobj;
                        }
                    }
                }
            }
            return {};
        }
    }

    //---------------------
    // setCookie   Cookie操作
    //---------------------
    var setCookie = function(b, j, m) {
        if (typeof j != "undefined") {
            m = m || {};
            if (j === null) {
                j = "";
                m.expires = -1
            }
            var e = "";
            if (m.expires && (typeof m.expires == "number" || m.expires.toUTCString)) {
                var f;
                if (typeof m.expires == "number") {
                    f = new Date();
                    f.setTime(f.getTime() + (m.expires * 24 * 60 * 60 * 1000))
                } else {
                    f = m.expires
                }
                e = "; expires=" + f.toUTCString()
            }
            var l = m.path ? "; path=" + (m.path) : "";
            var g = m.domain ? "; domain=" + (m.domain) : "";
            var a = m.secure ? "; secure" : "";
            document.cookie = [b, "=", encodeURIComponent(j), e, l, g, a].join("")
        } else {
            var d = null;
            if (document.cookie && document.cookie != "") {
                var k = document.cookie.split(";");
                for (var h = 0; h < k.length; h++) {
                    var c = jQuery.trim(k[h]);
                    if (c.substring(0, b.length + 1) == (b + "=")) {
                        d = decodeURIComponent(c.substring(b.length + 1));
                        break
                    }
                }
            }
            return d
        }
    }

    //---------------------
    // openIframe   打开新窗口-对外
    //---------------------
    var openIframe = function(opsg) {
        if (opsg.title == undefined || opsg.url == undefined || opsg.key == undefined) {
            console.log("什么玩意，参数补全");
            return false;
        }
        var ifs = $(".iframe-nav-box").find("dt");
        //找到节点刷新
        var myDate = new Date();
        for (var i = 0; i < ifs.length; i++) {
            if ($(ifs[i]).attr("mss-id") == opsg.key) {
                console.log("什么玩意，参数重置");
                opsg.key = opsg.key + myDate.getTime();
            }
        }
        outcomeUrl(opsg.key, opsg.title, opsg.url);
    }

    //---------------------
    // openIframe   关闭窗口-对外
    //---------------------
    var closeIframe = function(key) {
        var ils = $(".iframe-nav-box").find("dt");
        //找到节点删除
        for (var i = 0; i < ils.length; i++) {
            if ($(ils[i]).attr("mss-id") == key) {
                $(ils[i]).find(".icon-remove").click();
            }
        }
    }

    //---------------------
    // sendMsg   全局发送一条信息-对外
    //---------------------
    var sendMsg = function(opsg) {
        var op = {
            text: "",
            background: "#ff7e00",
            color: "#ffffff",
            location: "bottom,right",
            secs: 3
        }
        //合并参数
        if (opsg && typeof opsg === 'object') {
            $.extend(op, opsg);
        }
        var pos = "";
        switch (op.location) {
            case "top,left":
                pos = "top:5px;left:5px;";
                break;
            case "top,right":
                pos = "top:5px;right:5px;";
                break;
            case "bottom,left":
                pos = "bottom:5px;left:5px;";
                break;
            case "bottom,right":
                pos = "bottom:5px;right:5px;";
                break;
            default:
                pos = "bottom:5px;right:5px;";
                break;
        }
        var msgHtml = "<div style='" + pos + "color:" + op.color + ";background:" + op.background + ";width:auto;overflow: hidden;box-sizing: border-box;max-width:50%;height:auto;padding:8px;position: absolute; z-index: 999999;border-radius: 3px;box-shadow: 0 1px 3px #cccccc;'>" + op.text + "</div>";
        var $soho = $(msgHtml).appendTo("body");
        $soho.click(function() {
            $(this).fadeOut(500, function() {
                $(this).remove()
            })
        });
        setTimeout(function() {
            $soho.click()
        }, parseInt(op.secs) * 1000);

    }

    //---------------------
    // return 可调用函数区
    //---------------------
    return {　　　　　
        init: init,
        openIframe: openIframe,
        closeIframe: closeIframe,
        sendMsg: sendMsg
    };
})();