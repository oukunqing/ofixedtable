oFixedTable.js
锁定表头及固定左边列，原生JS原创代码

需要注意的问题：
1.表格的宽度以及表格每一列的宽度需要固定（特殊情况除外：当表格列数少并且表格总宽度明显小于表格父容器的宽度时，也就是表格列不存在自动换行的问题）
2.表格父容器尺寸大小改变时，需要调用 setBoxSize 方法，目的是判断父容器是否出现滚动条

1.1 修正了对IE6、IE7的兼容问题

1.2 修正了固定行、列的样式问题

1.3 IE6/IE7浏览器 不启用该功能

1.4 增加了拆分线，
    修正了重复生成锁定行列的问题以及生成错位的问题，
    修正了行、列事件无法复制的问题，
    增加了IE6/IE7/IE8 启用设置参数（ieLowVersionEnabled: true|false) ，默认不启用，
    注：IE6/7/8锁定表头 由于兼容性问题，有些情况下会有一些错位的问题

1.5 增加了 显示/隐藏功能，修正了非IE浏览器下列宽错位问题

1.6 修正了当有合并单元格时，锁定单元格错位的问题，修正了表格行数较多时的性能问题

1.7 表格单元格可以不指定宽度（锁定时，取实际的单元格宽度），当单元格的左右两边的borderWidth不一样时，会有一些错位
    若单元格宽度是固定的，可以在第3个参数(config)中指定 isFixedSize:true
    修正表头列未锁定的Bug

1.8 修正表格含有thead时的样式丢失问题，以及行数设置问题，修正thead/tbody行归属问题

1.9 移除tb_top_left的底部边框线
    修正表格cellpadding/cellspacing的设置问题
    修复Firefox下的padding导致的错位问题
    修复thead复制没有底部分割线的问题
    修复thead复制时无背景色的问题
    增加复选框同步功能（如果是JS代码设置复选框选中，需要调用 .setCheckBoxSync()方法）
    .setCheckBoxSync 方法参数说明：4种参数
    1) 复选框控件（html object）数组
    2) 复选框控件（html object）
    3) 复选框控件ID (string)
    4) 空参数（尽量不用空参数）
    增加复选框选择：全选、取消、反选，需要调用 .setChecked(oper, name) oper: 1-全选，2-取消，3-反选； name: checkbox的 name属性名称
    解决启用bootstrap.css之后，表格列宽获取的问题，目前采用的方法是屏蔽，虽解决了问题，但不明所以，留待后续彻解。临时解决方案：在第3个参数(config)中指定 isBootstrap:true，或者也可以不指定，js会自动检测页面上有没有启用文件名为bootstrp的css（如果启用bootstrap.css，但文件名不是bootstrap，那请指定isBootstrap参数）。
    增加colStartRowIndex参数，当表格顶部的行有合并所有列的情况下，列宽计算从指定的行开始

    