define(function(require, exports, module) {
    return {
        init: function(_config) {
            "use strict";
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

            var Identification = "mss-input-" + new Date().getTime();
            var tableid = "mss-table-" + new Date().getTime();

            var _op = {
                target: "", //渲染主体
                width: "100%", //表格宽度
                forceFit: true, // 列宽按百分比自适应
                skin: "", //表格皮肤
                columns: [], //表头
                data: {}, //数据
                idField: "", //主属性--唯一属性
                click: false, //点击事件
                check: false, //选择
                multi: true, //多选
                handle: [], //每列后增加方法
                store: "", //异步数据参数
                pagingBar: false,
                error: "<img alt=\"Crying\" src=\"http://img03.taobaocdn.com/tps/i3/T1amCdXhXqXXXXXXXX-60-67.png\"><h4>查询的数据不存在</h4>", //错误提示
            };

            var _inlay = {
                state: false, //状态
                box: "", //容器
                dom: "", //整体DOM结构层
                thead: "", //头部
                tbody: "", //数据区
                tfoot: "", //尾部
                radio: "", //单选状态当前选择点
                check: [] //多选状态当前选择点
            }

            //CSS脱离
            var _class = {
                //基础
                table: "mss-table", //
                check: "mss-table-checkbox",
                checks: "mss-table-checkboxs",
                sort: "mss-table-sort", //
                sortup: "icon-sort-up",
                sortdown: "icon-sort-down",
                btn: "mss-table-abtn",
                paging: "mss-paging",
                prev: "mss-paging-prev",
                previcon: "icon-caret-right",
                next: "mss-paging-next",
                nexticon: "icon-caret-right",
                more: "mss-paging-ellipsis",
                item: "mss-paging-item",
                go: "mss-paging-goto",
                which: "mss-paging-which",
                page: "mss-paging-page",
                info: "mss-paging-info",
                bold: "mss-paging-bold",
                current: "mss-paging-current",
                other: ""
            }

            //内置加载条动画

            //初始化
            //合并参数
            if (_config && typeof _config === 'object') {
                $.extend(_op, _config);
            }
            if (_op.target == "" || $(_op.target).length <= 0) {
                _inlay.state = false;
                alert("目标为找到，初始化失败");
                return false;
            } else if (_op.columns.length <= 0) {
                _inlay.state = false;
                alert("未定义表头");
                return false;
            } else {
                _inlay.state = true;
                _inlay.box = $(_op.target);
                _inlay.box.css({
                    "position": "relative"
                });
                //强制修正，异步设置下数据清空以及分页打开
                if (_op.store != "") {
                    _op.data = {};
                    _op.pagingBar = true;
                } else {
                    _op.data.pagesSize = _op.data.data.length;
                    _op.data.page = 1;
                    _op.data.total = _op.data.data.length;
                }
            }



            //---------------------
            // apply 显示
            //---------------------
            var apply = function() {
                if (_inlay.state == false) {
                    alert("表格未初始化或已销毁");
                    return false;
                }
                //开始渲染主结构框架
                _inlay.dom = $("<table id=\"" + tableid + "\" class=\"" + _class.table + " " + _op.skin + "\"></table>").appendTo(_inlay.box);
                _inlay.thead = $(_getThead()).appendTo(_inlay.dom);
                _inlay.tbody = $("<tbody></tbody>").appendTo(_inlay.dom);
                _inlay.tfoot = $("<tfoot></tfoot>").appendTo(_inlay.dom);
                var leng = _op.columns.length;
                leng = _op.handle.length > 0 ? leng + 1 : leng;
                leng = _op.check == true ? leng + 1 : leng;
                _op.error = "<tr> <td align=\"center\" colspan=\"" + leng + "\">" + _op.error + "</td></tr>";

                //绑定事件
                _addEvent();

                //执行数据
                if (_op.store != "") {
                    _store(1);
                } else {
                    _theadrest();
                    _getShow();
                }
            }


            //---------------------
            // _getThead thead区
            //---------------------
            var _getThead = function() {
                var html = "<thead>";
                html += "<tr>";
                if (_op.check == true) {
                    html += "<th width=\"13px\">";
                    if (_op.multi == true) {
                        html += "<input class=\"" + _class.checks + "\" type=\"checkbox\" name=\"" + Identification + "\" />";
                    }
                    html += "</th>";
                }
                for (var i = 0; i < _op.columns.length; i++) {
                    var width = "";
                    if (_op.columns[i].width) {
                        if (_op.forceFit != true) {
                            if (typeof(_op.columns[i].width) == "number") {
                                width = "width=" + _op.columns[i].width + "px";
                            } else {
                                width = "width=" + _op.columns[i].width;
                            }
                        }
                    }
                    var cl = "";
                    if (_op.columns[i].sort) {
                        if (_op.columns[i].sort == true) {
                            cl += "class='" + _class.sort + "'";
                        }
                    }
                    if (_op.columns[i].elcls) {
                        html += "<th " + cl + " " + width + " align=\"" + _op.columns[i].elcls + "\">";
                    } else {
                        html += "<th " + cl + " " + width + ">";
                    }
                    html += _op.columns[i].title;

                    if (_op.columns[i].sort) {
                        if (_op.columns[i].sort == true) {
                            html += "<i class=\"\"></i>";
                        }
                    }
                    //排序
                    html += "</th>";
                }
                if (_op.handle.length > 0) {
                    html += "<th>";
                    html += "</th>";
                }
                html += "</tr>";
                html += "</thead>";
                return html;
            }

            //---------------------
            // _theadrest 重置头部图表
            //---------------------
            var _theadrest = function() {
                _inlay.thead.find("i").removeAttr("class");
            }
            //---------------------
            // _getShow 数据源解析区域
            //---------------------
            var _getShow = function() {
                try {
                    var html = "";
                    if (_op.data.result == true || _op.data.result == "true") {
                        if (_op.data.data.length > 0) {
                            //console.log(_op.data.data);
                            //如果有数据开始遍历
                            for (var i = 0; i < _op.data.data.length; i++) {
                                //数据方面的遍历结束
                                html += "<tr>";
                                //选择器
                                if (_op.check == true) {
                                    html += "<td width=\"13px\">";
                                    if (_op.multi == true) {
                                        html += "<input value=\"" + i + "\" class=\"" + _class.check + "\" type=\"checkbox\" name=\"" + Identification + "\" />";
                                    } else {
                                        html += "<input value=\"" + i + "\" class=\"" + _class.check + "\" type=\"radio\" name=\"" + Identification + "\" />";
                                    }
                                    html += "</td>";
                                }
                                //console.log("1");
                                //正文
                                for (var s = 0; s < _op.columns.length; s++) {
                                    var value = "";

                                    if (_op.columns[s].data) {

                                        var value = _op.data.data[i][_op.columns[s].data];
                                        //console.log(value);
                                    }
                                    if (_op.columns[s].elcls) {
                                        html += "<td  align=\"" + _op.columns[s].elcls + "\">" + value + "</td>";
                                    } else {
                                        html += "<td>" + value + "</td>";
                                    }
                                }
                                //console.log("2");
                                //操作器
                                if (_op.handle.length > 0) {
                                    html += "<td>";
                                    for (var h = 0; h < _op.handle.length; h++) {
                                        if (_op.handle[h].text) {
                                            html += "<a class=\"" + _class.btn + " " + _op.handle[h].elcl + "\">" + _op.handle[h].text + "</a>";
                                        }
                                    }
                                    html += "</td>";
                                }
                                html += "</tr>";
                            }
                        } else {
                            html = _op.error;
                        }
                    } else {
                        html = _op.error;
                    }
                    _inlay.tbody.html(html);
                    _paging();

                } catch (ex) {
                    console.log(ex);
                    _inlay.tbody.html(_op.error);
                }
            }

            //-----------------------
            // _paging 分页
            //-----------------------
            var _paging = function() {
                if (_op.pagingBar == true) {
                    var total = 0;
                    var page = 1;
                    var pageSize = 0;
                    var current = 0;
                    //console.log(_op.data);
                    if (_op.store != "") {
                        total = _op.data.total;
                        page = _op.data.page;
                        pageSize = _op.data.pageSize;
                        current = _op.data.data.length;
                    } else {
                        total = _op.data.data.length;
                        page = 1;
                        pageSize = _op.data.data.length;
                        current = _op.data.data.length;
                    }
                    var leng = _op.columns.length;
                    leng = _op.handle.length > 0 ? leng + 1 : leng;
                    leng = _op.check == true ? leng + 1 : leng;
                    var maxpage = Math.ceil(total / pageSize);
                    //console.log(pageSize);
                    var html = "<tr> <td colspan=\"" + leng + "\"><div class=\"" + _class.paging + "\">";
                    //大于2条出现上一页
                    if (maxpage > 2 && page != 1) {
                        html += "<a class=\"" + _class.prev + "\"><i title=\"上一页\" class=\"" + _class.previcon + "\"></i> 上一页</a>";
                    }
                    //页码大于6条出现前推
                    if (page > 4) {
                        html += "<a class=\"" + _class.item + "\">1</a>";
                    }
                    if (page > 5) {
                        html += "<span class=\"" + _class.more + "\">...</span>";
                    }
                    //玄幻页码
                    for (var i = page - 3; i < page + 3; i++) {
                        if (i > 0 && i < maxpage + 1) {
                            if (page == i) {
                                html += "<a  class=\"" + _class.item + " " + _class.current + "\">" + i + "</a>";
                            } else {
                                html += "<a  class=\"" + _class.item + "\">" + i + "</a>";
                            }
                        }
                    }
                    //当前页码大于最大数-5，出现后推
                    if (maxpage > page + 3) {
                        html += "<span class=\"" + _class.more + "\">...</span>";
                    }
                    if (maxpage > page + 2) {
                        html += "<a class=\"" + _class.item + "\">" + maxpage + "</a>";
                    }
                    //大于2条出现下一页
                    if (maxpage > 2 && page != maxpage) {
                        html += "<a class=\"" + _class.next + "\"><i title=\"下一页\" class=\"" + _class.nexticon + "\"></i> 下一页</a>";
                    }
                    html += "<span class=\"" + _class.info + "\"><span class=\"" + _class.bold + "\">" + page + "/" + maxpage + "</span>页</span>   ";
                    //大于12条出现跳转
                    if (maxpage > 10) {
                        html += "<span class=\"" + _class.which + "\"><input class=\"" + _class.page + "\"  value=\"" + page + "\" type=\"text\"></span>";
                        html += "<a class=\"" + _class.go + "\">跳转</a>";
                    }
                    html += "</div></td></tr>"
                    _inlay.tfoot.html(html);
                }
            }

            //-----------------------
            // _store 数据源
            //-----------------------
            var _store = function(page) {
                var $mask;
                if (_op.store.mask) {
                    $mask = $("<div class=\"mss-dialog-shade\" style=\"position: absolute;width:" + _inlay.box.width() + "px;height:" + _inlay.box.height() + "px;\"><div style=\"position: absolute;left:50%;margin-left:-30px;top:50%;margin-top:-12px;height:24px;width:60px;\"><img src=\"../../assets/images/loading-0.gif\" border=\"0\"></div></div>").appendTo(_inlay.dom);
                }

                //处理URL
                var params;
                if (_op.store.params) {
                    params = _op.store.params;
                }
                params.page = page;
                params.pageSize = _op.store.pageSize;
                var type = "get";
                if (_op.store.type) {
                    type = _op.store.type;
                }
                //处理异步              
                $.ajax({
                    type: type,
                    url: _op.store.url,
                    dataType: "JSON",
                    data: params,
                    async: true,
                    success: function(data) {
                        _op.data = data;
                        if (_op.store.mask) {
                            $mask.remove();
                        }
                        _theadrest();
                        _getShow();
                    },
                    error: function() {
                        var data = {
                            "result": false,
                            "total": 0,
                            "pagesSize": 0,
                            "page": 0,
                            "data": []
                        }
                        _op.data = data;
                        if (_op.store.mask) {
                            $mask.remove();
                        }
                        _theadrest();
                        _getShow();
                    }
                })
            }

            //-----------------------
            // _addEvent 绑定事件
            //-----------------------
            var _addEvent = function() {
                // 绑定分页事件
                //-----------------------
                //点击页码
                _inlay.tfoot.on("click", "." + _class.item, function() {
                    var page = $(this).html();
                    if ($(this).hasClass(_class.current)) {
                        return false;
                    }
                    _store(parseInt(page));
                })
                //上一页
                _inlay.tfoot.on("click", "." + _class.prev, function() {
                    var page = parseInt($(this).siblings("." + _class.current).html());
                    if (page - 1 < 1) {
                        return false;
                    }
                    _store(page - 1);
                })
                //下一页
                _inlay.tfoot.on("click", "." + _class.next, function() {
                    var page = parseInt($(this).siblings("." + _class.current).html());
                    if (page + 1 > parseInt($($(this).parent().find("." + _class.item)[$(this).parent().find("." + _class.item).length - 1]).html())) {
                        return false;
                    }
                    _store(page + 1);
                })
                //跳转
                _inlay.tfoot.on("click", "." + _class.go, function() {
                    var page = parseInt($(this).parent().find("input").val());
                    if (page < 1) {
                        alert("超出限制");
                        return false;
                    }
                    if (page > parseInt($($(this).parent().find("." + _class.item)[$(this).parent().find("." + _class.item).length - 1]).html())) {
                        alert("超出限制");
                        return false;
                    }
                    _store(page);
                })
                // 绑定排序事件
                //-----------------------
                _inlay.thead.on("click", "." + _class.sort, function() {
                    var index = $(this).index();
                    if (_op.check == true) {
                        if (index == 0) {
                            return false;
                        }
                        index--;
                    }
                    if (_op.handle.length > 0) {
                        if ($(this).index() == _inlay.thead.find("th").length - 1) {
                            return false;
                        }
                    }
                    //console.log(_op.columns[index].sort);
                    if (_op.columns[index].sort) {
                        if (_op.columns[index].sort == true) {
                            var str = _op.columns[index].data;
                            var type = "string";
                            if (_op.columns[index].int) {
                                if (_op.columns[index].int == true) {
                                    type = "int";
                                }
                            }
                            if ($(this).find("i").hasClass(_class.sortup)) {
                                $(this).find("i").addClass(_class.sortdown).removeClass(_class.sortup);
                                _jsonSort(str, type, "down");
                            } else {
                                $(this).find("i").addClass(_class.sortup).removeClass(_class.sortdown);
                                _jsonSort(str, type, "up");
                            }
                            $(this).siblings().find("i").removeAttr("class");
                        } else {
                            return false;
                        }
                    }
                })
                //点击回调事件，针对单行
                if (typeof(_op.click) == "function") {
                    _inlay.tbody.on("click", "tr", function(e) {
                        var data = _op.data.data[$(this).index(0)];
                        _op.click(data);
                        _stopPropagation(e);
                    });
                }
                //针对按钮做回调事件
                if (_op.handle.length > 0) {
                    _inlay.tbody.on("click", "." + _class.btn, function(e) {
                        if (typeof(_op.handle[$(this).index()].callback) == "function") {
                            var data = _op.data.data[$(this).parent().parent().index(0)];
                            _op.handle[$(this).index()].callback(data);
                        }
                        _stopPropagation(e);
                    });
                }
                //阻止input冒泡

                _inlay.tbody.on("click", "input", function(e) {
                    _stopPropagation(e);
                });
            }

            //-----------------------
            // _jsonSort 数据排序
            //-----------------------
            var _jsonSort = function(str, type, fn) {
                if (type == "int") {
                    _op.data.data.sort(function compare(x, y) {
                        if (fn == "down") {
                            return (parseInt(x[str]) < parseInt(y[str])) ? 1 : -1
                        } else {
                            return (parseInt(x[str]) > parseInt(y[str])) ? 1 : -1
                        }
                    });
                } else {
                    _op.data.data.sort(function compare(x, y) {
                        if (fn == "down") {
                            return (x[str] < y[str]) ? 1 : -1
                        } else {
                            return (x[str] > y[str]) ? 1 : -1
                        }
                    });
                }
                _getShow();
            }

            //-----------------------
            // _stopPropagation 阻止冒泡
            //-----------------------
            var _stopPropagation = function(e) {
                e = e || window.event;
                if (e.stopPropagation) { //W3C阻止冒泡方法  
                    e.stopPropagation();
                } else {
                    e.cancelBubble = true; //IE阻止冒泡方法  
                }
            }


            //-----------------------
            // getPage 获取页码
            //-----------------------
            var getPage = function() {
                if (_inlay.state == true) {
                    return _op.data.page;
                } else {
                    alert("表格未初始化或者已被销毁");
                }
            }


            //-----------------------
            // getCurrent 获取当前页面数量
            //-----------------------
            var getCurrent = function() {
                if (_inlay.state == true) {
                    return _op.data.data.length;
                } else {
                    alert("表格未初始化或者已被销毁");
                }
            }
            //-----------------------
            // getTotal 获取总数
            //-----------------------
            var getTotal = function() {
                if (_inlay.state == true) {
                    return _op.data.total;
                } else {
                    alert("表格未初始化或者已被销毁");
                }
            }
            //-----------------------
            // getPageSize 获取单页数
            //-----------------------
            var getPageSize = function() {
                if (_inlay.state == true) {
                    return _op.data.pageSize;
                } else {
                    alert("表格未初始化或者已被销毁");
                }
            }

            //-----------------------
            // getTable 获取表格
            //-----------------------
            var getTable = function() {
                if (_inlay.state == true) {
                    return $("#" + tableid);
                } else {
                    alert("表格未初始化或者已被销毁");
                }
            }


            //-----------------------
            // replace 替换数据-- 暂时不提供
            //-----------------------
            //            var replace = function(data, asyn) {
            //
            //            }


            //-----------------------
            // hide 关闭
            //-----------------------
            var hide = function() {
                if (_inlay.state == true) {
                    _inlay.dom.hide();
                } else {
                    alert("表格未初始化或者已被销毁");
                }
            }
//-----------------------
            // show 显示
            //-----------------------
            var show = function() {
                if (_inlay.state == true) {
                    _inlay.dom.show();
                } else {
                    alert("表格未初始化或者已被销毁");
                }
            }

            //-----------------------
            // get 回去选中数据
            //-----------------------
            var get = function() {
                if (_inlay.state == true) {
                    if (_op.check == true) {
                        if (_op.multi == true) {
                            var back = [];
                            $("input:checkbox[name='" + Identification + "']:checked").each(function() {
                                back.push(_op.data.data[parseInt($(this).val())]);
                            })
                            return back;
                        }else {
                            var checkedObj = $("input:radio[name='" + Identification + "']:checked").val();
                            return _op.data.data[parseInt(checkedObj)];
                        }
                    } else {
                        alert("未定义选择");
                    }
                } else {
                    alert("表格未初始化或者已被销毁");
                }
            }
            //-----------------------
            // refresh 刷新
            //-----------------------
            var refresh = function() {
                if (_inlay.state == true) {
                    _getShow();
                } else {
                    alert("表格未初始化或者已被销毁");
                }
            }


            //-----------------------
            // destroy 销毁
            //-----------------------
            var destroy = function() {
                _inlay.state = false;
                _inlay.dom.remove();
            }


            //-----------------------
            // 对外接口
            //-----------------------
            return {　　　　　　　
                apply: apply, //显示
                getPage: getPage,
                getCurrent: getCurrent,
                getTotal: getTotal,
                getPageSize: getPageSize,
                getTable: getTable,
                //replace: replace,
                hide: hide,
                show: show, //显示
                get: get,
                refresh: refresh,
                destroy: destroy
            };
        }
    }
});