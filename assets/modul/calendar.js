define(function(require, exports, module) {

    //参数
    var initialize = {
        "target": "", //针对，不写就是针对本身，找不到还是针对本身
        //"double": "false", //双日历开启---暂时不支持
        "format": "yyyy-MM-dd", //格式规则
        "min": "", //最小时间
        "max": "", //最大时间
        "today": true, //今天按钮
        "auto": true //时分秒
    }

    //时间架
    var objMe = {
        "width": 240,
        "height": 254 //不可以更改234高度为带底部工具栏/底部工具栏高度为42；
    }

    //基础时间；
    var basis;

    //语言
    var lang = {
        "today": "今天",
        "yes": "确认",
        "week": ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
        "month": ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"], //月份
        "holiday": ["8.12,国际青年节", "8.1,中国人民解放军建军节"] //懒得录入啊，自己搞
    }

    //当前展开对象
    var curObj = {};

    //html: "",时间对象
    //content: "",主体对象
    //title:"",标题对象
    //time:""//时间对象
    //left: "",左按钮对象
    //right: "",右按钮对象
    //current: ""当前对象
    //tool:""特殊区域
    //basis:"当前选中时间"
    //input:"当前选中时间"
    //begin:""当前起始时间
    //table:""//当前时间表对象
    //select:""//选择年月控件

    //---------------------
    // calendar 时间插件
    // 是否动态：√
    // 配置方法：
    // 启动：属性：mss-calender
    //
    //---------------------
    var init = function() {
        try {
            //新增常用原型
            addPrototype();
            $("body").on("click", "[mss-calender='true']", function() {
                //先清空对象以及元素
                close();
                //初始化参数
                changeInit($(this));
                //判断限制是否可行，不行就返回限制最小区间
                if (initialize.min.getTime() >= initialize.max.getTime()) {
                    curObj.input = initialize.min;
                    backInput();
                    return false;
                }
                //渲染控件骨架
                getView(initialize.target);
                //渲染内容
                //绑定基础时间-------------------未完成
                globalEvent();
                //加载时间表（加载完成后绑定时间事件）-------------------未完成
                getTable();
                //触发关闭事件
                $(document).on("click", function(e) {
                    //时间控件
                    if ($(e.target).parents(".mss-calender").length <= 0 && curObj) {
                        closeclear();
                    }
                });
                return false;
            })
        } catch (ex) {
            console.log("时间插件初始化错误");
        }
    }

    //---------------------
    // changeInit 初始当前参数
    // 参数：当前对象
    //---------------------
    var changeInit = function(el) {
        try {
            //时分秒
            initialize.auto = el.attr("mss-auto") == "true" ? true : false;
            //今天
            initialize.today = el.attr("mss-today") == "true" ? true : false;
            //双日历
            //initialize.double = el.attr("mss-double") == "true" ? "true" : "false";
            //格式化
            initialize.format = (el.attr("mss-format") != "" && el.attr("mss-format") != undefined) ? el.attr("mss-format") : "yyyy-MM-dd";
            //元素
            initialize.target = (el.attr("mss-target") != "" && el.attr("mss-target") != undefined) ? $(el.attr("mss-target")) : el;
            initialize.target = initialize.target.length > 0 ? initialize.target : el;
            //纠错一下输入框内的时间
            initialize.target.val(initialize.target.val().toDateByString(initialize.format).format(initialize.format));
            //最小时间
            var min = (el.attr("mss-min") != "" && el.attr("mss-min") != undefined) ? el.attr("mss-min") : "";
            //根据#号判断是否是针对对象，然后取值
            if (min.indexOf("#") > 0) {
                if ($(min).type == "input") {
                    min = ($(min).length > 0 && $(min).val() != "") ? $(min).val() : "";
                } else {
                    min = ($(min).length > 0 && $(min).html() != "") ? $(min).html() : "";
                }
            }
            var begin = "1800-01-01 00:00:00";
            initialize.min = min == "" ? begin.toDateByString(initialize.format) : min.toDateByString(initialize.format);
            //最大时间
            var max = (el.attr("mss-max") != "" && el.attr("mss-max") != undefined) ? el.attr("mss-max") : "";
            //根据#号判断是否是针对对象，然后取值
            if (max.indexOf("#") > 0) {
                if ($(max).type == "input") {
                    max = ($(max).length > 0 && $(max).val() != "") ? $(max).val() : "";
                } else {
                    max = ($(max).length > 0 && $(max).html() != "") ? $(max).html() : "";
                }
            }
            var end = "2999-12-31 00:00:00";
            initialize.max = max == "" ? end.toDateByString(initialize.format) : max.toDateByString(initialize.format);

        } catch (ex) {
            //console.log(ex);
            return false;
        }
    }

    //---------------------
    // getView 渲染控件骨架
    //---------------------
    var getView = function(el) {
        //确认当前基础时间
        curObj.basis = el.val().toDateByString(initialize.format);
        curObj.input = curObj.basis;
        curObj.begin = new Date(curObj.basis.getFullYear().toString() + "/" + (curObj.basis.getMonth() + 1).toString() + "/1");
        if (initialize.auto == true || initialize.today == true) {
            objMe.height = 254;
        } else {
            objMe.height = 212;
        }
        //元素定位
        var top = el.offset().top;
        var left = el.offset().left;
        //元素大小
        var width = el.outerWidth();
        var height = el.outerHeight();
        //页面带下
        var docWidth = $(document).width();
        var docHeight = $(document).height();
        //时间架定位
        var c_top = (docHeight - top - 7 - height - objMe.height < 10 && top - 7 - objMe.height > 10) ? top - 7 - objMe.height : top + height + 7;
        //var c_top = docHeight - top - 7 - height - objMe.height > 0 ? top + height + 7 : top - 7 - height;
        var c_left = docWidth - left - objMe.width > 0 ? left : docWidth - objMe.width - 10;
        //生成框架
        var html = "<div  class=\"mss-calender\" style=\"left:" + c_left + "px;top:" + c_top + "px\">";
        html += "<span class=\"mss-calender-border\">◆</span><span class=\"mss-calender-background\">◆</span>";
        html += "<div class=\"mss-calender-content\" style=\"width:" + objMe.width + "px;height:" + objMe.height + "px\">";
        //标题
        html += "<div class = \"mss-calender-title\"></div>";
        //左按钮
        html += "<div class=\"mss-calender-left\"><</div>";
        //右按钮
        html += "<div class=\"mss-calender-right\">></div>";
        //时间对象
        html += "<div class=\"mss-calender-time\"></div>";
        //特殊区域
        if (initialize.auto == true || initialize.today == true) {
            html += "<div class=\"mss-calender-tool\">";
            if (initialize.auto == true) {
                html += "<div class=\"mss-calender-select\">";
                //时
                html += "<select class=\"mss-calender-hour\" name=\"\">";
                for (var i = 0; i < 24; i++) {
                    if (i == curObj.basis.getHours()) {
                        html += "<option value=\"" + i + "\" selected >" + i + "</option>";
                    } else {
                        html += "<option value=\"" + i + "\">" + i + "</option>";
                    }
                }
                html += "</select>：";
                //分
                html += "<select class=\"mss-calender-points\" name=\"\">";
                for (var i = 0; i < 60; i++) {
                    if (i == curObj.basis.getMinutes()) {
                        html += "<option value=\"" + i + "\" selected>" + i + "</option>";
                    } else {
                        html += "<option value=\"" + i + "\">" + i + "</option>";
                    }
                }
                html += "</select>：";
                //秒
                html += "<select class=\"mss-calender-seconds\" name=\"\">";
                for (var i = 0; i < 60; i++) {
                    if (i == curObj.basis.getSeconds()) {
                        html += "<option value=\"" + i + "\" selected>" + i + "</option>";
                    } else {
                        html += "<option value=\"" + i + "\">" + i + "</option>";
                    }

                }
                html += "</select>";
                html += "</div>";
                html += "<span class=\"mss-calender-yes\">" + lang.yes + "</span>";
            }
            if (initialize.today == true) {
                html += "<span class=\"mss-calender-today\">" + lang.today + "</span>";
            }
            html += "</div>";
        }
        //选择年份
        html += "<div class=\"mss-calender-switch\">";
        html += "<div class=\"mss-calender-year\"><div class=\"mss-calender-switch-left\"><</div>";
        html += "<div class=\"mss-calender-switch-dl\" style=\"width:" + (objMe.width - 40) + "px\"><dl>";
        html += "</dl></div>";
        html += "<div class=\"mss-calender-switch-right\">></div></div>";
        //月份
        html += "<div class=\"mss-calender-month\" style=\"width:" + (objMe.width - 10) + "px\">";
        for (var i = 0; i < lang.month.length; i++) {
            html += "<ins>" + lang.month[i] + "</ins>";
        }
        html += "</div>";
        html += "</div>";
        html += "</div></div>";
        //记录框架对象
        curObj.html = $(html).appendTo("body");
        //记录实际显示区域
        curObj.content = curObj.html.find(".mss-calender-content");
        //标题对象
        curObj.title = curObj.html.find(".mss-calender-title");
        //时间对象
        curObj.time = curObj.html.find(".mss-calender-time");
        //左按钮对象
        curObj.left = curObj.html.find(".mss-calender-left");
        //右按钮对象
        curObj.right = curObj.html.find(".mss-calender-right");
        //选择年月控件
        curObj.select = curObj.html.find(".mss-calender-switch");
        //当前对象
        curObj.current = "day";
        //特殊区域
        curObj.tool = curObj.html.find(".mss-calender-tool");
    }

    //---------------------
    // globalEvent 全局事件
    //---------------------
    var globalEvent = function() {
        //绑定今天事件
        if (initialize.today == true) {
            curObj.tool.on("click", ".mss-calender-today", function() {
                curObj.basis = new Date();
                tableReset();
                return false;
            })
        }
        //左移
        curObj.left.click(function() {
            curObj.basis = new Date(curObj.basis.getFullYear().toString() + "/" + curObj.basis.getMonth().toString() + "/1");
            tableReset();
            return false;
        })
        //右移动
        curObj.right.click(function() {
            curObj.basis = new Date(curObj.basis.getFullYear().toString() + "/" + (curObj.basis.getMonth() + 2).toString() + "/1");
            tableReset();
            return false;
        })
        //切换年月、给标题绑定事件
        curObj.title.click(function() {
            showYear();
            return false;
        })
        //切换年月 左向
        curObj.select.on("click", ".mss-calender-switch-left", function() {
            var yHtml = getYearList(parseInt($(curObj.select.find("dt")[0]).html()) - 16);
            curObj.select.find("dl").html(yHtml);
            return false;
        })
        //切换年月 右向
        curObj.select.on("click", ".mss-calender-switch-right", function() {
            var yHtml = getYearList(parseInt($(curObj.select.find("dt")[15]).html()) + 1);
            curObj.select.find("dl").html(yHtml);
            return false;
        })
        //切换年月 选择年
        curObj.select.on("click", "dt", function() {
            $(this).addClass("current").siblings().removeClass("current");
            return false;
        })
        //切换年月 确定
        curObj.select.on("click", "ins", function() {
            try {
                $(this).addClass("current").siblings().removeClass("current");
                var myyear = "";
                var myselect = $(curObj.select.find("dl")[0]).find(".current");
                if (myselect.length <= 0) {
                    //console.log("未选中年份")；
                    myyear = curObj.begin.getFullYear();
                } else {
                    myyear = parseInt($(myselect[0]).html());
                }
                curObj.basis = new Date(myyear + "/" + ($(this).index() + 1) + "/1");

            } catch (ex) {
                //console.log("选择绑定事件错误");
                curObj.basis = curObj.basis;
            }
            tableReset();
            curObj.select.hide();
            return false;
        })
        //绑定确认事件
        if (initialize.auto == true) {
            //确认事件
            curObj.tool.on("click", ".mss-calender-yes", function() {
                //changeAuto();
                backInput();
                return false;
            })
        }
        //限制时分秒的选择范围，求指导
    }

    //---------------------
    // getTable 渲染当前月
    //---------------------
    var getTable = function() {
        curObj.title.html(lang.month[curObj.begin.getMonth()] + "&nbsp;&nbsp;" + curObj.begin.getFullYear());
        var tHtml = "<table class=\"mss-calender-table\"><thead><tr>";
        for (var i = 0; i < lang.week.length; i++) {
            if (i == 0 || i == 6) {
                tHtml += "<th class=\"weekend\">" + lang.week[i] + "</th>";
            } else {
                tHtml += "<th>" + lang.week[i] + "</th>";
            }
        }
        tHtml += "</tr></thead><tbody><tr>";
        //今天
        var todayT = new Date();
        //找到当前月最大天数
        var newZero = new Date(curObj.begin.getFullYear().toString() + "/" + (curObj.begin.getMonth() + 2).toString() + "/0");
        var maxDays = newZero.getDate();
        //循环表
        for (var i = 1; i < newZero.getDate() + 1; i++) {
            var curD = new Date(curObj.begin.getFullYear().toString() + "/" + (curObj.begin.getMonth() + 1).toString() + "/" + i.toString());
            var windex = curD.getDay();
            //前置出现空日期
            if (i == 1) {
                for (var s = 0; s < windex; s++) {
                    tHtml += "<td></td>";
                }
            }
            //判断节日
            var title = "";
            var clname = "";
            var hstr = (curD.getMonth() + 1).toString() + "." + curD.getDate().toString();
            for (var p = 0; p < lang.holiday.length; p++) {
                if (lang.holiday[p].split(",").indexOf(hstr) >= 0) {
                    title = "title='" + lang.holiday[p].split(",")[1] + "' alt='" + lang.holiday[p].split(",")[1] + "'";
                    clname = "mss-calender-holiday";
                }
            }
            var noclick = "";
            if (curD.format("yyyy-MM-dd").toDateByString("yyyy-MM-dd").getTime() < initialize.min.format("yyyy-MM-dd").toDateByString("yyyy-MM-dd").getTime() || curD.format("yyyy-MM-dd").toDateByString("yyyy-MM-dd").getTime() > initialize.max.format("yyyy-MM-dd").toDateByString("yyyy-MM-dd").getTime()) {
                noclick = "noclick";
            }
            //判断是否为选中日
            if (curD.getFullYear() == curObj.input.getFullYear() && curD.getMonth() == curObj.input.getMonth() && curD.getDate() == curObj.input.getDate()) {
                tHtml += "<td><span class='mss-calender-blue " + clname + " " + noclick + "' " + title + ">" + i + "</span></td>";
            } else if (curD.getFullYear() == todayT.getFullYear() && curD.getMonth() == todayT.getMonth() && curD.getDate() == todayT.getDate()) {
                tHtml += "<td><span class='mss-calender-Teal " + clname + " " + noclick + "' " + title + ">" + i + "</span></td>";
            } else {
                tHtml += "<td><span class='" + clname + " " + noclick + "' " + title + ">" + i + "</span></td>";
            }
            //尾部转行
            if (windex == 6 && i < newZero.getDate()) {
                tHtml += "</tr><tr>";
            }
        }
        tHtml += "</tr></tbody></table>";
        curObj.time.html(tHtml);
        //绑定事件
        curObj.time.off()
        curObj.time.on("click", "span", function() {
            if (!$(this).hasClass("noclick")) {
                $(this).parent().parent().parent().find("span").removeClass("mss-calender-blue");
                $(this).addClass("mss-calender-blue");

                var sfm = "";
                if (initialize.auto == true) {
                    sfm = " " + $(curObj.tool.find("select")[0]).val() + ":" + $(curObj.tool.find("select")[1]).val() + ":" + $(curObj.tool.find("select")[2]).val() + "";
                } else {
                    sfm = " 00:00:00";
                }
                curObj.input = new Date(curObj.begin.getFullYear().toString() + "/" + (curObj.begin.getMonth() + 1).toString() + "/" + $(this).html() + sfm);
                if (initialize.auto == true) {
                    changeAuto();
                } else {
                    backInput();
                }

            }
            return false;
        })
    }

    //---------------------
    // showYear 切换年月
    //---------------------
    var showYear = function() {
        var yHtml = getYearList(parseInt(curObj.begin.getFullYear()) - 8);
        curObj.select.find("dl").html(yHtml);
        $(curObj.select.find("ins")[curObj.begin.getMonth()]).addClass("current").siblings().removeClass("current");
        curObj.select.show();
    }

    //---------------------
    // getYearList 获取年表
    //---------------------
    var getYearList = function(sp) {
        var html = ""
        for (var i = 0; i < 16; i++) {
            if (parseInt(sp) + i == curObj.begin.getFullYear()) {
                html += "<dt class=\"current\">" + (parseInt(sp) + i) + "</dt>";
            } else {
                html += "<dt>" + (parseInt(sp) + i) + "</dt>";
            }
        }
        return html;
    }

    //---------------------
    // tableReset 重置
    //---------------------
    var tableReset = function() {
        curObj.begin = new Date(curObj.basis.getFullYear().toString() + "/" + (curObj.basis.getMonth() + 1).toString() + "/1");
        getTable();
    }

    //---------------------
    // changeAuto 重置时分秒
    //---------------------
    var changeAuto = function() {
        //这里要重置时分秒可选择性。。。。。。。。在写入的时候也要校正一次可选择性。。。。我NND得去
        if (curObj.input.getTime() < initialize.min.getTime()) {
            curObj.input = initialize.min;
        } else if (curObj.input.getTime() > initialize.max.getTime()) {
            curObj.input = initialize.max;
        }
        curObj.tool.find(".mss-calender-hour").each(function(i) {
            if ($(this).attr("value") == curObj.input.getHours()) {
                $(this).parent().val($(this).attr("value"));
            }
        })
        curObj.tool.find(".mss-calender-points").each(function(i) {
            if ($(this).attr("value") == curObj.input.getMinutes()) {
                $(this).parent().val($(this).attr("value"));
            }
        })
        curObj.tool.find(".mss-calender-seconds").each(function(i) {
            if ($(this).attr("value") == curObj.input.getSeconds()) {
                $(this).parent().val($(this).attr("value"));
            }
        })

        //        //定义所有限制的最大最小
        //        var hhmin = 0;
        //        var hhmax = 23;
        //        var mmmin = 0;
        //        var mmmax = 59;
        //        var ssmin = 0;
        //        var ssmax = 59;
        //        if (initialize.min.format("yyyy-MM-dd").toDateByString("yyyy-MM-dd").getTime() == initialize.max.format("yyyy-MM-dd").toDateByString("yyyy-MM-dd").getTime()) {
        //            //同一天处理
        //
        //        } else {
        //            //不是同一天处理
        //            //等于最小一天
        //            if (curObj.input.format("yyyy-MM-dd").toDateByString("yyyy-MM-dd").getTime() == initialize.min.format("yyyy-MM-dd").toDateByString("yyyy-MM-dd").getTime()) {
        //                hhmin = initialize.min.getHours();
        //                mmmin = initialize.min.getMinutes();
        //                ssmin = initialize.min.getSeconds();
        //                hhmax = 23;
        //                mmmax = 59;
        //                ssmax = 59;
        //            } else if (curObj.input.format("yyyy-MM-dd").toDateByString("yyyy-MM-dd").getTime() == initialize.max.format("yyyy-MM-dd").toDateByString("yyyy-MM-dd").getTime()) {
        //            hhmin = 0;
        //                mmmin = 0;
        //                ssmin = 0;
        //                hhmax = 23;
        //                mmmax = 59;
        //                ssmax = 59;
        //            
        //            } else {
        //                hhmin = 0;
        //                hhmax = 23;
        //                mmmin = 0;
        //                mmmax = 59;
        //                ssmin = 0;
        //                ssmax = 59;
        //            }
        //            //等于最大一天
        //            //任意选择
        //        }
    }

    //---------------------
    // backInput 返回数据
    //---------------------
    var backInput = function(i) {
        //判断有效期
        if (curObj.input.getTime() < initialize.min.getTime()) {
            alert("选择时间错误，小于最小时间(" + initialize.min.format(initialize.format) + ")");
            curObj.input = initialize.min;
            initialize.target.val(initialize.min.format(initialize.format));
        } else if (curObj.input.getTime() > initialize.max.getTime()) {
            alert("选择时间错误，大于最大时间(" + initialize.max.format(initialize.format) + ")");
            curObj.input = initialize.max;
            initialize.target.val(initialize.max.format(initialize.format));
        } else {
            initialize.target.val(curObj.input.format(initialize.format));
        }
        var el = initialize.target;
        var t = curObj.input.format(initialize.format);
        closeclear();
        //看下页面中是否有默认的回调函数，如果存在就把对象以及时间回调回去
        try {
            if (typeof(calerdarBack) == "function") {
                eval("calerdarBack(" + el + "," + t + ")");
            } else {
                console.log("未找到回调函数");
            }
        } catch (ex) {
            alert("回调失败");
        }
    }

    //---------------------
    // close 关闭于清空
    //---------------------
    var closeclear = function() {
        try {
            curObj.html.remove();
            curObj = {};
        } catch (ex) {
            curObj = {};
        }
    }

    //---------------------
    // addPrototype 新增原型
    // 详情：时间格式化format，字符串转时间toDateByString，IndexOf支持IE67
    //---------------------
    var addPrototype = function() {
        if (!Date.prototype.hasOwnProperty("format")) {
            //格式化时间
            Date.prototype.format = function(format) {
                var o = {
                    "M+": this.getMonth() + 1, //month 
                    "d+": this.getDate(), //day 
                    "h+": this.getHours(), //hour 
                    "m+": this.getMinutes(), //minute 
                    "s+": this.getSeconds(), //second 
                    "q+": Math.floor((this.getMonth() + 3) / 3), //quarter 
                    "S": this.getMilliseconds() //millisecond 
                }

                if (/(y+)/.test(format)) {
                    format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
                }
                for (var k in o) {
                    if (new RegExp("(" + k + ")").test(format)) {
                        format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
                    }
                }
                return format;
            }
            //IndexOf支持
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
            //字符串转时间
            String.prototype.toDateByString = function(sformat) {
                var backDate;
                try {
                    //默认时间顺序
                    var f_order = ["yyyy", "MM", "dd", "hh", "mm", "ss"];
                    //提取需要处理的数据
                    var text = this.match(/\d+(\.\d+)?/g);
                    //格式标准相对默认标准的顺序
                    var Relative = [];
                    sformat.replace(/yyyy|MM|dd|hh|mm|ss/g, function(str, index) {
                        Relative.push(f_order.indexOf(str));
                    })
                    //字符串长度不达标
                    if (text.length < Relative.length) {
                        backDate = new Date();
                    }
                    //遍历默认,找对应数据
                    var newDate = []; //定义新数据
                    for (var i = 0; i < f_order.length; i++) {
                        //判断存在
                        if (Relative.indexOf(i) >= 0) {
                            if (i == 0) {
                                var longtext = text[Relative.indexOf(i)];
                                if (longtext.length < 4) {
                                    newDate.push("20" + longtext);
                                } else {
                                    newDate.push(longtext);
                                }
                            } else {
                                newDate.push(text[Relative.indexOf(i)]);
                            }

                        } else {
                            newDate.push(0);
                        }
                    }
                    newDate.push(0, 0, 0, 0, 0, 0);
                    newDate.splice(6);
                    var toDate = newDate[0] + "/" + newDate[1] + "/" + newDate[2] + " " + newDate[3] + ":" + newDate[4] + ":" + newDate[5];
                    backDate = new Date(toDate);
                } catch (ex) {
                    //console.log("目标时间为空，或不符合规则");
                    backDate = new Date();
                }
                return backDate;
            }

        }
    }

    //返回函数区
    return {
        init: init
    }
});





//一月份＝JAN.   Jan.=January
//二月份＝FEB.   Feb.=February
//三月份＝MAR.   Mar.=March 
//四月份＝APR.   Apr.=April 
//五月份＝MAY    May=May
//六月份＝JUN.   Jun.=June
//七月份＝JUL.   Jul.=July
//八月份＝AUG.   Aug.=August 
//九月份＝SEP.   Sept.=September
//十月份＝OCT.   Oct.=October
//十一月份＝NOV. Nov.=November
//十二月份＝DEC. Dec.=December








//星期一： Mon.=Monday 
//星期二： Tues.=Tuesday 
//星期三： Wed.=Wednesday 
//星期四： Thur.=Thursday 
//星期五： Fri.=Friday 
//星期六： Sat.=Saturday 
//星期天： Sun.=Sunday