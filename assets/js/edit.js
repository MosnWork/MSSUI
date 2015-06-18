define(function(require, exports, module) {
    return {
        init: function(_el) {

            //---------------------
            // _op 接口参数
            //---------------------
            var _op = {
                target: "" //绑定对象
            };

            //---------------------
            // _class 样式，可样式脱离
            //---------------------
            var _class = {
                box: "mss-edit",
                toolbar: "mss-edit-toolbar",
                color: "fn-linear-lightblue",
                content: "mss-edit-content",
                item: "mss-edit-item"
            }

            //---------------------
            // _inlay 内置参数
            //---------------------
            var _inlay = {
                state: false,
                dom: "",
                toolbar: "",
                content: ""
            }
            //---------------------
            // _saveRange 鼠标对象
            //---------------------
            var _saveRange;
            //---------------------
            // _browser 当前浏览器
            //---------------------
            var _browser = $.browser.msie;
            //---------------------
            // 初始化
            //---------------------
            if (_inlay.state == false) {
                _op.target = $(_el);
                _inlay.state = true;
            }






            //---------------------
            // _icon 控件
            //---------------------
            var _icon = [{
                    icon: "icon-eye-open",
                    text: "源代码",
                    handle: function() {
                        $.browser.msie ? document.execCommand('ForeColor', false, '#BBDDCC') : document.execCommand('foreColor', false, '#BBDDCC');
                        return false;
                    }
                }, {
                    icon: "icon-bold",
                    text: "加粗"
                }, {
                    icon: "icon-italic",
                    text: "倾斜"
                }, {
                    icon: "icon-strikethrough",
                    text: "删除线"
                }, {
                    icon: "icon-underline",
                    text: "下划线"
                }, {
                    icon: "icon-align-left",
                    text: "居左"
                }, {
                    icon: "icon-align-center",
                    text: "居中"
                }, {
                    icon: " icon-align-right",
                    text: "居右"
                }

            ]

            //---------------------
            // create 创建
            //---------------------
            var create = function() {
                var w = _op.target.parent().outerWidth() - 2;
                var h = _op.target.parent().outerHeight() - 2;
                h = h < 200 ? 200 : h;
                var html = "<div class=\"" + _class.box + "\" style=\"width:" + w + "px;height:" + h + "px;\"></div>";
                _inlay.box = $(html).appendTo(_op.target.parent());
                _op.target.hide();
                var thtml = "<div class=\"" + _class.toolbar + "  " + _class.color + "\"></div>";
                _inlay.toolbar = $(thtml).appendTo(_inlay.box);
                _addicon();
                var chtml = "<div contentEditable=\"true\" class=\"" + _class.content + "\" style=\"width:" + (_inlay.box.width() - 10) + "px;height:" + (_inlay.box.height() - _inlay.toolbar.outerHeight(true) - 10) + "px\"></div>";
                _inlay.content = $(chtml).appendTo(_inlay.box);
                _inlay.content.contentEditable = true;
                _inlay.content.designMode = "on";
            }


            //---------------------
            // _addicon 创建
            //---------------------
            var _addicon = function() {
                for (var i = 0; i < _icon.length; i++) {
                    var html = "<button act=\"" + i + "\" class=\"" + _class.item + "\" title=\"" + _icon[i].text + "\"><i class=\"" + _icon[i].icon + "\"></i></button>";
                    $(html).appendTo(_inlay.toolbar).click(function(i) {
                        _getSelect();
                        if (typeof(_icon[parseInt($(this).attr("act"))].handle) == "function") {
                            _icon[parseInt($(this).attr("act"))].handle();
                        }
                        _inlay.range.s
                        return false;
                    })
                }
            }


            //---------------------
            // _getSelect 记录光标
            //---------------------
            var _getSelect = function() {
                if (_browser) {
                    _inlay.range = document.selection.createRange();
                } else {
                    _inlay.range = window.getSelection().getRangeAt(0);
                }
            }
            //---------------------
            // _getrangeback 还原光标
            //---------------------
            var _getrangeback = function() {
                if (_browser) {
                    _inlay.range.moveEnd("character", 0 - _inlay.range.text.length);
                    _inlay.range.select();
                } else {
                    _inlay.range.setStart(_inlay.range.startContainer, _inlay.range.startOffset);
                }
            }






            //存储之前光标位置信息的对象 
            var ieSelectionBookMark = null;
            //保存当前光标的位置 
            function SaveCusorPos() {
                //编辑器获取焦点 
                var wobj = document.getElementById("myiframe").contentWindow;
                wobj.focus();
                if (document.selection) {
                    //获取当前光标的位置
                    var rangeObj = wobj.document.selection.createRange();
                    ieSelectionBookMark = rangeObj.getBookmark();
                }
            }
            //把光标还原到之前保存的位置
            function SetCusorPos() {
                //编辑器获取焦点
                var wobj = document.getElementById("myiframe").contentWindow;
                wobj.focus();
                if (ieSelectionBookMark) {
                    //还原光标的位置
                    var rangeObj = wobj.document.selection.createRange();
                    rangeObj.moveToBookmark(ieSelectionBookMark);
                    rangeObj.select();
                    ieSelectionBookMark = null;
                }
            }





            //-----------------------
            // return 对外接口
            //-----------------------
            return {　　　　　　　
                create: create
            };
        }
    }
});