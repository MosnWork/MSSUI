require.config({
    baseUrl: '../../assets/js',
    paths: {
        mssui: 'mssui',
        dialog: 'dialog'
    }
});


//页面初始化
require(['jquery', 'mssui'], function($, M) {
    M.init();
});