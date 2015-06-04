require.config({
    baseUrl: '../../assets/js',
    paths: {
        mssui: 'mssui',
        dialog: 'dialog',
        calendar: 'calendar'
    }
});


//页面初始化
require(['jquery', 'mssui', 'calendar'], function($, M, C) {
    M.init();
    C.init();
});