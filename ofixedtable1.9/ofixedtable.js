/*
    oFixedTable 1.9
    Author: 青梅煮酒 85079542 oukunqing@126.com
    Update: Update: 2018-04-18
*/
if (typeof ofixed_table_st == 'undefined') {
    var ofixed_table_st = window.setTimeout;
    window.setTimeout = function (fRef, mDelay) {
        if (typeof fRef == 'function') {
            var argu = Array.prototype.slice.call(arguments, 2);
            var f = (function () {
                fRef.apply(null, argu);
            });
            return ofixed_table_st(f, mDelay);
        }
        return ofixed_table_st(fRef, mDelay);
    };
}

function oFixedTable(id, obj, _cfg) {
    var _ = this;
    if (id == undefined || obj == undefined || obj == null || typeof obj != 'object') {
        return null;
    }
    _.id = id;
    _.obj = obj;
    _.box = _.obj.parentNode;

    _.arrRowCut = [];
    _.arrCellCut = [];

    _.config = {
        fixHead: typeof _cfg.fixHead != 'undefined' ? _cfg.fixHead : true,
        rows: _cfg.rows == undefined ? 1 : _cfg.rows,
        cols: _cfg.cols || 0,
        background: _cfg.background || '#fff',
        zindex: _cfg.zindex || 9999,
        showSplitLine: typeof _cfg.showSplitLine == 'boolean' ? _cfg.showSplitLine : true,
        splitLineColor: _cfg.splitLineColor || _cfg.lineColor || '#99bbe8',
        borderWidth: _cfg.borderWidth || '1px',
        //IE6/7/8是否启用锁定表头功能，默认不启用
        ieLowVersionEnabled: _cfg.ieLowVersionEnabled || false,
        isFixedSize: _cfg.isFixedSize || false,
        isBootstrap: _cfg.isBootstrap || null
    };
    //需要复制的元素或事件
    _.arrKey = ['className', 'lang', 'ondblclick', 'onclick', 'onmouseover', 'onmouseout'];
    _.arrKeyHead = ['className', 'lang', 'ondblclick', 'onclick'];

    _.tableIdDic = {};
    _.tableIdDicKey = { head: 'head', left: 'left', topleft: 'topleft' };

    var userAgent = navigator.userAgent;
    _.isMSIE = navigator.userAgent.indexOf('MSIE') >= 0 || navigator.userAgent.indexOf('Trident') >= 0;
    _.ieLowVersion = userAgent.indexOf('MSIE 6.0') >= 0 || userAgent.indexOf('MSIE 7.0') >= 0 || userAgent.indexOf('MSIE 8.0') >= 0;
    //火狐浏览器在这里有BUG，需要特殊处理
    _.isFirefox = userAgent.indexOf('Firefox') >= 0;
    
    _.setTableStyle();

    _.hasBootstrapCss = typeof _.config.isBootstrap == 'boolean' ? _.config.isBootstrap : _.checkBootstrap();

    //判断 IE6/IE7/IE8 是否启用锁定功能
    if (!_.ieLowVersion || _.config.ieLowVersionEnabled) {
        if (_.box != null) {
            //防止错位
            _.box.scrollLeft = 0;
            _.box.scrollTop = 0;
        }
        window.setTimeout(_._fixTable, 10, _);
    }
}

oFixedTable.prototype.checkBootstrap = function(){    
    var arr = document.getElementsByTagName('link');
    for(var i = 0, c = arr.length; i < c; i++) {
        var href = (arr[i].href || '').toLowerCase();
        if(href.indexOf('bootstrap') >= 0) {
            return true;
        }
    }
    return false;
};

oFixedTable.prototype.setTableStyle = function () {
    var _ = this;
    _.borderStyle = 'solid ' + _.config.borderWidth + ' ' + _.config.splitLineColor;
    _.tableCellStyle = ' cellpadding="' + _.obj.cellPadding + '" cellspacing="' + _.obj.cellSpacing + '"';
    _.tableOffset = ['', '', ''];
};

oFixedTable.prototype._fixTable = function (_) {
    if (_.obj.rows.length <= 0) {
        return false;
    }
    //先清除已生成的表头，防止重复生成
    _.clear();

    _.hasHead = _.buildHead();
    _.hasLeft = _.buildLeft();

    _.box.onscroll = function () {
        if (_.divHead != null) {
            _.divHead.scrollLeft = this.scrollLeft;
        }
        if (_.divLeft != null) {
            _.divLeft.scrollTop = this.scrollTop;
        }
    };
    if (_.hasHead && _.hasLeft) {
        _.buildTopLeft();
    }
    _.setCheckBoxSyncEvent();
};

oFixedTable.prototype.fixed = function () {
    this._fixTable(this);
};

oFixedTable.prototype.clear = function (id) {
    var _ = this;
    var arr = _._getControl(id || _.id);

    for (var i in arr) {
        if (arr[i] != null) {
            _.box.removeChild(arr[i]);
        }
    }
};

oFixedTable.prototype.show = function (isShow, id) {
    var _ = this;
    var arr = _._getControl(id || _.id);

    if (typeof isShow != 'boolean') {
        isShow = true;
    }
    for (var i in arr) {
        if (arr[i] != null) {
            arr[i].style.display = isShow ? '' : 'none';
        }
    }
};

oFixedTable.prototype.hide = function (id) {
    this.show(false, id);
};

oFixedTable.prototype._getControl = function (id) {
    var arr = [
        document.getElementById(id + '_div_head'),
        document.getElementById(id + '_div_left'),
        document.getElementById(id + '_div_top_left')
    ];
    return arr;
};

oFixedTable.prototype.setRowBackground = function(row, background){
    if(row.className == '' && background != '#fff' && background != '#ffffff'){
        return  'background:' + background + ';';
    }
    return '';
};

oFixedTable.prototype.buildHead = function () {
    var _ = this;
    if (_.config.rows <= 0) {
        return false;
    }
    var strDivId = _.id + '_div_head';
    var strTbId = _.id + '_tb_header';
    var div = document.createElement('div');
    div.id = strDivId;
    div.style.cssText = 'position:absolute;overflow:hidden;z-index:' + (_.config.zindex + 1) + ';display:none;' + _.tableOffset[0];
    div.innerHTML += '<table id="' + strTbId + '"' + _.tableCellStyle + '></table>';

    _.box.insertBefore(div, _.obj);
    _.divHead = div;
    _.setBoxSize();
    _.tbHead = document.getElementById(strTbId);

    if (null == _.tbHead) {
        return false;
    }
    _.tableIdDic[_.tableIdDicKey.head] = _.tbHead.id;

    _.tbHead.className = _.obj.className;
    _.tbHead.style.textAlign = _.obj.style.textAlign;
    _.tbHead.style.width = _.obj.offsetWidth + 'px';

    var hasHead = false;
    var isOver = false;
    var offset = 0;
    
    if (_.config.fixHead && _.obj.tHead != null) {
        var tHead = _.obj.tHead;
        _.tbHead.appendChild(tHead.cloneNode(true));
        hasHead = true;

        var headRows = _.obj.tHead.rows.length;
        if (_.config.cols > 0 && _.config.rows < headRows) {
            _.config.rows = headRows;
        }
        offset = headRows;
        isOver = _.config.rows <= headRows;
    }

    if(isOver) {
        if(isSplitRow || _.config.showSplitLine){
            for (var i = 0, rc = _.tbHead.rows.length; i < rc; i++) {
                var row = _.tbHead.rows[i];
                for (var j = 0, c = row.cells.length; j < c; j++) {
                    var cell = row.cells[j];
                    //最后一行 或行合并到底的单元格
                    if((i == rc - 1) || (cell.rowSpan == rc)){
                        cell.style.borderBottom = _.borderStyle;
                    }
                }
            }
        }
        _.tbHead.style.background = _.config.background;
    } else {
        var container = _.obj.tHead != null ? _.tbHead.createTHead() : _.tbHead;
        if (!_.ieLowVersion && !_.config.showSplitLine) {
            for (var i = offset; i < _.config.rows; i++) {
                var rowOld = _.obj.rows[i];
                if (rowOld != null) {
                    var row = rowOld.cloneNode(true);
                    _.copyElement(row, rowOld);

                    row.style.cssText = _.setRowBackground(row, _.config.background) + row.style.cssText;
                    row.style.height = rowOld.offsetHeight + 'px';
                    row.style.width = rowOld.offsetWidth + 'px';

                    container = _.createTBody(_.tbHead, rowOld) || container;
                    container.appendChild(row);
                    hasHead = true;
                }
            }
        } else {
            for (var i = offset; i < _.config.rows; i++) {
                var rowOld = _.obj.rows[i];
                container = _.createTBody(_.tbHead, rowOld) || container;
                var row = container.insertRow(container.rows.length);
                var cut = _.arrRowCut[i] || 0;
                var isSplitRow = _.config.showSplitLine && (i == _.config.rows - cut - 1);

                _.copyElement(row, rowOld);

                row.style.cssText = _.setRowBackground(row, _.config.background) + rowOld.style.cssText;
                row.style.height = rowOld.offsetHeight + 'px';
                row.style.width = rowOld.offsetWidth + 'px';

                for (var j = 0, c = rowOld.cells.length; j < c; j++) {
                    var oldCell = rowOld.cells[j];
                    if (oldCell != null) {
                        var cell = oldCell.cloneNode(true);
                        cell.style.cssText = oldCell.style.cssText;
                        cell.className = oldCell.className;

                        if (typeof oldCell.onclick == 'function') {
                            cell.onclick = function () {
                                oldCell.onclick(oldCell.param || oldCell.lang || '');
                            };
                        }

                        //指定列宽
                        cell.style.width = _.getCellWidth(oldCell) + 'px';

                        if (isSplitRow) {
                            cell.style.borderBottom = _.borderStyle;
                        } else if (i < _.config.rows && _.config.showSplitLine) {
                            //检测是否有被合并行的单元格
                            if (cell.rowSpan + i == _.config.rows) {
                                cell.style.borderBottom = _.borderStyle;
                            }
                        }
                        row.appendChild(cell);

                        hasHead = true;
                    }
                }
            }
        }
    }
    div.style.display = 'block';

    return hasHead;
};

oFixedTable.prototype.copyElement = function (row, rowOld, arrKey) {
    if (typeof arrKey == 'undefined') {
        arrKey = this.arrKey;
    }
    for (var k in arrKey) {
        var key = arrKey[k];
        if (rowOld[key] != null && rowOld[key] != undefined) {
            row[key] = rowOld[key];
        }
    }
};

oFixedTable.prototype.buildLeft = function () {
    var _ = this;
    if (_.config.cols <= 0) {
        return false;
    }
    var strDivId = _.id + '_div_left';
    var strTbId = _.id + '_tb_left';
    var div = document.createElement('div');
    div.id = strDivId;
    div.style.cssText = 'position:absolute;overflow:hidden;z-index:' + _.config.zindex + ';display:none;' + _.tableOffset[1];
    div.innerHTML = '<table id="' + strTbId + '"' + _.tableCellStyle + '></table>';

    _.box.insertBefore(div, _.obj);

    _.divLeft = div;
    _.setBoxSize();

    _.tbLeft = document.getElementById(strTbId);
    if (null == _.tbLeft) {
        return false;
    }
    _.tableIdDic[_.tableIdDicKey.left] = _.tbLeft.id;

    _.tbLeft.className = _.obj.className;
    _.tbLeft.style.textAlign = _.obj.style.textAlign;
    _.tbLeft.style.width = 'auto';

    var container = _.obj.tHead != null ? _.tbLeft.createTHead() : _.tbLeft;
    var hasLeft = false;
    for (var i = 0, rows = _.obj.rows.length; i < rows; i++) {
        var rowOld = _.obj.rows[i];
        container = _.createTBody(_.tbLeft, rowOld) || container;
        var row = container.insertRow(container.rows.length);
        _.copyElement(row, rowOld);

        row.style.cssText = _.setRowBackground(row, _.config.background) + rowOld.style.cssText;
        row.style.height = rowOld.offsetHeight + 'px';

        //除去被合并的单元格
        var cut = _.arrCellCut[i] || 0;
        for (var j = 0; j < _.config.cols - cut; j++) {
            var oldCell = rowOld.cells[j];
            if (oldCell != null) {
                if (_.ieLowVersion && _.config.ieLowVersionEnabled) {
                    var oldCellFirst = _.obj.rows[0].cells[j];
                    if (oldCellFirst != null) {
                        oldCell.style.width = oldCellFirst.style.width;
                    }
                }

                var cell = oldCell.cloneNode(true);
                cell.style.cssText = oldCell.style.cssText;
                cell.className = oldCell.className;

                if (typeof oldCell.onclick == 'function') {
                    cell.onclick = function () {
                        oldCell.onclick(oldCell.param || oldCell.lang || '');
                    };
                }

                if (j < _.config.cols) {
                    //检测是否有被合并行的单元格
                    if (cell.rowSpan > 1) {
                        for (var k = 1; k < cell.rowSpan; k++) {
                            _.setCellCut(i + k, cell.colSpan);
                        }
                    } else if (cell.colSpan > 1) {
                        _.setCellCut(i, cell.colSpan - 1);
                        cut = cell.colSpan - 1;
                    }
                }

                //指定列宽
                cell.style.width = _.getCellWidth(oldCell) + 'px';

                if (_.config.showSplitLine && (j == _.config.cols - cut - 1)) {
                    cell.style.borderRight = _.borderStyle;
                }
                row.appendChild(cell);

                hasLeft = true;
            }
        }
    }
    div.style.display = 'block';

    return hasLeft;
};

oFixedTable.prototype.setCellCut = function (idx, span) {
    if (this.arrCellCut[idx] == undefined) {
        this.arrCellCut[idx] = 0;
    }
    this.arrCellCut[idx] += span;
};

oFixedTable.prototype.buildTopLeft = function () {
    var _ = this;
    var strDivId = _.id + '_div_top_left';
    var strTbId = _.id + '_tb_top_left';
    var div = document.createElement('div');
    div.id = strDivId;
    div.style.cssText = 'position:absolute;overflow:hidden;z-index:' + (_.config.zindex + 2) + ';display:none;' + _.tableOffset[2];
    div.innerHTML = '<table id="' + strTbId + '"' + _.tableCellStyle + ' style="border:none;"></table>';
    _.box.insertBefore(div, _.obj);

    _.tbTopLeft = document.getElementById(strTbId);
    if (null == _.tbTopLeft) {
        return false;
    }
    _.tableIdDic[_.tableIdDicKey.topleft] = _.tbTopLeft.id;

    _.tbTopLeft.className = _.obj.className;
    _.tbTopLeft.style.textAlign = _.obj.style.textAlign;
    _.tbTopLeft.style.width = 'auto';

    var arrCellWidth = [];

    var container = _.obj.tHead != null ? _.tbTopLeft.createTHead() : _.tbTopLeft;
    var created = false;
    for (var i = 0; i < _.config.rows; i++) {
        var rowOld = _.obj.rows[i];
        container = _.createTBody(_.tbTopLeft, rowOld) || container;
        var row = container.insertRow(container.rows.length);
        var isSplitRow = _.config.showSplitLine && (i == _.config.rows - 1);

        _.copyElement(row, rowOld);

        row.style.cssText = _.setRowBackground(row, _.config.background) + rowOld.style.cssText;
        row.style.height = rowOld.offsetHeight + 'px';

        var cut = _.arrCellCut[i] || 0;
        for (var j = 0; j < _.config.cols - cut; j++) {
            var oldCell = rowOld.cells[j];
            if (oldCell != null) {
                var cell = oldCell.cloneNode(true);
                cell.style.cssText = oldCell.style.cssText;
                cell.className = oldCell.className;

                if (typeof oldCell.onclick == 'function') {
                    cell.onclick = function () {
                        oldCell.onclick(oldCell.param || oldCell.lang || '');
                    };
                }

                //指定列宽
                cell.style.width = _.getCellWidth(oldCell) + 'px';

                if (_.config.showSplitLine && (j == _.config.cols - cut - 1)) {
                    cell.style.borderRight = _.borderStyle;
                }
                if (isSplitRow) {
                    cell.style.borderBottom = _.borderStyle;
                } else if (i < _.config.rows && _.config.showSplitLine) {
                    //检测是否有被合并行的单元格
                    if (cell.rowSpan + i == _.config.rows) {
                        cell.style.borderBottom = _.borderStyle;
                    }
                }
                row.appendChild(cell);
            }
        }
    }
    div.style.display = 'block';
};

oFixedTable.prototype.isTHeadRow = function (row) {
    return row.parentNode != null && row.parentNode.tagName == 'THEAD';
};

oFixedTable.prototype.createTBody = function (table, row) {
    if (!this.isTHeadRow(row) && !table.created) {
        tbody = table.createTBody();
        table.created = true;
        return tbody;
    }
    return false;
};

oFixedTable.prototype.getElementStyle = function (cell, styleName) {
    if (cell.currentStyle) { //IE浏览器
        return cell.currentStyle[styleName];
    } else {
        return cell.ownerDocument.defaultView.getComputedStyle(cell, null)[styleName];
    }
};

oFixedTable.prototype.parseVal = function (pv) {
    return parseInt('0' + pv, 10);
};

oFixedTable.prototype.getCellWidth = function (cell, isHead) {
    var _ = this;
    if (_.config.isFixedSize) {
        return parseInt(_.getElementStyle(cell, 'width'), 10);
    } else {
        var ow = cell.offsetWidth, cellWidth;
        if (_.hasBootstrapCss) {
            return ow;
        }
        var pl = _.parseVal(_.getElementStyle(cell, 'paddingLeft')), pr = _.parseVal(_.getElementStyle(cell, 'paddingRight'));
        var bl = _.parseVal(_.getElementStyle(cell, 'borderLeftWidth')), br = _.parseVal(_.getElementStyle(cell, 'borderRightWidth'));
        //注意：在Firefox下可以获取到borderRightWidth，但获取不到borderLeftWidth
        //这里边框宽度只要减去右边的就可以了
        cellWidth = ow - pl - pr - br;

        return cellWidth;
    }
};

oFixedTable.prototype.setBoxSize = function () {
    try {
        var _ = this;
        if (_.divHead != null) {
            //判断是否出现纵向滚动条，若出现，宽度减去滚动条宽度 17px
            var sw = _.obj.offsetHeight >= _.box.offsetHeight ? 17 : 0;
            _.divHead.style.width = (_.box.offsetWidth - sw) + 'px';
        }
        if (_.divLeft != null) {
            //判断是否出现横向滚动条，若出现，高度减去滚动条高度 17px
            var sh = _.obj.offsetWidth >= _.box.offsetWidth ? 17 : 0;
            _.divLeft.style.height = (_.box.offsetHeight - sh) + 'px';
        }
    } catch (e) { }
};

oFixedTable.prototype.setCheckBoxSyncEvent = function (table, tableSync, prefix) {
    var _ = this;
    var arrOri = _.getInput(_.obj, ['checkbox', 'radio']);
    var arrHead = _.hasHead ? _.getInput(_.tbHead, ['checkbox', 'radio']) : [];
    var arrLeft = _.hasLeft ? _.getInput(_.tbLeft, ['checkbox', 'radio']) : [];
    var arrTopLeft = _.hasHead && _.hasLeft ? _.getInput(_.tbTopLeft, ['checkbox', 'radio']) : [];
    for (var i = 0, c = arrOri.length; i < c; i++) {
        arrOri[i].idx = i;
        // 复制原有的onchange事件，保证原有的onchange功能不受影响
        var callback = arrOri[i].onchange || null;
        if (typeof callback == 'function') {
            arrOri[i].change_callback = callback;
        }
        /*
        arrOri[i].onchange = function (e) {
            var idx = this.idx;
            _.__setSync(arrHead[idx], this);
            _.__setSync(arrLeft[idx], this);
            _.__setSync(arrTopLeft[idx], this);
            // 触发原有的onchange事件
            if (typeof this.change_callback == 'function') {
                this.change_callback();
            }
        };*/
        arrOri[i].addEventListener('change',function (e) {
            var idx = this.idx;
            _.__setSync(arrHead[idx], this);
            _.__setSync(arrLeft[idx], this);
            _.__setSync(arrTopLeft[idx], this);
            // 触发原有的onchange事件
            if (typeof this.change_callback == 'function') {
                this.change_callback();
            }
        }, false);
    }
    this.setCheckClickSyncEvent(arrHead, arrOri, 'tb_head_');
    this.setCheckClickSyncEvent(arrLeft, arrOri, 'tb_left_');
    this.setCheckClickSyncEvent(arrTopLeft, arrOri, 'tb_top_left_');
};

oFixedTable.prototype.__setSync = function (obj, objOri) {
    if (obj != null && objOri != null) {
        obj.checked = objOri.checked;
    }
};

oFixedTable.prototype.trim = function (str) {
    return str.replace(/(^[\s]*)|([\s]*$)/g, '');
};

oFixedTable.prototype.getInput = function (parent, types, name) {
    var hasName = typeof name == 'string' && this.trim(name) != '';
    var arr = parent.getElementsByTagName('input');
    var list = [];
    var inputType = ',' + types.join(',') + ',';
    for (var i = 0, c = arr.length; i < c; i++) {
        if (inputType.indexOf(',' + arr[i].type + ',') >= 0) {
            if(!hasName || (hasName && arr[i].name == name)) {
                list.push(arr[i]);
            }
        }
    }
    return list;
};

oFixedTable.prototype.setCheckClickSyncEvent = function (arr, arrOri, prefix) {
    for (var i = 0, c = arr.length; i < c; i++) {
        var id = arr[i].id || '';
        if (id != '') {
            arr[i].id = prefix + id;
        }
        arr[i].idx = i;
        var func = arrOri[i].onclick || null;
        arr[i].onclick = function (e) {
            var idx = this.idx;
            arrOri[idx].checked = this.checked;
            if(typeof func == 'function') {
                if (arrOri[idx].fireEvent) {
                    arrOri[idx].fireEvent('onclick');
                } else {
                    arrOri[idx].onclick();
                }
            }
        };
    }
};

oFixedTable.prototype.setOnchange = function (obj) {
    if (typeof (obj) == 'undefined' || null == obj) {
        return false;
    }
    try {
        if (obj.fireEvent) {
            obj.fireEvent('onchange');
        } else {
            obj.onchange();
        }
    } catch (e) {
        console.log(e);
    }
};

oFixedTable.prototype.isArray = function (arr) {
    return Object.prototype.toString.call(arr) === '[object Array]';
};

oFixedTable.prototype.setCheckBoxSync = function (argc, name) {
    if (this.isArray(argc)) {
        for (var i = 0, c = argc.length; i < c; i++) {
            this.setOnchange(argc[i]);
        }
    } else if (typeof (argc) == 'object') {
        this.setOnchange(argc);
    } else if (typeof (argc) == 'string' && this.trim(argc) != '') {
        this.setOnchange(document.getElementById(argc));
    } else {
        var arrChb = this.getInput(this.obj, ['checkbox', 'radio'], name);
        for (var i = 0, c = arrChb.length; i < c; i++) {
            this.setOnchange(arrChb[i]);
        }
    }
};

oFixedTable.prototype.setSync = function (argc) {
    this.setCheckBoxSync(argc);
};

oFixedTable.prototype.setChecked = function(oper, name) {
    var _ = this;
    var arrOri = _.getInput(_.obj, ['checkbox', 'radio'], name);
    var c = arrOri.length;
    var isChecked = true;
    switch(oper) {
        case 1:
        case 'All':
            isChecked = true;
            break;
        case 2:
        case 'Cancel':
            isChecked = false;
            break;
        case 3:
        case 'Reverse':
            isChecked = 3;
            break;
    }
    for(var i = 0; i < c; i++) {
        arrOri[i].checked = 3 == isChecked ? !arrOri[i].checked : isChecked;
    }
    this.setCheckBoxSync('', name);
};

oFixedTable.prototype.getTableId = function () {
    return this.tableIdDic;
};

oFixedTable.prototype.getHeadTableId = function () {
    return this.tableIdDic[this.tableIdDicKey.head] || '';
};

oFixedTable.prototype.getLeftTableId = function () {
    return this.tableIdDic[this.tableIdDicKey.left] || '';
};

oFixedTable.prototype.getTopLeftTableId = function () {
    return this.tableIdDic[this.tableIdDicKey.topleft] || '';
};