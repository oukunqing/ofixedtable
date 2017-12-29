/*
	oFixedTable 1.2
	Author: 青梅煮酒 85079542 oukunqing@126.com
	Update: 2015-03-04
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
		fixHead: _cfg.fixHead || true,
		rows: _cfg.rows == undefined ? 1 : _cfg.rows,
		cols: _cfg.cols || 0,
		background: _cfg.background || '#f1f1f1',
		zindex: _cfg.zindex || 9999
	};

	_.ieLowVersion = navigator.userAgent.indexOf('MSIE 6.0') >= 0 || navigator.userAgent.indexOf('MSIE 7.0') >= 0;
	
	window.setTimeout(_._fixTable, 100, _);
}

oFixedTable.prototype._fixTable = function(_){
	if(_.obj.rows.length <= 0){
		return false;
	}
	
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
	div.innerHTML = '<table id="' + strTbId + '" cellpadding="0" cellspacing="0"></table>';

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
		if(!_.ieLowVersion){
			for(var i=0; i<_.config.rows; i++){
				var row = _.obj.rows[i];
				if(row != null){
					var rowClone = row.cloneNode(true);
					rowClone.style.cssText = (rowClone.className == '' ? 'background:' + _.config.background + ';' : '') + rowClone.style.cssText;
					rowClone.style.height = row.offsetHeight + 'px';
					_.tbHead.appendChild(rowClone);
					hasHead = true;
				}
			}
		} else {
			for(var i=0; i<_.config.rows; i++){
				var row = _.tbHead.insertRow(_.tbHead.rows.length);
				row.className = _.obj.rows[i].className;
				row.style.cssText = (row.className == '' ? 'background:' + _.config.background + ';' : '') + _.obj.rows[i].style.cssText;
				row.style.height = _.obj.rows[i].offsetHeight + 'px';

				for(j=0,c=_.obj.rows[i].cells.length; j<c; j++){
					var cell = _.obj.rows[i].cells[j];
					if(cell != null){
						row.appendChild(cell.cloneNode(true));
						cell.style.cssText = _.obj.rows[i].cells[j].style.cssText;
						cell.className = _.obj.rows[i].cells[j].className;
						hasHead = true;
					}
				}
			}
		}
	}
	return hasHead;
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
	div.style.cssText = 'position:absolute;overflow:hidden;z-index:' + _.config.zindex + ';';
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
		row.className = _.obj.rows[i].className;
		//row.style.cssText = (row.className == '' ? 'background:' + _.config.background + ';' : '') + _.obj.rows[i].style.cssText;
		row.style.cssText = (row.className == '' ? 'background:#fff;' : '') + _.obj.rows[i].style.cssText;
		row.style.height = _.obj.rows[i].offsetHeight + 'px';

		for(j=0; j<_.config.cols; j++){
			var cell = _.obj.rows[i].cells[j];
			if(cell != null){
				row.appendChild(cell.cloneNode(true));
				cell.style.cssText = _.obj.rows[i].cells[j].style.cssText;
				cell.className = _.obj.rows[i].cells[j].className;

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
	div.style.cssText = 'position:absolute;overflow:hidden;z-index:' + (_.config.zindex + 2) + ';';
	div.innerHTML = '<table id="' + strTbId + '" cellpadding="0" cellspacing="0"></table>';

	_.box.insertBefore(div, _.obj);

	var tbTopLeft = document.getElementById(strTbId);
	tbTopLeft.className = _.obj.className;
	tbTopLeft.style.textAlign = _.obj.style.textAlign;
	tbTopLeft.style.width = 'auto';

	for(var i=0; i<_.config.rows; i++){
		var row = tbTopLeft.insertRow(tbTopLeft.rows.length);
		row.className = _.obj.rows[i].className;
		row.style.cssText = (row.className == '' ? 'background:' + _.config.background + ';' : '') + _.obj.rows[i].style.cssText;
		row.style.height = _.obj.rows[i].offsetHeight + 'px';
		
		for(j=0; j<_.config.cols; j++){
			var cell = _.obj.rows[i].cells[j];
			if(cell != null){
				row.appendChild(cell.cloneNode(true));
				cell.style.cssText = _.obj.rows[i].cells[j].style.cssText;
				cell.className = _.obj.rows[i].cells[j].className;
			}
		}
	}
};

oFixedTable.prototype.setBoxSize = function(){
	var _ = this;
	if(_.divHead != null){
		//判断是否出现纵向滚动条，若出现，宽度减去滚动条宽度 16px
		var sw = _.obj.offsetHeight >= _.box.offsetHeight ? 16 : 0;
		_.divHead.style.width = (_.box.offsetWidth - sw	) + 'px';
	}
	if(_.divLeft != null){
		//判断是否出现横向滚动条，若出现，高度减去滚动条高度 16px
		var sh = _.obj.offsetWidth >= _.box.offsetWidth ? 16 : 0;
		_.divLeft.style.height = (_.box.offsetHeight - sh) + 'px';
	}
};