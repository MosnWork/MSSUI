define(function(require, exports, module) {
    return {
        init: function() {

            //---------------------
            // JS初始化原型
            //---------------------
            $(function() {
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

            //---------------------
            // _op 接口参数
            //---------------------
            var _op = {
                node: [{
                    el: "", //验证元素
                    trigger: "", //触发方式，如果为空就为blur
                    location: "", //信息位置
                    show: true, //显示错误信息，默认是显示的，如果传false过来就关闭，我回调会告诉你验证通过没
                    join: [], ////拼接字符串//   ["#asd",true,"@"] 目标，前后（true：前），中间字符
                    required: true, //必须验证
                    number: true, //必须输入合法的数字（负数，小数）。
                    digits: true, //	必须输入整数。
                    equalTo: "#field", //	输入值必须和 #field 相同。
                    email: true, //必须输入正确格式的电子邮件。
                    mobile: true, //必须输入正确格式的手机号码。
                    phone: true, //必须输入正确格式的电话。
                    maxlength: 5, //输入长度最多是 5 的字符串（汉字算一个字符）。
                    minlength: 10, //	输入长度最小是 10 的字符串（汉字算一个字符）。
                    max: 5, //	输入值不能大于 5。
                    min: 10, //输入值不能小于10。
                    url: true, //必须输入正确格式的网址。
                    card: true, //必须输入正确格式的身份证。
                    password: 2, //密码验证，4种强度:0-3，这里填写通过强度0:一种，1:2种,2,3种，3：特殊字母
                    rules: /[!,@#$%^&*?_~]/, //自定义规则
                    remote: "", //
                    success: function() {}, //正确回调
                    error: function() {}
                    //错误回调
                }],
                submit: {
                    btn: "#beginstn",
                    asyn: true,
                    callback: function() {}
                } //提交元素
            };

            //---------------------
            // _messages 消息参数-可传入，初始化第二个参数，自动检测如果存在则判断为消息初始化
            //---------------------
            var _messages = {
                required: "必选字段",
                number: "请输入合法的数字",
                digits: "只能输入整数",
                equalTo: "请再次输入相同的值",
                email: "请输入正确格式的电子邮件",
                mobile: "请输入正确格式的手机号码",
                phone: "请输入正确格式的电话号码",
                maxlength: "超出长度限制:",
                minlength: "小于长度限制:",
                max: "超出最大限制:",
                min: "超出最小限制:",
                remote: "服务器验证错误",
                card: "请输入合法的身份证号码",
                url: "请输入合法的网址",
                password: "当前强度：",
                rules: "自定义验证失败"
            }

            //---------------------
            // _inlay 内置参数
            //---------------------
            var _inlay = {
                state: false,
                dom: "",
                submit: ""

            }

            //---------------------
            // 初始化
            //---------------------
            if (_inlay.state == false) {
                if (arguments.length < 1) {
                    alert("验证初始化失败，未设置验证规则.");
                    return false;
                } else if (arguments.length < 2) {
                    //合并基础参数
                    if (arguments[0] && typeof arguments[0] === 'object') {
                        $.extend(_op, arguments[0]);
                    }
                } else {
                    //合并基础参数
                    if (arguments[0] && typeof arguments[0] === 'object') {
                        $.extend(_op, arguments[0]);
                    }
                    //合并信息参数
                    if (arguments[1] && typeof arguments[1] === 'object') {
                        $.extend(_messages, arguments[1]);
                    }
                }
                _inlay.state = true;
                _inlay.dom = $(_op.target);
                _inlay.submit = $(_op.submit);
            }

            //-----------------------
            // validate 验证开始
            //-----------------------
            var validate = function() {
                //遍历而添加方法
                for (var i = 0; i < _op.node.length; i++) {
                    _addEvent(_op.node[i]);
                }
                if (_op.submit.btn) {
                    $(_op.submit.btn).click(function() {
                        var results = true;
                        if (results == true) {
                            if (_op.submit.asyn == true) {
                                //console.log($("form").serializeArray());//输出表单值
                                _op.submit.callback($(this).closest("form").serializeArray());
                            } else {
                                $(this).closest("form").submit();
                            }
                        }
                        return false;
                    })
                }
            }

            //-----------------------
            // _addEvent 绑定事件
            //-----------------------
            var _addEvent = function(op) {
                //当前元素
                var el = "";
                if (op.el) {
                    el = $(op.el).length > 0 ? $(op.el) : "";
                }
                //判断触发方式
                //console.log(el[0].type); //debug--当前类型
                var trigger = "change";
                if (op.trigger == true) {
                    if (el[0].type == "text" || el[0].type == "textarea") {
                        trigger = "blur keyup";
                    }
                } else {
                    trigger = "blur";
                    if (el[0].type == "text" || el[0].type == "textarea") {
                        trigger = "blur";
                    }
                }
                //绑定事件
                //console.log(trigger); //debug--输出监控事件
                el.on(trigger, function() {
                    //根据类型判断如何取值
                    var $val = "";
                    if (el[0].type == "text" || el[0].type == "textarea" || el[0].type == "select-one") {
                        $val = el.val();
                    } else if (el[0].type == "radio") {
                        $val = $(op.el + ":checked").val();
                    } else if (el[0].type == "checkbox") {
                        $val = [];
                        $(op.el + ":checked").each(function() {
                            $val.push($(this).val());
                        })
                    } else {
                        $val = el.val();
                    }
                    if (op.join && op.join.length > 0) {
                        if (op.join[1] == true) {
                            $val = $(op.join[0]).val() + op.join[2] + $val;
                        } else {
                            $val = $val + op.join[2] + $(op.join[0]).val();
                        }
                    }
                    _rules(op, $val);
                })
            }

            //-----------------------
            // _rules 验证规则
            //-----------------------
            var _rules = function(op, val) {
                var isTrue = true;
                var erroringo = [];
                if (op.required && op.required == true) {
                    var pass = _basis("required", val, "");
                    if (pass == false) {
                        isTrue = false;
                        erroringo.push(_messages["required"]);
                    }
                }
                if (op.number && op.number == true) {
                    var pass = _basis("number", val, "");
                    if (pass == false) {
                        isTrue = false;
                        erroringo.push(_messages["number"]);
                    }
                }
                if (op.digits && op.digits == true) {
                    var pass = _basis("digits", val, "");
                    if (pass == false) {
                        isTrue = false;
                        erroringo.push(_messages["digits"]);
                    }
                }
                if (op.equalTo) {
                    var pass = _basis("equalTo", val, op.equalTo);
                    if (pass == false) {
                        isTrue = false;
                        erroringo.push(_messages["equalTo"]);
                    }
                }
                if (op.email && op.email == true) {
                    var pass = _basis("email", val, "");
                    if (pass == false) {
                        isTrue = false;
                        erroringo.push(_messages["email"]);
                    }
                }
                if (op.mobile && op.mobile == true) {
                    var pass = _basis("mobile", val, "");
                    if (pass == false) {
                        isTrue = false;
                        erroringo.push(_messages["mobile"]);
                    }
                }
                if (op.phone && op.phone == true) {
                    var pass = _basis("phone", val, "");
                    if (pass == false) {
                        isTrue = false;
                        erroringo.push(_messages["phone"]);
                    }
                }
                if (op.maxlength) {
                    var pass = _basis("maxlength", val, op.maxlength);
                    if (pass == false) {
                        isTrue = false;
                        erroringo.push(_messages["maxlength"] + op.maxlength);
                    }
                }
                if (op.minlength) {
                    var pass = _basis("minlength", val, op.minlength);
                    if (pass == false) {
                        isTrue = false;
                        erroringo.push(_messages["minlength"] + op.minlength);
                    }
                }
                if (op.max) {
                    var pass = _basis("max", val, op.max);
                    if (pass == false) {
                        isTrue = false;
                        erroringo.push(_messages["max"] + op.max);
                    }
                }
                if (op.min) {
                    var pass = _basis("min", val, op.min);
                    if (pass == false) {
                        isTrue = false;
                        erroringo.push(_messages["min"] + op.min);
                    }
                }
                if (op.url && op.url == true) {
                    var pass = _basis("url", val, "");
                    if (pass == false) {
                        isTrue = false;
                        erroringo.push(_messages["url"]);
                    }
                }
                if (op.card && op.card == true) {
                    var pass = _basis("card", val, "");
                    if (pass == false) {
                        isTrue = false;
                        erroringo.push(_messages["card"]);
                    }
                }
                if (op.password) {
                    var pass = _basis("password", val, "");
                    console.log(pass);
                    if (pass < op.password) {
                        isTrue = false;
                        switch (pass) {
                            case -1:
                                erroringo.push(_messages["password"] + "极弱，请填写6-16位字符,可包含：!,@#$%^&*?_~");
                                break;
                            case 0:
                                erroringo.push(_messages["password"] + "弱,可包含：!,@#$%^&*?_~");
                                break;
                            case 1:
                                erroringo.push(_messages["password"] + "一般，请填写6-16位字符,可包含：!,@#$%^&*?_~");
                                break;
                            case 2:
                                erroringo.push(_messages["password"] + "中，请填写6-16位字符,可包含：!,@#$%^&*?_~");
                                break;
                            case 3:
                                erroringo.push(_messages["password"] + "强，请填写6-16位字符,可包含：!,@#$%^&*?_~");
                                break;
                            case 4:
                                erroringo.push(_messages["password"] + "超强，请填写6-16位字符,可包含：!,@#$%^&*?_~");
                                break;
                        }

                    }
                }
                if (op.rules) {
                    try {
                        var reg = op.rules;
                        if (!reg.test(val)) {
                            isTrue = false;
                            erroringo.push(_messages.rules);
                        }
                    } catch (ex) {
                        isTrue = false;
                        erroringo.push(_messages.rules);
                    }

                }
                if (op.remote) {
                    //异步的毛病
                    $.ajax({
                        type: 'get',
                        url: op.remote,
                        data: {
                            value: val
                        },
                        dataType: 'json',
                        success: function(data) {
                            if (data == true || data == "true") {
                                _callback(op, isTrue, erroringo);
                            } else {
                                isTrue = false;
                                erroringo.push(_messages["remote"]);

                                _callback(op, isTrue, erroringo);
                            }
                        },
                        error: function() {
                            isTrue = false;
                            erroringo.push(_messages["remote"]);

                            _callback(op, isTrue, erroringo);
                        }
                    });
                } else {
                    _callback(op, isTrue, erroringo);
                }

            }

            //-----------------------
            // _basis 基础规则验证
            //-----------------------
            var _basis = function(key, val, standby) {
                switch (key) {
                    //是否为空
                    case "required":
                        if (val.length == 0) {
                            return false;
                        }
                        break;
                        //合法的数字
                    case "number":
                        if (isNaN(val)) {
                            return false;
                        }
                        break;
                        //整数
                    case "digits":
                        var reg = /^[1-9]+[0-9]*]*$/;
                        if (!reg.test(val)) {
                            return false;
                        }
                        break;
                        //对比
                    case "equalTo":
                        if (val != $(standby).val()) {
                            return false;
                        }
                        break;
                        //邮箱
                    case "email":
                        var reg = /^\w+([\.\-]\w+)*\@\w+([\.\-]\w+)*\.\w+$/;
                        if (!reg.test(val)) {
                            return false;
                        }
                        break;
                        //手机号码
                    case "mobile":
                        var reg = /^0?1[3|4|5|7|8][0-9]\d{8}$/;
                        if (!reg.test(val)) {
                            return false;
                        }
                        break;
                        //手机号码
                    case "phone":
                        var reg = /^0[\d]{2,3}-[\d]{7,8}$/;
                        if (!reg.test(val)) {
                            return false;
                        }
                        break;

                        //最短
                    case "minlength":
                        if (val.length < parseInt(standby)) {
                            return false;
                        }

                        break;
                        //最长
                    case "maxlength":
                        if (val.length > parseInt(standby)) {
                            return false;
                        }
                        break;
                        //最大
                    case "max":
                        if (isNaN(val)) {
                            return false;
                        } else {
                            if (parseInt(val) > parseInt(standby)) {
                                return false;
                            }
                        }
                        break;
                        //最小
                    case "min":
                        if (isNaN(val)) {
                            return false;
                        } else {
                            if (parseFloat(val) < parseInt(standby)) {
                                return false;
                            }
                        }
                        break;
                        //网址
                    case "url":
                        var reg = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
                        if (!reg.test(val)) {
                            return false;
                        }
                        break;
                        //网址
                    case "card":
                        if (!(/(^\d{15}$)|(^\d{17}([0-9]|X)$)/.test(val))) {
                            return false;
                        }
                        var len, re;    
                        len = val.length;
                        if (len == 15) {
                            re = new RegExp(/^(\d{6})(\d{2})(\d{2})(\d{2})(\d{3})$/);
                            var arrSplit = val.match(re);
                            //检查生日日期是否正确
                            var dtmBirth = new Date('19' + arrSplit[2] + '/' + arrSplit[3] + '/' + arrSplit[4]);
                            var bGoodDay;
                            bGoodDay = (dtmBirth.getYear() == Number(arrSplit[2])) && ((dtmBirth.getMonth() + 1) == Number(arrSplit[3])) && (dtmBirth.getDate() == Number(arrSplit[4]));
                            if (!bGoodDay) {
                                return false;
                            }
                        }
                        if (len == 18) {
                            re = new RegExp(/^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X)$/);
                            var arrSplit = val.match(re);
                            //检查生日日期是否正确
                            var dtmBirth = new Date(arrSplit[2] + "/" + arrSplit[3] + "/" + arrSplit[4]);
                            var bGoodDay;
                            bGoodDay = (dtmBirth.getFullYear() == Number(arrSplit[2])) && ((dtmBirth.getMonth() + 1) == Number(arrSplit[3])) && (dtmBirth.getDate() == Number(arrSplit[4]));
                            if (!bGoodDay) {
                                return false;
                            }
                        }
                        break;
                        //密码
                    case "password":
                        var intensity = -1;
                        if (val.length < 6 || val.length > 16) {
                            return intensity;
                        }
                        if (val.match(/[a-z]/g)) {
                            intensity++;
                        }
                        if (val.match(/[0-9]/g)) {
                            intensity++;
                        }
                        if (val.match(/[A-Z]/g)) {
                            intensity++;
                        }
                        if (val.match(/[!,@#$%^&*?_~]/)) {
                            intensity++;
                        }
                        return intensity;
                        break;
                    default:
                        break;
                }
                return true;
            }

            //-----------------------
            // _callback 准备回调
            //-----------------------
            var _callback = function(op, fn, info) {
                //根据location判定出信息安排位置
                var $this = $(op.el);
                if (op.location && typeof(op.location) == "function") {
                    $this = op.location.apply($this);
                    //console.log($this); //输出当前对象
                }
                //写入错误信息
                //起始应该让下面的回调过程写，主要是怕用的人麻烦啊，所以我就解决了------可以使用show:false来关闭我写入错误信息的这块
                if (op.show && op.show == false) {} else {
                    if ($this.find(".mss-form-tip").length > 0) {
                        $this.find(".mss-form-tip").remove();
                    }
                    var color, txt, ico;
                    if (fn == true) {
                        color = "fn-cl-Green";
                        txt = "验证成功";
                        ico = "icon-ok";
                    } else {
                        color = "fn-cl-Red";
                        txt = info.join(",");
                        ico = "icon-remove";
                    }
                    $this.append("<p class=\"mss-form-tip " + color + "\"><i class=\"" + ico + "\"></i>" + txt + "</p>");
                }




                //console.log(op);//输出对象
                //console.log(fn);//输出判定
                if (fn == true) {
                    if (typeof(op.success) == "function") {
                        op.success($(op.el));
                    }
                } else {
                    if (typeof(op.error) == "function") {
                        op.error($(op.el));
                    }
                }
            }

            //-----------------------
            // return 对外接口
            //-----------------------
            return {　　　　　　　
                validate: validate
            };
        }
    }
});