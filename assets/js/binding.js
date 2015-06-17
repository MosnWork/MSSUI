define(function(require, exports, module) {
    return {
        init: function(_name) {

            var _scope = {
                dom: "" //绑定结构
            }
            //获取DOM
            _scope.dom = $("[mss-mvc='" + _name + "']");
            document.getElementsByTagNameNS
            //            //获取源DOM--->记录源名
            //            _scope.dom.find("[mss-model]").each(function(i) {
            //                _scope.mod.push($(this));
            //                _scope.modName.push($(this).attr("mss-model"));
            //            })
            //            //获取视图DOM--->视图规则
            //            _scope.dom.find("[mss-view]").each(function(i) {
            //                _scope.view.push($(this));
            //                _scope.viewRules.push($(this).attr("mss-view"));
            //            })


            //---------------------
            // create 开始绑定--------入口
            //---------------------
            var create = function() {
                //找到所有需要绑定的元素
                _scope.dom.find("[mss-model]").each(function() {
                    //识别元素找不同的绑定方法
                    if ($(this).attr("mss-type") == "checkbox") {
                        _start($(this), "checkbox");
                    }
                    if ($(this).attr("mss-type") == "radio") {
                        _start($(this), "radio");
                    }
                    if ($(this).attr("mss-type") == "input") {
                        _start($(this), "input");
                    }
                    if ($(this).attr("mss-type") == "select") {
                        _start($(this), "select");
                    }
                    if ($(this).attr("mss-type") == "textarea") {
                        _start($(this), "textarea");
                    } else {
                        _start($(this), "input");
                    }
                })
            }



            //
            var _start = function(obj, type) {
                switch (type) {
                    //多选判定
                    case "checkbox":
                        obj.on("click", "input", function() {
                            var value = [];
                            obj.find("input").each(function() {
                                if ($(this).is(":checked")) {
                                    value.push($(this).val());
                                }
                            })
                            _controller(obj.attr("mss-model"), value);
                        })
                        break;
                    case "rodio":
                        obj.on("click", "input", function() {
                            var value;
                            obj.find("input").each(function() {
                                if ($(this).is(":checked")) {
                                    value = $(this).val();
                                }
                            })
                            _controller(obj.attr("mss-model"), value);
                        })
                        break;
                    case "input":
                        obj.on("input propertychange", function() {
                            _controller(obj.attr("mss-model"), obj.val());
                        })
                        break;
                    case "select":
                        obj.change(function() {
                            _controller(obj.attr("mss-model"), obj.val());
                        })
                        break;
                    case "textarea":
                        obj.change(function() {
                            _controller(obj.attr("mss-model"), obj.val());
                        })
                        break;
                    default:
                        obj.on("input propertychange", function() {
                            _controller(obj.attr("mss-model"), obj.val());
                        })

                }

            }






            var _controller = function(name, value) {
                console.log(name);
                console.log(value);

            }

            var _update = function() {


            }

            var _destroy = function() {


            }


            //-----------------------
            // 对外接口
            //-----------------------
            return {　　　　　　　
                create: create //初始化
            };
        }
    }

});