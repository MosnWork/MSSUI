/**
 * MSSTime.js
 * Mosn 2015.5.27
 * From MosnWork
 *
 * 每个独立模块都加上try防止出错
 *
 */

/*
@ 主函数 MSSTime
@ init 初始化
*/
var MSSTime = (function() {


    //临时数据
    var parameter = {
        calendarID: "", //时间插件的临时ID
        calendarTarget: "" //如果是时间面板记录在此处
    }




    //---------------------
    // calendar 时间插件
    // 是否动态：√
    // 配置方法：
    // 启动：属性：mss-calender
    //
    //---------------------
    var calendar = function() {
        try {
            //新增一个时间格式化的原型
            byformat();
            $("body").on("click", "[mss-calender='true']", function(e) {

                //初始化参数
                var initialize = {
                    for: ($(this).attr("mss-for") != undefined && $($(this).attr("mss-for")).length > 0) ? $($(this).attr("mss-for")) : $(this), //针对，不写就是针对本身，找不到还是针对本身
                    double: $(this).attr("mss-double") == "true" ? "true" : "false", //双日历开启
                    format: ($(this).attr("mss-format") != undefined && $(this).attr("mss-format") != "") ? $(this).attr("mss-format") : "yyyy-MM-dd", //格式规则
                    min: "", //最小时间
                    max: "", //最大时间
                    // minfor: "", //限制最小针对，如果错误就不限制
                    //maxfor: "", //限制最大 同理
                    today: $(this).attr("mss-today") == "true" ? "true" : "false", //今天按钮
                    auto: $(this).attr("mss-auto") == "true" ? "true" : "false", //时分秒
                    language: "zh" //语言
                }
                //限制最小针对，如果错误就不限制
                if ($(this).attr("mss-minfor") != undefined && $($(this).attr("mss-minfor")).length > 0) {
initialize.min=$()
                }
                //限制最大 同理
                if ($(this).attr("mss-maxfor") != undefined && $($(this).attr("mss-maxfor")).length > 0) {

                }




                //获取时间戳，组成ID
                parameter.calendarID = "calender-" + stamp();
                //获取当前元素的位置
                var top = $(this).offset().top;
                var left = $(this).offset().left;
                var width = $(this).outerWidth();
                var height = $(this).outerHeight();
                //获取想放置的位置
                var direction = $(this).attr("mss-direction");
                //定义本身偏移量
                var mycss = "left:" + left + "px;top:" + (top + height + 7) + "px";

                var html = "<div id=\"" + parameter.calendarID + "\" class=\"mss-calender\" style=\"" + mycss + "\">";
                html += "<span class=\"mss-calender-border\">◆</span><span class=\"mss-calender-background\">◆</span>";
                html += "<div class=\"mss-calender-content\"></div>";
                html += "</div>";
                var $calender = $(html).appendTo("body");
                var $timeObj = $calender.find(".mss-calender-content");









                var now = new Date();
                var nowStr = now.format("yyyy-MM-dd hh:mm:ss");
                $timeObj.html(nowStr);



                $(document).on("click", function(e) {
                    //时间控件
                    if ($(e.target).parents(".mss-calender").length <= 0) {
                        $("#" + parameter.calendarID).remove();
                    }
                });
                return false;
            })
        } catch (ex) {
            console.log("时间插件初始化错误");
        }
    }


    //事件层
    var getHtml = function(byID) {
        var html = "<div class=\"mss-poptip\"><span class=\"mss-poptip-border\">◆</span><span class=\"mss-poptip-background\">◆</span><div class=\"mss-poptip-content\"></div></div>";
        return html;
    }




    //---------------------
    // stamp 时间戳-返回时间戳
    //---------------------
    var stamp = function() {
        var current = new Date();
        return current.getTime();
    }

    var byformat = function() {
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
    }

    //返回函数区
    return {
        calendar: calendar
    }
})();

//页面初始化
document.onreadystatechange = function() {
    if (document.readyState == "complete") {
        MSSTime.calendar();
    }
}