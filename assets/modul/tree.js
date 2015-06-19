define(function(require, exports, module) {
    return {
        init: function(_config) {
            $(function() {
                //增加原型-根据key  val 找到JSON数组里面符合条件的第一个JSON对象  如果没找到返回空对象
                if (!Array.findJson) {
                    Array.prototype.findJson = function(fkey, fval) {
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
                //增加原型-changeattr：操作数组下的jSON对象中的KEY对应的值，遍历数组下的对象，找到对应的键改变值
                if (!Array.changeattr) {
                    Array.prototype.changeattr = function(text, fn, str, ord, ofn) {
                        try {
                            var gstr = str;
                            for (var i = 0; i < this.length; i++) {
                                try {
                                    var curstr = gstr + i + ",";
                                    if (curstr == ord + ",") {
                                        eval("this[" + i + "]." + text + "=" + ofn);
                                    } else {
                                        eval("this[" + i + "]." + text + "=" + fn);
                                    }
                                    if (eval("this[" + i + "].children.length") > 0) {
                                        eval("this[" + i + "].children.changeattr('" + text + "','" + fn + "','" + curstr + "','" + ord + "','" + ofn + "')");
                                    }
                                } catch (ex) {
                                    console.log(ex);
                                }
                            }
                            return this;
                        } catch (ex) {
                            console.log("原型--json对应兼职查询失败");
                            return this;
                        }
                    }
                }
                //增加原型-indexOf
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
            })

            var _op = {
                target: "", //渲染节点
                data: [], //数据//异步状态会自动插入，必须要节点名：children
                closeicon: "icon-folder-close", //有节点的情况下，关闭节点
                openicon: "icon-folder-open", //打开节点
                nodeicon: "icon-file", //没有节点
                accordion: true, //设置手风琴效果
                check: true, //开启选择
                multi: true, //多选单选
                nodecheck: false, //仅允许子节点选择
                line: true, //数据回调方式----单选下不生效(返回当前id)，多选下有连线模式以及单点模式，连线：父-父-父-子//
                callback: "", //点击节点回调//返回当前点击元素的递归数据例如1,12,123
                inputcallback: "", //如果允许选择点击选择框的回调-（是否选中，id）
                asyn: false, //是否异步
                url: "" //异步地址---参数为id
            };
            //默认可以使用disabled="true"

            //一些内置参数
            var _inlay = {
                state: false, //状态
                has:false,//接口状态
                dom: "", //树结构层
                curdom: "", //当前结构
                padding: "padding-left:0px", //首节点偏移
                radio: "", //单选状态当前选择点
                check: [], //多选状态当前选择点
                isinit: true //允许初始化
            }

            //正式初始化
            $(function() {
                //合并参数
                if (_config && typeof _config === 'object') {
                    $.extend(_op, _config);
                }
                if (_op.target == "" || $(_op.target).length <= 0) {
                    _inlay.state = false;
                    console.log("树初始化错误");
                    return false;
                } else {
                    _inlay.state = true;
                }
            })

            //---------------------
            // show 初始化
            //---------------------
            var show = function(ops) {
                if (_inlay.state == false) {
                    alert("未初始化或者已销毁");
                    return false;
                }
                try {
                    $(_op.target).empty();
                    _inlay.dom = $("<div class=\"mss-tree\"></div>").appendTo($(_op.target));
                    _inlay.curdom = _inlay.dom;
                    //判断是否开启异步
                    if (_op.asyn == true) {
                        _get([]);
                    } else {
                        _open(_op.data, true, "");
                    }
                    //绑定事件
                    _addEvent();
                } catch (e) {
                    console.log("显示树结构失败");
                }
            }

            //---------------------
            // _get 加载节点
            //---------------------
            var _get = function(index) {
                _inlay.has=false;
                var getid = "-1";
                var curclass = "";
                if (index.length <= 0) {
                    _inlay.dom.html("Loading...");
                } else {
                    curclass = $(_inlay.curdom.find("i")[0]).attr("class");
                    $(_inlay.curdom.find("i")[0]).attr("class", "mss-tree-icont icon-spinner");
                    var sp = _con_once(index.join(",")).split("-");
                    getid = sp[sp.length - 2];
                }
                $.ajax({
                    type: "get",
                    url: _op.url + "?id=" + getid,
                    dataType: "JSON",
                    async: true,
                    success: function(data) {
                        if (getid == "-1") {
                            _inlay.dom.empty();
                            _op.data = data;
                            _open(_op.data, true, "");
                        } else {
                            $(_inlay.curdom.find("i")[0]).attr("class", curclass);
                            if (data.length > 0) {
                                $(_inlay.curdom.find("i")[0]).removeClass(_op.nodeicon).removeClass(_op.closeicon).addClass(_op.openicon);
                            }
                            _getprocess(data, index);
                        }
                    },
                    error: function() {
                        alert("Failed to get the node");
                    }
                })
            }

            //---------------------
            // _getprocess 加载节点解析
            //---------------------
            var _getprocess = function(data, index) {
                var dstr = "";
                for (var s = 0; s < index.length - 1; s++) {
                    if (s == index.length - 2) {
                        dstr += "[" + index[s] + "]";
                    } else {
                        dstr += "[" + index[s] + "].children";
                    }
                }
                eval("_op.data" + dstr).children = data;
                eval("_op.data" + dstr).fromtheinternet = true;
                //var sp=_con_once(index.join(",")).split("-");
                var xu = index.join(",");
                if (_op.check == true && _op.multi == true) {
                    if (_inlay.check.indexOf(xu) >= 0) {
                        for (var i = 0; i < data.length; i++) {
                            _inlay.check.push(xu + i + ",");
                        }
                    }
                }
                //console.log(_inlay.check);
                _open(data, false, index);
            }

            //---------------------
            // _addEvent 绑定基础事件
            //---------------------
            var _addEvent = function() {
                //绑定P元素的打开节点功能
                _inlay.dom.on("click", "p", function() {
                    if ($(this).parent().find("ul").length > 0) {
                        $(this).parent().find("ul").stop().animate({
                            "height": "0px"
                        }, 500, function() {
                            $(this).remove()
                        });
                        $(this).find("i").addClass(_op.closeicon).removeClass(_op.openicon);
                    } else {
                        var getIndex = $(this).attr("mss-guide").split(",");
                        var getData = _op.data;
                        for (var i = 0; i < getIndex.length - 1; i++) {
                            if (i == getIndex.length - 2) {
                                getData = getData[parseInt(getIndex[i])];
                            } else {
                                getData = getData[parseInt(getIndex[i])].children;
                            }
                        }
                        var pandata = getData;
                        getData = getData.children;
                        _inlay.curdom = $(this).parent();
                        if (_op.asyn == true) {
                            var isfrom = false;
                            try {
                                if (pandata.fromtheinternet == true) {
                                    isfrom = true;
                                }
                            } catch (ex) {}
                            //console.log(isfrom);
                            //异步获取数据还需要处理
                            if (isfrom == false) {
                                _get(getIndex);
                            } else {
                                _open(getData, false, getIndex.join(","));
                            }
                        } else {
                            if (getData.length > 0) {
                                _open(getData, false, getIndex.join(","));
                            }
                        }
                        if (_op.accordion == true) {
                            //$(this).parent().siblings().find("ul").remove();
                            $(this).parent().siblings().find("ul").stop().animate({
                                "height": "0px"
                            }, 500, function() {
                                $($(this).parent().find("i")[0]).addClass(_op.closeicon).removeClass(_op.openicon);
                                $(this).remove();
                            });
                        }
                    }
                    $(this).parents(_inlay.dom).find("p").removeClass("mss-tree-title-selected");
                    $(this).addClass("mss-tree-title-selected");
                    //回调函数
                    if (typeof(_op.callback) == "function") {
                        var bf = _con_once($(this).attr("mss-guide"));
                        if (_op.line == true) {
                            _op.callback(bf);
                        } else {
                            _op.callback(bf.split("-")[bf.split("-").length - 2]);
                        }
                    }
                })
                //选择打开下绑定事件
                if (_op.check == true) {
                    if (_op.multi == true) {
                        //多选事件
                        _inlay.dom.on("click", ".mss-tree-check", function() {
                            var nodes = [];
                            var curCheck = $(this).parent().attr("mss-guide");
                            nodes.push(curCheck);
                            //把子节点加入到数组
                            var getnodes = _find(_current(curCheck), curCheck);
                            for (var i = 0; i < getnodes.length; i++) {
                                nodes.push(getnodes[i]);
                            }
                            var isck = false;
                            //判断是否选中
                            if ($(this).hasClass("mic-check-all")) {
                                //关闭选中--删除
                                for (var i = 0; i < nodes.length; i++) {
                                    if (_inlay.check.indexOf(nodes[i]) >= 0) {
                                        _inlay.check.splice(_inlay.check.indexOf(nodes[i]), 1);
                                    }
                                }
                                //向下走
                                $(this).parent().parent().find(".mss-tree-check").addClass("mic-check-no").removeClass("mic-check-all").removeClass("mic-check-part");
                                //向上走
                                var pars = $(this).parentsUntil(_inlay.dom);
                                for (var k = 0; k < pars.length - 1; k++) {
                                    if ($(pars[k]).hasClass("mss-tree-item")) {
                                        //处理操作
                                        var getdelnodes = _find(_current($($(pars[k]).find("p")[0]).attr("mss-guide")), $($(pars[k]).find("p")[0]).attr("mss-guide"));
                                        if (_inlay.check.indexOf($($(pars[k]).find("p")[0]).attr("mss-guide")) >= 0) {
                                            $($(pars[k]).find("p")[0]).find(".mss-tree-check").addClass("mic-check-part").removeClass("mic-check-no").removeClass("mic-check-part");
                                        } else {
                                            var isopen = false;
                                            for (var j = 0; j < getdelnodes.length; j++) {
                                                if (_inlay.check.indexOf(getdelnodes[j]) >= 0) {
                                                    isopen = true;
                                                    break;
                                                }
                                            }
                                            if (isopen == false) {
                                                $($(pars[k]).find("p")[0]).find(".mss-tree-check").addClass("mic-check-no").removeClass("mic-check-all").removeClass("mic-check-part");
                                            } else {
                                                $($(pars[k]).find("p")[0]).find(".mss-tree-check").addClass("mic-check-part").removeClass("mic-check-all").removeClass("mic-check-no");
                                            }

                                        }
                                    }
                                }
                            } else {
                                isck = true;
                                //自身以及子节点选中--添加
                                for (var i = 0; i < nodes.length; i++) {
                                    if (_inlay.check.indexOf(nodes[i]) < 0) {
                                        _inlay.check.push(nodes[i]);
                                    }
                                }
                                //向下走
                                $(this).parent().parent().find(".mss-tree-check").addClass("mic-check-all").removeClass("mic-check-no").removeClass("mic-check-part");
                                //向上走
                                var pars = $(this).parentsUntil(_inlay.dom);
                                for (var k = 0; k < pars.length - 1; k++) {
                                    if ($(pars[k]).hasClass("mss-tree-item")) {
                                        //处理操作
                                        if (_inlay.check.indexOf($($(pars[k]).find("p")[0]).attr("mss-guide")) >= 0) {
                                            $($(pars[k]).find("p")[0]).find(".mss-tree-check").addClass("mic-check-all").removeClass("mic-check-no").removeClass("mic-check-part");
                                        } else {
                                            $($(pars[k]).find("p")[0]).find(".mss-tree-check").addClass("mic-check-part").removeClass("mic-check-no").removeClass("mic-check-all");
                                        }
                                    }
                                }
                            }
                            //console.log(_inlay.check);
                            if (typeof(_op.inputcallback) == "function") {
                                var bf = _con_once($(this).parent().attr("mss-guide"));
                                if (_op.line == true) {
                                    _op.inputcallback(isck, bf);
                                } else {
                                    _op.inputcallback(isck, bf.split("-")[bf.split("-").length - 2]);
                                }
                            }
                            //冒泡
                            return false;
                        })
                    } else {
                        //单选事件
                        _inlay.dom.on("click", ".mss-tree-check", function() {
                            //处理原始数据，抛弃原始数据----包含处理节点
                            _inlay.dom.find(".mss-tree-check").each(function() {
                                $(this).addClass("mic-radio-no").removeClass("mic-radio-all");
                            })
                            //处理选中数据
                            var getIndex = $(this).parent().attr("mss-guide").split(",");
                            var gtr = "";
                            var ygtr = "";
                            var arr = [];
                            for (var i = 0; i < getIndex.length - 1; i++) {
                                gtr = getIndex[i] + ",";
                                ygtr += gtr;
                                arr.push(ygtr);
                            }
                            _inlay.dom.find("p").each(function() {
                                if (arr.indexOf($(this).attr("mss-guide")) >= 0) {
                                    $(this).find(".mss-tree-check").addClass("mic-radio-all").removeClass("mic-radio-no");
                                }
                            })
                            //记录选中数据
                            _inlay.radio = $(this).parent().attr("mss-guide");
                            if (typeof(_op.inputcallback) == "function") {
                                var bf = _con_once($(this).parent().attr("mss-guide"));
                                if (_op.line == true) {
                                    _op.inputcallback(true, bf);
                                } else {
                                    _op.inputcallback(true, bf.split("-")[bf.split("-").length - 2]);
                                }
                            }
                            //冒泡
                            return false;
                        })
                    }
                }
                //其他事件
            }

            //---------------------
            // _current 找到当前节点
            //---------------------
            // row  序号
            //---------------------
            var _current = function(row) {
                var getIndex = row.split(",");
                var str = "";
                for (var i = 0; i < getIndex.length - 1; i++) {
                    str += "[" + getIndex[i] + "].children";
                }
                //console.log(eval("_op.data" + str));
                return eval("_op.data" + str);
            }

            //---------------------
            // _find 找到当前节点
            //---------------------
            // data  数据
            // prefix  前缀
            //---------------------
            var _find = function(data, prefix) {
                var arr = [];
                for (var i = 0; i < data.length; i++) {
                    arr.push(prefix + i + ",");
                    if (data[i].children.length > 0) {
                        var getarr = _find(data[i].children, prefix + i + ",");
                        for (var s = 0; s < getarr.length; s++) {
                            arr.push(getarr[s]);
                        }
                    }
                }
                //console.log(arr);
                return arr;
            }

            //---------------------
            // open 加载节点
            //---------------------
            // data  解析数据
            // sp 是否首节点
            // guide 当前指针
            //---------------------
            var _open = function(data, sp, guide) {
                var _haspadding = "";
                if (sp == true) {
                    _haspadding = _inlay.padding;
                }
                var html = "<ul class=\"mss-tree-ul\" style=\"" + _haspadding + "\">";
                for (var i = 0; i < data.length; i++) {
                    var isdel = false;
                    try {
                        if (data[i].deleted == true) {
                            isdel = true;
                        }
                    } catch (ex) {}
                    if (isdel == true) {
                        continue;
                    }
                    //增加li
                    html += "<li class=\"mss-tree-item\">";
                    //增加p
                    html += "<p class=\"mss-tree-title\" mss-guide=\"" + (guide + i + ",") + "\">";
                    //标题元素
                    //判断存在子节点
                    if (data[i].children.length > 0) {
                        html += "<i class=\"mss-tree-icont " + _op.closeicon + "\"></i>";
                    } else {
                        html += "<i class=\"mss-tree-icont " + _op.nodeicon + "\"></i>";
                    }
                    //多选或者单选
                    var ic = "mic-radio";
                    if (_op.multi == true) {
                        ic = "mic-check";
                    }
                    //判断当前选中状态
                    var check = "no";
                    var curgui = guide + i + ",";
                    if (_op.check == true) {
                        if (_op.multi == true) {
                            if (_inlay.check.indexOf(curgui) >= 0) {
                                check = "all";
                            } else {
                                var getnodex = _find(_current(curgui), curgui);
                                for (var p = 0; p < getnodex.length; p++) {
                                    if (_inlay.check.indexOf(getnodex[p]) >= 0) {
                                        check = "part";
                                    }
                                }
                            }
                        } else {
                            if (curgui == _inlay.radio.substring(0, curgui.length)) {
                                check = "all";
                            }
                        }
                    }
                    //判断选择器的出现
                    if (_op.check == true) {
                        if (_op.nodecheck == true && data[i].children.length <= 0) {
                            html += "<span class=\"mss-tree-check " + ic + " " + ic + "-" + check + "\"></span>";
                        } else if (_op.nodecheck == false) {
                            html += "<span class=\"mss-tree-check " + ic + " " + ic + "-" + check + "\"></span>";
                        }
                    }
                    html += "<span class=\"mss-tree-item-font\">" + data[i].value + "</span>";
                    //p结束
                    html += "</p>";
                    //li结束
                    html += "</li>";
                }
                html += "</ul>";
                var $h = $(html).appendTo(_inlay.curdom);
                if (guide != "") {
                    $(_inlay.curdom.find("i")[0]).addClass(_op.openicon).removeClass(_op.closeicon);
                }
                $h.stop().animate({
                    "height": $h.find("li").length * $($h.find("li")[0]).outerHeight(true) + "px"
                }, 500, function() {
                    $h.css({
                        "height": "auto"
                    })
                })
                _inlay.has=true;
            }

            //---------------------
            // _con_once 单个序号转
            // index 序号组
            //---------------------
            var _con_once = function() {
                if (arguments.length > 1) {
                    var sp = arguments[0].split(",");
                    var ids = "";
                    var cdata = _op.data;
                    for (var i = 0; i < sp.length - 1; i++) {
                        ids += cdata[parseInt(sp[i])][arguments[1]] + "-";
                        cdata = cdata[parseInt(sp[i])].children;
                    }
                    return ids;
                } else {
                    var sp = arguments[0].split(",");
                    var ids = "";
                    var cdata = _op.data;

                    for (var i = 0; i < sp.length - 1; i++) {
                        ids += cdata[parseInt(sp[i])].id + "-";
                        cdata = cdata[parseInt(sp[i])].children;
                    }
                    return ids;
                }
            }

            //---------------------
            // _con_to_index ID转序号
            // ids id组
            // data 查找范围
            // index 当前指针
            //---------------------
            var _con_to_index = function(ids, data, index) {
                var back = "";
                //console.log(ids);console.log(data);console.log(index);
                for (var i = 0; i < data.length; i++) {
                    if (data[i].id == ids.split(",")[index]) {
                        back += i + ",";
                        if (index < ids.split(",").length - 1) {
                            back += _con_to_index(ids, data[i].children, index + 1);
                        }
                    }
                    //console.log(back);
                }
                return back;
            }

            //---------------------
            // _con_more 多个数据转换
            // arr 序号组
            //---------------------
            var _con_more = function() {
                if (arguments.length > 1) {
                    var ids = [];
                    for (var i = 0; i < arguments[0].length; i++) {
                        ids.push(_con_once(arguments[0][i], arguments[1]));
                    }
                    return ids;
                } else {
                    var ids = [];
                    for (var i = 0; i < arguments[0].length; i++) {
                        ids.push(_con_once(arguments[0][i]));
                    }
                    return ids;
                }
            }

            //-----------------------
            // _del 删除数据-内部方法
            //-----------------------
            var _del = function(str) {
                try {
                    var index = _con_to_index(str, _op.data, 0);
                    if (index.split(",").length - 1 == str.split(",").length) {
                        //console.log(index);
                        //删除view
                        var getp = _inlay.dom.find("p");
                        for (var i = 0; i < getp.length; i++) {
                            if ($(getp[i]).attr("mss-guide") == index) {
                                //如果是多选做一次校正
                                //如果选中触发一次
                                //如果半选//触发2次
                                if (_op.multi == true) {
                                    if ($(getp[i]).find(".mss-tree-check").hasClass("mic-check-all")) {
                                        $(getp[i]).find(".mss-tree-check").click();
                                    }
                                    if ($(getp[i]).find(".mss-tree-check").hasClass("mic-check-part")) {
                                        $(getp[i]).find(".mss-tree-check").click();
                                        $(getp[i]).find(".mss-tree-check").click();
                                    }
                                }
                                //移除
                                $(getp[i]).parent().stop().animate({
                                    "height": "0px"
                                }, 500, function() {
                                    $(this).remove()
                                })
                            }
                        }

                        //删除数据
                        var dstr = "";
                        var sp2 = index.split(",");
                        for (var s = 0; s < sp2.length - 1; s++) {
                            if (s == sp2.length - 2) {
                                dstr += "[" + sp2[s] + "]";
                            } else {
                                dstr += "[" + sp2[s] + "].children";
                            }
                        }
                        //console.log(dstr);
                        eval("_op.data" + dstr).deleted = true;
                        //console.log(dstr);
                        //删除选中
                        //判断当前类型
                        if (_op.multi == false) {
                            _radiodel(index);
                        }
                    } else {
                        console.log("删除：" + str);
                    }
                } catch (ex) {
                    console.log("删除失败：" + str);
                }
            }

            //-----------------------
            // _radiodel 删除一个节点判断是否存在于选中状态--单选
            //-----------------------
            var _radiodel = function(index) {
                if (index == _inlay.radio) {
                    _inlay.radio = "";
                    var getp = _inlay.dom.find("p");
                    for (var i = 0; i < getp.length; i++) {
                        $(getp[i]).find(".mss-tree-check").addClass("mic-radio-no").removeClass("mic-radio-all");
                    }
                }
            }

            //-----------------------
            // _pushcheck 把所有已经存在的数据插入到选中对象
            //-----------------------
            var _pushcheck = function(data, index) {
                for (var i = 0; i < data.length; i++) {
                    var getindex = index + i + ",";
                    _inlay.check.push(getindex);
                    if (data[i].children.length > 0) {
                        _pushcheck(data[i].children, getindex);
                    }
                }
            }

            //-----------------------
            // _getnumber 遍历获取总量以及选中量
            //-----------------------
            var _getnumber = function(data, index) {
                var num = [0, 0];
                for (var i = 0; i < data.length; i++) {
                    var getindex = index + i + ",";
                    if (_inlay.check.indexOf(getindex) >= 0) {
                        num[0] = num[0] + 1;
                    }
                    num[1] = num[1] + 1;
                    if (data[i].children.length > 0) {
                        var getnum = _getnumber(data[i].children, getindex);
                        num[0] = num[0] + getnum[0];
                        num[1] = num[1] + getnum[1];
                    }
                }
                return num;
            }


            //-----------------------
            // 以下方法暴露
            //-----------------------


            //-----------------------
            // refresh 刷新
            //-----------------------
            var refresh = function() {
                if (_inlay.state == true&&_inlay.has==true) {
                    hide();
                    show();
                }
            }

            //-----------------------
            // get 回去选中数据
            //-----------------------
            var get = function() {
                if (_inlay.state == true&&_inlay.has==true) {
                    //alert("s");
                    //判断参数个数
                    if (arguments.length > 0) {
                        //判断是否开启异步
                        if (_op.check == true) {
                            if (_op.multi == true) {
                                if (_op.line == true) {
                                    return _con_more(_inlay.check, arguments[0]);
                                } else {
                                    var bf = _con_more(_inlay.check, arguments[0]);
                                    var bff = [];
                                    for (var i = 0; i < bf.length; i++) {
                                        bff.push(bf[i].split("-")[bf[i].split("-").length - 2]);
                                    }
                                    return bff;
                                }
                            } else {
                                if (_op.line == true) {
                                    return _con_once(_inlay.radio, arguments[0]);
                                } else {
                                    var bf = _con_once(_inlay.radio, arguments[0]);
                                    return bf.split("-")[bf.split("-").length - 2];
                                }
                            }
                        } else {
                            return "failure";
                        }
                    } else {
                        //无参数默认获取ID
                        //判断是否开启异步
                        if (_op.check == true) {
                            if (_op.multi == true) {
                                if (_op.line == true) {
                                    //console.log(_con_more(_inlay.check));
                                    return _con_more(_inlay.check);
                                } else {
                                    var bf = _con_more(_inlay.check);
                                    var bff = [];
                                    for (var i = 0; i < bf.length; i++) {
                                        bff.push(bf[i].split("-")[bf[i].split("-").length - 2]);
                                    }
                                    //console.log(typeof(_con_more(_inlay.check)));
                                    return bff;
                                }
                            } else {
                                if (_op.line == true) {
                                    return _con_once(_inlay.radio);
                                } else {
                                    var bf = _con_once(_inlay.radio);
                                    return bf.split("-")[bf.split("-").length - 2];
                                }
                            }
                        } else {
                            return "failure";
                        }
                    }
                    
                }
            }

            //-----------------------
            // del 删除数据-指定序号
            //-----------------------
            var del = function(str) {
                if (_inlay.state == true&&_inlay.has==true) {
                    if (str instanceof Array) {
                        for (var i = 0; i < str.length; i++) {
                            _del(str[i]);
                        }

                    } else {
                        _del(str);
                    }
                }
            }

            //-----------------------
            // cancel 取消选择
            //-----------------------
            var cancel = function(str) {
                if (_inlay.state == true&&_inlay.has==true) {
                    _inlay.check = [];
                    _inlay.radio = "";
                    _inlay.dom.find(".mss-tree-check").each(function() {
                        if ($(this).hasClass("mic-check")) {
                            $(this).removeClass("mic-check-all").removeClass("mic-check-part").addClass("mic-check-no");
                        } else {
                            $(this).removeClass("mic-radio-all").addClass("mic-radio-no");
                        }
                    })
                }
            }

            //-----------------------
            // checkall 取消选择
            //-----------------------
            var checkall = function() {
                if (_inlay.state == true&&_inlay.has==true) {
                    if (_op.check == true && _op.multi == true) {
                        _inlay.dom.find(".mss-tree-check").each(function() {
                            if ($(this).hasClass("mic-check")) {
                                $(this).removeClass("mic-check-no").removeClass("mic-check-part").addClass("mic-check-all");
                            }
                        })
                        _inlay.check = [];
                        _pushcheck(_op.data, "");
                    }
                }
            }

            //-----------------------
            // getnumber 获取选中量
            //-----------------------
            var getnumber = function() {
                if (_inlay.state == true&&_inlay.has==true) {
                    return _getnumber(_op.data, "");
                }
            }

            //-----------------------
            // replace 替换数据
            //-----------------------
            var replace = function(data, asyn) {
                if (_inlay.state == true&&_inlay.has==true) {
                    hide();
                    if (asyn == true) {
                        _op.asyn = true;
                        _op.data = [];
                        _op.url = data;
                    } else {
                        _op.asyn = false;
                        _op.data = data;
                    }
                    show();
                }
            }

            //-----------------------
            // reset 重置
            //-----------------------
            var reset = function(ops) {
                if (_inlay.state == true&&_inlay.has==true) {
                    destroy();
                    //合并参数
                    if (ops && typeof ops === 'object') {
                        $.extend(_op, ops);
                    }
                    if (_op.target == "" || $(_op.target).length <= 0) {
                        _inlay.state = false;
                        console.log("重置失败");
                        return false;
                    } else {
                        _inlay.state = true;
                        show();
                    }
                }
            }

            //-----------------------
            // hide 关闭
            //-----------------------
            var hide = function() {
                if (_inlay.state == true&&_inlay.has==true) {
                    try {
                        _inlay.dom.off("click", "p");
                        _inlay.dom.off("click", ".mss-tree-check");
                        _inlay.dom.empty();
                        _inlay.dom.remove();
                    } catch (ex) {}
                    _inlay.curdom = ""; //当前结构
                    _inlay.radio = ""; //单选状态当前选择点
                    _inlay.check = []; //多选状态当前选择点
                }
            }

            //-----------------------
            // destroy 禁止当前对象使用，并销毁绑定时间
            //-----------------------
            var destroy = function(data, index) {
                if (_inlay.state == true) {
                    try {
                        _inlay.dom.off("click", "p");
                        _inlay.dom.off("click", ".mss-tree-check");
                        _inlay.dom.empty();
                        _inlay.dom.remove();
                    } catch (ex) {}
                    _inlay.dom = "";
                    _inlay.curdom = ""; //当前结构
                    _inlay.radio = ""; //单选状态当前选择点
                    _inlay.check = []; //多选状态当前选择点
                    _inlay.state = false;
                    _inlay.has = false;
                }
            }
            //-----------------------
            // 对外接口
            //-----------------------
            return {　　　　　　　
                show: show, //显示
                refresh: refresh, //刷新
                get: get, //获取选中--可设置获取属性
                del: del, //删除某个节点
                cancel: cancel, //取消
                reset: reset, //重置
                replace: replace, //替换数据
                checkall: checkall, //全选-仅限多选
                getnumber: getnumber, //获取选中量
                hide: hide, //关闭
                destroy: destroy //禁止当前对象使用，并销毁绑定时间
            };
        }
    }
});