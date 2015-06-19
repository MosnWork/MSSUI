define(function(require, exports, module) {
    return {
        /**
         * 参数为对象:
         * target:目标对象
         * total:总数
         * page:当前页
         * pageSize:每页数
         * handle:回调事件
         * class:独立样式
         */
        set: function(_config) {
            var el, total, page, pageSize, maxPage, handle, _class;
            try {
                el = _config.target;
                if (typeof(_config.target) == "string") {
                    el = $(el);
                }
                total = parseInt(_config.total);
                page = parseInt(_config.page);
                pageSize = parseInt(_config.pageSize);
                maxPage = Math.ceil(total / pageSize);
                handle = _config.handle == undefined ? "" : (typeof(_config.handle) == "function" ? _config.handle : "");

                //CSS脱离
                _class = {
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
                    current: "mss-paging-current"
                };

                //CSS如果存在就合并
                if (_config.class && typeof(_config.class) === 'object') {
                    $.extend(_class, _config.class);
                }

            } catch (ex) {
                return false;
            }

            var html = "<div class=\"" + _class.paging + "\">";
            //大于2条出现上一页
            if (maxPage > 2 && page != 1) {
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
                if (i > 0 && i < maxPage + 1) {
                    if (page == i) {
                        html += "<a  class=\"" + _class.item + " " + _class.current + "\">" + i + "</a>";
                    } else {
                        html += "<a  class=\"" + _class.item + "\">" + i + "</a>";
                    }
                }
            }
            //当前页码大于最大数-5，出现后推
            if (maxPage > page + 3) {
                html += "<span class=\"" + _class.more + "\">...</span>";
            }
            if (maxPage > page + 2) {
                html += "<a class=\"" + _class.item + "\">" + maxPage + "</a>";
            }
            //大于2条出现下一页
            if (maxPage > 2 && page != maxPage) {
                html += "<a class=\"" + _class.next + "\"><i title=\"下一页\" class=\"" + _class.nexticon + "\"></i> 下一页</a>";
            }
            html += "<span class=\"" + _class.info + "\"><span class=\"" + _class.bold + "\">" + page + "/" + maxPage + "</span>页</span>   ";
            //大于12条出现跳转
            if (maxPage > 10) {
                html += "<span class=\"" + _class.which + "\"><input class=\"" + _class.page + "\"  value=\"" + page + "\" type=\"text\"></span>";
                html += "<a class=\"" + _class.go + "\">跳转</a>";
            }
            html += "</div>";
            if (el.find("." + _class.paging).length > 0) {
                el.find("." + _class.paging).remove();
            }
            var $pagHtml = $(html).appendTo(el);

            //-----------------------
            // 绑定分页事件
            //-----------------------
            //点击页码
            $pagHtml.on("click", "." + _class.item, function() {
                var gp = parseInt($(this).html());
                if (gp == page) {
                    return false;
                }
                if (handle != "") {
                    handle(gp);
                }
            })
            //上一页
            $pagHtml.on("click", "." + _class.prev, function() {
                var gp = page - 1;
                if (gp - 1 < 1) {
                    return false;
                }
                if (handle != "") {
                    handle(gp);
                }
            })
            //下一页
            $pagHtml.on("click", "." + _class.next, function() {
                var gp = page + 1;
                if (gp + 1 > maxPage) {
                    return false;
                }
                if (handle != "") {
                    handle(gp);
                }
            })
            //跳转
            $pagHtml.on("click", "." + _class.go, function() {
                var gp = parseInt($(this).parent().find("input").val());
                if (gp < 1) {
                    alert("超出限制：请输入1-" + maxPage + "的页码！");
                    return false;
                }
                if (page > maxPage) {
                    alert("超出限制：请输入1-" + maxPage + "的页码！");
                    return false;
                }
                if (handle != "") {
                    handle(gp);
                }
            })
        }
    }
});