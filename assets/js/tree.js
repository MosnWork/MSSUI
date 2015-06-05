define(function(require, exports, module) {
    return {
        tree: function() {
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
                            console.log("遍历错误");
                            return this;
                        }
                    }
                }
            })

            var _op = {
                target: "", //渲染节点
                data: [], //数据//异步状态会自动插入，必须要节点名：children
                closeicon: "icon-folder-close", //有节点的情况下，关闭节点
                openicon: "icon-folder-open", //打开节点
                nodeicon: "icon-file", //没有节点
                accordion: false, //设置手风琴效果
                check: true, //开启选择
                multi: true, //多选单选
                nodecheck: false, //仅允许子节点选择
                line: true, //数据回调方式----单选下不生效(返回当前id)，多选下有连线模式以及单点模式，连线：父-父-父-子
                callback: "", //点击节点回调
                asyn: false, //是否异步
                url: "" //异步地址---参数为id
            };
            //默认可以使用disabled="true"


            //一些内置参数
            var _inlay = {
                state: false, //状态
                dom: "", //树结构层
                curdom: "", //当前结构
                pading: "padding-left:0px" //首节点偏移





            }

            //不够就继续增加

            //---------------------
            // init 初始化
            //---------------------
            var init = function(ops) {
                //合并参数
                if (ops && typeof ops === 'object') {
                    $.extend(_op, ops);
                }
                if (_op.target == "" || _op.data.length <= 0) {
                    _inlay.state = false;
                    return false;
                }
                try {
                    _inlay.dom = $("<div class=\"mss-tree\"></div>").appendTo($(_op.target));
                    _inlay.curdom = _inlay.dom;
                    //判断是否开启异步
                    if (_op.asyn == true) {
                        _get("-1");
                    } else {
                        _open(_op.data, true);
                    }
                } catch (e) {
                    console.log("树节点数据解析失败");
                }
            }


            //---------------------
            // _get 加载节点
            //---------------------
            var _get = function(ord) {}








            //---------------------
            // open 加载节点
            //---------------------
            // data  解析数据
            // sp 是否首节点
            //---------------------
            var _open = function(data, sp) {
                var _haspadding = "";
                if (sp == true) {
                    _haspadding = _inlay.padding;
                }
                var html = "<ul class=\"mss-tree-ul\" style=\"" + _haspadding + "\">";
                for (var i = 0; i < data.length; i++) {
                    //增加li
                    html += "<li class=\"mss-tree-item\">";
                    //增加p
                    html += "<p class=\"mss-tree-title\">";
                    //标题元素
                    html += "<i class=\"mss-tree-icont " + _op.nodeicon + "\"></i>";
                    html += "<span class=\"mss-tree-check\"></span>";
                    html += "<span class=\"mss-tree-item-font\">" + data[i].value + "</span>";
                    //p结束
                    html += "</p>";
                    //li结束
                    html += "</li>";
                }
                html += "</ul>";
                $(html).appendTo(_inlay.curdom);
            }


            //-----------------------
            // 对外接口
            //-----------------------
            return {　　　　　　　
                init: init
            };
        }
    }
});