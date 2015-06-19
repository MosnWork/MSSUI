define(function(require, exports, module) {
    return {
        init: function(_config) {
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


            // _op 接口参数
            var _op = {
                name: "demo",
                handle: function() {}
            }


            // _inlay 内置参数
            var _inlay = {
                state: false, //状态
                scope: "", //作用域
                origin: [], //源
                originData: {}, //源数据
                view: [] //目标
            }

            if (_inlay.state == false) {
                //初始化
                //合并参数
                if (_config && typeof _config === 'object') {
                    $.extend(_op, _config);
                }

                //获取作用域
                _inlay.scope = $("[mss-mvc='" + _op.name + "']");
                //模型对象
                _inlay.scope.find("[mss-model]").each(function() {
                    var $el = $(this)[0].type == undefined ? $(this).find("input") : $(this);
                    //判断类型
                    //把绑定对象丢到数组记录
                    var _obj = {};
                    _obj.el = $el;
                    _obj.name = $(this).attr("mss-model");
                    _inlay.origin.push(_obj);
                    _inlay.originData[_obj.name] = _obj.el.val();
                })
                //数据对象
                _inlay.scope.find("[mss-view]").each(function() {
                    //把绑定对象丢到数组记录
                    var _obj = {};
                    _obj.el = $(this);
                    _obj.rules = $(this).attr("mss-view");
                    _obj.relevance = _obj.rules.match(/{{([^}}]+)?}}/g);
                    _inlay.view.push(_obj);
                })
                //这里就玩大发了.....反向曲线解析什么值改变了需要来发出编译赋值
            }

            /**
             * create 创建数据绑定（对外）
             * 循环所有源，开始绑定数据
             */
            var create = function() {
                for (var i = 0; i < _inlay.origin.length; i++) {
                    //丢给事件函数绑定数据并给出现在所在位置
                    _addEvent(_inlay.origin[i], i);
                }
            }

            /**
             * _addEvent 绑定源对象变化事件
             * 根据源类型判断如何触发数据变化
             * 数据变化交由控制器执行
             */
            var _addEvent = function(obj, i) {
                //当前元素
                var el = obj.el;
                //当前元素名
                var $name = obj.name;
                //当前序号
                var $i = i;
                //判断触发方式
                var trigger = "change";
                if (el[0].type == "text" || el[0].type == "textarea") {
                    trigger = "keyup";
                }
                //绑定事件
                //console.log(trigger); //debug--输出监控事件
                el.on(trigger, function() {
                    //改变存储值
                    _inlay.originData[$name] = _getval(el);
                    //告诉控制器谁变了
                    _controller($name);
                })
            }

            /**
             * _getval 取值
             * 根据源类型回去源当前数据
             */
            var _getval = function(el) {
                var $val = "";
                if (el[0].type == "text" || el[0].type == "textarea" || el[0].type == "select-one") {
                    $val = el.val();
                } else if (el[0].type == "radio") {
                    el.each(function() {
                        if ($(this).is(":checked")) {
                            $val = $(this).val();
                        }
                    })
                    //console.log($val);
                } else if (el[0].type == "checkbox") {
                    $val = [];
                    el.each(function() {
                        if ($(this).is(":checked")) {
                            $val.push($(this).val());
                        }
                    })
                    //console.log($val);
                } else {
                    $val = el.val();
                }
                return $val;
            }

            /**
             * _controller 控制器
             * 接受变化通知
             * 根据反向找到可变化值
             */
            var _controller = function(name) {
                for (var i = 0; i < _inlay.view.length; i++) {
                    if (_inlay.view[i].relevance.indexOf("{{" + name + "}}") >= 0) {
                        _compile(i);
                    }
                }




                //                console.log(_inlay.originData);
                //                var tpl = 'Hei, my name is {{checkbox}}, and I\'m {{select}} years old.';
                //                console.log(tpl);
                //
                //                var arr = tpl.match(/{{([^}}]+)?}}/g);
                //
                //                console.log(arr);
                //                var result = tpl.replace(/{{([^}}]+)?}}/g, function(s0, s1) {
                //                    return _inlay.originData[s1];
                //                });
                //                console.log(result);
            }


            /**
             * _compile 编译输出
             * 根据控制器通知我改变哪里
             * 根据反向找到可变化值
             */
            var _compile = function(index) {
                console.log(index);
                var tpl = _inlay.view[index].rules;
                var result = tpl.replace(/{{([^}}]+)?}}/g, function(s0, s1) {
                    return _inlay.originData[s1];
                });
                _inlay.view[index].el.html(result);
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