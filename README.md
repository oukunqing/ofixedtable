# ofixedtable

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