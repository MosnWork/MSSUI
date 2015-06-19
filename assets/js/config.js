require.config({
    baseUrl: 'http://www.mui.com/assets/modul',
    paths: {
        jquery: "jquery1.8.3",
        mssui: 'mssui', //MSS基础
        calendar: 'calendar', //日历
        dialog: 'dialog', //弹出层
        tree: 'tree', //树
        table: "table", //表格
        validate: 'validate', //验证
        template: 'template', //模板渲染
        edit: "edit", //编辑器
        charts: "charts", //图标
        binding: 'binding', //数据绑定
        mask: "mask", //遮罩层
        template: 'template',//模板引擎
        cookie:'cookie'//cookie操作
    }
});

//页面初始化
require(['jquery', 'mssui', 'calendar'], function($, M, C) {
    M.init();
    C.init();
});