/*
	oFixedTable 1.4
	Author: 青梅煮酒 85079542 oukunqing@126.com
	Update: 2015-09-20
*/
var ofixed_table_st = window.setTimeout;
window.setTimeout = function(fRef, mDelay) {
    if (typeof fRef == 'function') {
        var argu = Array.prototype.slice.call(arguments, 2);
        var f = (function() {
            fRef.apply(null, argu);
        });
        return ofixed_table_st(f, mDelay);
    }
    return ofixed_table_st(fRef, mDelay);
};

function oFixedTable(id, obj, _cfg){
	var _ = this;
	if(id == undefined || obj == undefined || obj == null || typeof obj != 'object'){
		return null;
	}
	_.id = id;
	_.obj = obj;
	_.box = _.obj.parentNode;

	_.config = {
		fixHead: typeof _cfg.fixHead != 'undefined' ? _cfg.fixHead : true,
		rows: _cfg.rows == undefined ? 1 : _cfg.rows,
		cols: _cfg.cols || 0,
		background: _cfg.background || '#fff',
		zindex: _cfg.zindex || 9999,
		showSplitLine: typeof _cfg.showSplitLine != 'undefined' ? _cfg.showSplitLine : true,
		splitLineColor: _cfg.splitLineColor || _cfg.lineColor || '#000',
		//IE6/7/8是否启用锁定表头功能，默认不启用
		ieLowVersionEnabled: _cfg.ieLowVersionEnabled || false
	};
	//需要复制的元素或事件
	_.arrKey = ['className', 'lang', 'ondblclick', 'onclick', 'onmouseover', 'onmouseout'];
	_.arrKeyHead = ['className', 'lang', 'ondblclick', 'onclick'];

	var userAgent = navigator.userAgent;
	_.ieLowVersion = userAgent.indexOf('MSIE 6.0') >= 0 || userAgent.indexOf('MSIE 7.0') >= 0 || userAgent.indexOf('MSIE 8.0') >= 0;
	//火狐浏览器在这里有BUG，需要特殊处理
	_.isFirefox = userAgent.indexOf('Firefox') >= 0;

	//IE6/IE7/IE8 不启用该功能
	if(!_.ieLowVersion || _.config.ieLowVersionEnabled){
		if(_.box != null){
			//防止错位
			_.box.scrollLeft = 0;
			_.box.scrollTop = 0;
		}
		window.setTimeout(_._fixTable, 10, _);
	}
}

oFixedTable.prototype._fixTable = function(_){
	if(_.obj.rows.length <= 0){
		return false;
	}
	//先清除已生成的表头，防止重复生成
	_.clear();
	
	var hasHead = _.buildHead();
	var hasLeft = _.buildLeft();
	
	_.box.onscroll = function(){
		if(_.divHead != null){
			_.divHead.scrollLeft = this.scrollLeft;
		}
		if(_.divLeft != null){
			_.divLeft.scrollTop = this.scrollTop;
		}
	};
	if(hasHead && hasLeft){
		_.buildTopLeft();
	}
};

oFixedTable.prototype.clear = function(){
	var _ = this;
	var arr = [
		document.getElementById(_.id + '_div_head'),
		document.getElementById(_.id + '_div_left'),
		document.getElementById(_.id + '_div_top_left')
	];
	for(var i in arr){
		if(arr[i] != null){
			_.box.removeChild(arr[i]);
		}
	}
};

oFixedTable.prototype.buildHead = function(){
	var _ = this;
	if(_.config.rows <= 0){
		return false;
	}
	var strDivId = _.id + '_div_head';
	var strTbId = _.id + '_tb_header';
	var div = document.createElement('div');
	div.id = strDivId;
	div.style.cssText = 'position:absolute;overflow:hidden;z-index:' + (_.config.zindex + 1) + ';';
	div.innerHTML +='<table id="' + strTbId + '" cellpadding="0" cellspacing="0"></table>';
	_.box.insertBefore(div, _.obj);

	_.divHead = div;
	_.setBoxSize();

	_.tbHead = document.getElementById(strTbId);
	_.tbHead.className = _.obj.className;
	_.tbHead.style.textAlign = _.obj.style.textAlign;
	_.tbHead.style.width = _.obj.offsetWidth + 'px';

	var hasHead = false;
	if(_.config.fixHead && _.obj.tHead != null){
		var tHead = _.obj.tHead;
		_.tbHead.appendChild(tHead.cloneNode(true));
		hasHead = true;
	} else {
		if(!_.ieLowVersion && !_.config.showSplitLine){
			for(var i=0; i<_.config.rows; i++){
				var rowOld = _.obj.rows[i];
				if(rowOld != null){
					var row = rowOld.cloneNode(true);		
					_.copyElement(row, rowOld);

					row.style.cssText = (row.className == '' ? 'background:' + _.config.background + ';' : '') + row.style.cssText;
					row.style.height = rowOld.offsetHeight + 'px';
					row.style.width = rowOld.offsetWidth + 'px';

					_.tbHead.appendChild(row);
					hasHead = true;
				}
			}
		} else {
			for(var i=0; i<_.config.rows; i++){
				var row = _.tbHead.insertRow(_.tbHead.rows.length);
				var rowOld = _.obj.rows[i];
				var isSplitRow = _.config.showSplitLine && (i == _.config.rows - 1);

				_.copyElement(row, rowOld);

				row.style.cssText = (row.className == '' ? 'background:' + _.config.background + ';' : '') + rowOld.style.cssText;
				row.style.height = rowOld.offsetHeight + 'px';
				row.style.width = rowOld.offsetWidth + 'px';

				for(var j=0,c=rowOld.cells.length; j<c; j++){
					var cell = rowOld.cells[j];
					if(cell != null){
						cell = rowOld.cells[j].cloneNode(true);
						cell.style.cssText = rowOld.cells[j].style.cssText;
						cell.className = rowOld.cells[j].className;
						
						if(isSplitRow){
							cell.style.borderBottom = 'solid 1px ' + _.config.splitLineColor;
						}
						row.appendChild(cell);

						hasHead = true;
					}
				}
			}
		}
	}

	return hasHead;
};

oFixedTable.prototype.copyElement = function(row, rowOld, arrKey){
	if(typeof arrKey == 'undefined'){
		arrKey = this.arrKey;
	}
	for(var k in arrKey){
		var key = arrKey[k];
		if(rowOld[key] != null){
			row[key] = rowOld[key];
		}
	}
};

oFixedTable.prototype.buildLeft = function(){
	var _ = this;
	if(_.config.cols <= 0){
		return false;
	}
	var strDivId = _.id + '_div_left';
	var strTbId = _.id + '_tb_left';
	var div = document.createElement('div');
	div.id = strDivId;
	div.style.cssText = 'position:absolute;overflow:hidden;z-index:' + _.config.zindex + ';'
		+ (_.config.showSplitLine && _.isFirefox ? 'border-right:solid 1px ' + _.config.splitLineColor : '');
	div.innerHTML = '<table id="' + strTbId + '" cellpadding="0" cellspacing="0"></table>';

	_.box.insertBefore(div, _.obj);

	_.divLeft = div;
	_.setBoxSize();

	_.tbLeft = document.getElementById(strTbId);
	_.tbLeft.className = _.obj.className;
	_.tbLeft.style.textAlign = _.obj.style.textAlign;
	_.tbLeft.style.width = 'auto';

	var hasLeft = false;
	for(var i=0,rows=_.obj.rows.length; i<rows; i++){
		var row = _.tbLeft.insertRow(_.tbLeft.rows.length);
		var rowOld = _.obj.rows[i];
		_.copyElement(row, rowOld);

		row.style.cssText = (row.className == '' ? 'background:' + _.config.background + ';' : '') + rowOld.style.cssText;
		row.style.height = rowOld.offsetHeight + 'px';

		for(var j=0; j<_.config.cols; j++){
			var cell = rowOld.cells[j];
			if(cell != null){
				cell = rowOld.cells[j].cloneNode(true);
				cell.style.cssText = rowOld.cells[j].style.cssText;
				cell.className = rowOld.cells[j].className;

				if(_.config.showSplitLine && (j == _.config.cols - 1)){
					cell.style.borderRight = 'solid 1px ' + _.config.splitLineColor;
				}
				row.appendChild(cell);

				hasLeft = true;
			}
		}
	}
	return hasLeft;
};

oFixedTable.prototype.buildTopLeft = function(){
	var _ = this;
	var strDivId = _.id + '_div_top_left';
	var strTbId = _.id + '_tb_top_left';
	var div = document.createElement('div');
	div.id = strDivId;
	div.style.cssText = 'position:absolute;overflow:hidden;z-index:' + (_.config.zindex + 2) + ';'
		+ (_.config.showSplitLine && _.isFirefox ? 'border-right:solid 1px ' + _.config.splitLineColor : '');
	div.innerHTML = '<table id="' + strTbId + '" cellpadding="0" cellspacing="0"></table>';
	_.box.insertBefore(div, _.obj);

	var tbTopLeft = document.getElementById(strTbId);
	tbTopLeft.className = _.obj.className;
	tbTopLeft.style.textAlign = _.obj.style.textAlign;
	tbTopLeft.style.width = 'auto';

	for(var i=0; i<_.config.rows; i++){
		var row = tbTopLeft.insertRow(tbTopLeft.rows.length);
		var rowOld = _.obj.rows[i];
		var isSplitRow = _.config.showSplitLine && (i == _.config.rows - 1);

		_.copyElement(row, rowOld);

		row.style.cssText = (row.className == '' ? 'background:' + _.config.background + ';' : '') + rowOld.style.cssText;
		row.style.height = rowOld.offsetHeight + 'px';

		for(var j=0; j<_.config.cols; j++){
			var cell = rowOld.cells[j];
			if(cell != null){
				cell = rowOld.cells[j].cloneNode(true);
				cell.style.cssText = rowOld.cells[j].style.cssText;
				cell.className = rowOld.cells[j].className;

				if(_.config.showSplitLine && !_.isFirefox && (j == _.config.cols - 1)){
					cell.style.borderRight = 'solid 1px ' + _.config.splitLineColor;
				}
				if(isSplitRow){
					cell.style.borderBottom = 'solid 1px ' + _.config.splitLineColor;
				}
				row.appendChild(cell);
			}
		}
	}
	if(_.isFirefox){
		div.style.width = (div.offsetWidth - 1) + 'px';
	}
};

oFixedTable.prototype.setBoxSize = function(){
	try{
		var _ = this;
		if(_.divHead != null){
			//判断是否出现纵向滚动条，若出现，宽度减去滚动条宽度 17px
			var sw = _.obj.offsetHeight >= _.box.offsetHeight ? 17 : 0;
			_.divHead.style.width = (_.box.offsetWidth - sw) + 'px';
		}
		if(_.divLeft != null){
			//判断是否出现横向滚动条，若出现，高度减去滚动条高度 17px
			var sh = _.obj.offsetWidth >= _.box.offsetWidth ? 17 : 0;
			_.divLeft.style.height = (_.box.offsetHeight - sh) + 'px';
		}
	}catch(e){}
};