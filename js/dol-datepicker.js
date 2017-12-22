/*
  dol-datepicker 0.1.0 <>
  shanghang 2017-12-12
*/
"use strict";
var Datepicker = (function(){
	// -- 核心工具方法 -- //
	var Utils = {};
	Utils.on = function(elem, even, target, fn){ //--事件监听器
		if(typeof target === 'string'){
			elem.addEventListener(even, function(e){
				if(e.target.tagName === target.toLocaleUpperCase()){
					fn.call(e.target, e);
					e.stopPropagation()
				}
			}, false);
		}else{
			fn = target;
	    	elem.addEventListener(even, function(e){
	    		fn.call(this, e);
	    		e.stopPropagation()
	    	}, false);
		}
	    return Utils;
	};

	Utils.extend = function(options, newoptions, deep){ // 扩展覆盖属性
		for (var key in newoptions){
			if(deep && (isPlainObject(newoptions[key]) || Array.isArray(newoptions[key]))){
				if(isPlainObject(newoptions[key]) && !isPlainObject(options[key]))
					options[key] = {}
				if(Array.isArray(newoptions[key]) && !Array.isArray(options[key]))
					options[key] = []
				Utils.extend(options[key], source[key], deep)
			} else if (newoptions[key] !== undefined) options[key] = newoptions[key]
		}
		function isPlainObject(obj){
			try{  
		        if(obj.constructor && !hasOwn.call(obj.constructor.prototype,"isPrototypeOf"))return false;
		    }  
		    catch(e){  
		        return false;  
		    }
		    return true;
		}
	}
	
	Utils.isShow = function(dom, bln){ // 显示隐藏
		dom.style.display = bln ? 'block' : 'none';
	}
	
	Utils.format = function(time, format){ // 时间戳转换指定format格式
		var oDate = new Date(time)
		return format.replace(/YYYY|MM|DD|hh|mm|ss/g, function(str, index){
	        var val = 0;
	        if (str === 'YYYY') {
	            val = oDate.getFullYear();
	        } else if (str === 'MM') {
	            val = oDate.getMonth()+1;
	        } else if (str === 'DD') {
	            val = oDate.getDate();
	        } else if (str === 'hh') {
	            val = oDate.getHours();
	        } else if (str === 'mm') {
	            val = oDate.getMinutes();
	        } else if (str === 'ss') {
	            val = oDate.getSeconds();
	        }
	        return Utils.repair(val);
	    });     
	}

	Utils.parse = function(type, ops){
		if (type === 1){ // 字符串转ymd
			var ymd = ops.value.match(/\d+/g);
			var aYmd = [];
			for(var i=0; i<ops.aYmdIndex.length; i++){
				aYmd.push(ymd[ops.aYmdIndex[i]]);
			}
			return aYmd;
		} else if(type === 2){ // 当前时间转ymd
			ops.value = Utils.format(ops.time, ops.format);
			return Utils.parse(1, ops);
		} else if(type === 3){ // ymd转时间
			// var _t = +new Date(ops.aYmd[0]?ops.aYmd[0]:1970, ops.aYmd[1]?ops.aYmd[1]:0, ops.aYmd[2]?ops.aYmd[2]:0, ops.aYmd[3]?ops.aYmd[3]:0, ops.aYmd[4]?ops.aYmd[4]:0, ops.aYmd[5]?ops.aYmd[5]:0);
			// return {'value':Utils.format(_t, ops.format), 'time':_t} 
		}
	};

	Utils.repair = function(num){ // 补0
		return (num < 10 ? '0' : '') + num;
	}

	Utils.each = function(list, fn){
		var i=0,len=list.length;
		for (; i<len; i++) {
			if(fn(i, list[i]) === false)break;
		};
	}

	Utils.check = function(_ymd, _minArr, _maxArr){
		return maketime(_ymd, _minArr) < maketime(_minArr) || maketime(_ymd, _maxArr) > maketime(_maxArr)
		function maketime(arr, _arr){
			if(!_arr) _arr = [1970, 1, 1, 0, 0, 0];
			return +new Date(n(arr[0], _arr[0]), n(arr[1], _arr[1])-1, n(arr[2], _arr[2]), n(arr[3], _arr[3]), n(arr[4], _arr[4]), n(arr[5], _arr[5]));
		}
		function n(a, b){
			return a === undefined ? (b === undefined ? 0 : b) : a;
		}
	}

	Utils.scroll = function(isLeft){
	    var type = isLeft ? 'scrollLeft' : 'scrollTop';
	    return document.body[type] | document.documentElement[type];
	};
	// -- 组件对象 -- //
    var dpdate = function(options){
    	var that = this;
    	this.config = {
		    format: 'YYYY-MM-DD', // 日期格式
		    min: '1970-01-01 00:00:00', // 最小日期
		    max: '2099-12-12 23:59:59', // 最大日期	
		    eventtype : '',
		    elemName: '',
		    hasTime: true, // 显示使用时间组件
		    hasClear: true, // 显示清空按钮
		    hasToday: true, // 显示今天按钮
		    hasConfirm: true, // 显示确认按钮
		    fixed: false, // 是否fixed浮动
		    callBack: null // 选时间回调
		};
    	Utils.extend(this.config, options);
    	this.config.min = this.parse(this.config.min, 'YYYY-MM-DD') + ' 00:00:00'
    	this.config.max = this.parse(this.config.max, 'YYYY-MM-DD') + ' 23:59:59'
    	this.elem = document.getElementById(this.config.elemName)
    	if(!this.elem){
    	  throw new Error('ID选择器找不到元素');
    	}
    	var valueType = /textarea|input/.test(this.elem.tagName.toLocaleLowerCase()) ? 'value' : 'innerHTML';
		this.getExg(); // 获取value合法性正则
		this.check(this.elem[valueType]); // 检查当前输入框的值 重置ymd
        Utils.on(this.elem, this.eventtype || 'click', function(e){
        	that.check(that.elem[valueType]);
        	DateView.redraw(that, valueType);
        })
    };

	dpdate.prototype.setMinScope = function(str, tar){
		this.config.min = str;
		if(tar && typeof str === 'number'){
			this.config.min = Utils.format(str + tar*86400000, this.config.format)
		}
	}

	dpdate.prototype.setMaxScope = function(str, tar){
		this.config.max = str;
		if(tar && typeof str === 'number'){
			this.config.max = Utils.format(str + tar*86400000, this.config.format)
		}
	}

    dpdate.prototype.getExg = function(){ // 制作验证正则 对应年月日位置
    	this.aYmdIndex = new Array(6);
    	var that = this;
    	var i = 0;
    	var reg = this.config.format.replace(/YYYY|MM|DD|hh|mm|ss/g, function(str, index){
	        var exg = '';
	        if (str === 'YYYY') {
	            exg += '((19|20)\\\d{2})';
	            that.aYmdIndex[0] = i;
	        } else if (str === 'MM') {
	            exg += '(0?[1-9]|1[0-2])'
	            that.aYmdIndex[1] = i;
	        } else if (str === 'DD') {
	            exg += '(0?[1-9]|[1-3][0-9])'
	            that.aYmdIndex[2] = i;
	        } else if (str === 'hh') {
	            exg += '\\\d{2}'
	            that.aYmdIndex[3] = i;
	        } else if (str === 'mm') {
	            exg += '\\\d{2}'
	            that.aYmdIndex[4] = i;
	        } else if (str === 'ss') {
	            exg += '\\\d{2}'
	            that.aYmdIndex[5] = i;
	        }
	        i++;
	        return exg;
	    });  
		this.reg = new RegExp('^'+reg+'$')
    }

    dpdate.prototype.check = function(_value){ // 检查value合法性，转化时间ymd
    	this.aYmd = this.reg.test(_value) ? Utils.parse(1, {aYmdIndex: this.aYmdIndex, value: _value}) :
    	Utils.parse(2, {aYmdIndex: this.aYmdIndex, value: _value, format: 'YYYY-MM-DD', time: +new Date})
    }

	dpdate.prototype.parse = function(time, format){
		if(typeof time === 'string') return time;
		return Utils.format(time < 86400000 ? +new Date + time*86400000 : time, format || 'YYYY-MM-DD')
	}

	// -- 日历视图对象 -- //
	var DateView = {
		dom: null,
		firstRedraw: false,
		_init: function(){ // 骨架
			this.dom = document.createElement('div');
			this.dom.className = 'datepicker-sh';
			this.dom.innerHTML = '<div class="dp_top">'+
	        	'<div class="dp_box box1" id="box1">'+
	            	'<a href="javascript:;" class="dp_prevX"></a>'+
	            	'<div class="dp_year">'+
		                '<span class="dp_year_val"><span class="val">2015</span>年</span>'+
		                '<span class="dp_down dp_year_next"></span>'+
		                '<div class="dp_year_listBox">'+
		                    '<a href="javascript:;" class="dp_prevY"></a>'+
		                    '<ul class="dp_year_list"></ul>'+
		                    '<a href="javascript:;" class="dp_nextY"></a>'+
		                '</div>'+
		            '</div>'+
	            	'<a href="javascript:;" class="dp_nextX"></a>'+
	        	'</div>'+
		        '<div class="dp_box box2" id="box2">'+
		            '<a href="javascript:;" class="dp_prevX"></a>'+
		            '<div class="dp_month">'+
		                '<span class="dp_month_val"><span class="val">1</span>月</span>'+
		                '<span class="dp_down dp_month_next"></span>'+
		                '<div class="dp_month_listBox"><ul class="dp_month_list"></ul></div>'+
		            '</div>'+
		            '<a href="javascript:;" class="dp_nextX"></a>'+
		        '</div>'+
	    	'</div>'+
		    '<div class="db_body">'+
		        '<ul class="db_li db_week"><li>日</li><li>一</li><li>二</li><li>三</li><li>四</li><li>五</li><li>六</li></ul>'+
		        '<ul class="db_li db_day"></ul>'+
		    '</div>'+
		    '<div class="dp_bottom">'+
		        '<div class="dp_time">'+
		            '<span class="dp_timefont">时间</span>'+
		            '<ul class="dp_time_box"><li><input type="text" value="00" class="hh">:</li><li><input type="text" value="00" class="mm">:</li><li><input type="text" value="00" class="ss"></li></ul>'+
		        '</div>'+
		        '<div class="dp_btns"><a href="javascript:;" class="dp_btn clear">清空</a><a href="javascript:;" class="dp_btn dp_cl_r today">今天</a><a href="javascript:;" class="dp_btn dp_cl_r ok">确认</a></div>'+
		        '<div class="dp_timebox dp_60"><div class="dp_head"><span class="db_title">秒</span><i class="db_close">×</i></div><ul class="db_time_list"></ul></div>'+
		    '</div>';
			this._findDom(); // 找元素
			this._events(); // 事件委托
		},
		_findDom: function(){
			var dom = this.dom;
			var box1 = getDomByCls(dom, 'box1');
			var box2 = getDomByCls(dom, 'box2');
			this.doms = {
				yearBtn:  getDomByCls(box1, 'dp_year'), //年按钮
				yearLeft: getDomByCls(box1, 'dp_prevX'), //上一年
				yearRight: getDomByCls(box1, 'dp_nextX'), //下一年
				yearInput: getDomByCls(box1, 'val'), //年input
				yearListBox: getDomByCls(box1, 'dp_year_listBox'), //年列表盒子
				yearTop: getDomByCls(box1, 'dp_prevY'), //年上一页列表
				yearBottom: getDomByCls(box1, 'dp_nextY'), //年下一页列表
				yearList: getDomByCls(box1, 'dp_year_list'), //年列表
				monthBtn: getDomByCls(box2, 'dp_month'), //月按钮
				monthLeft: getDomByCls(box2, 'dp_prevX'), //上一月
				monthRight: getDomByCls(box2, 'dp_nextX'), //下一月
				monthInput: getDomByCls(box2, 'val'), //月input
				monthListBox: getDomByCls(box2, 'dp_month_listBox'), //月列表盒子
				monthList: getDomByCls(box2, 'dp_month_list'), //月列表
				dayList: getDomByCls(dom, 'db_day'), //日列表
				timeBox: getDomByCls(dom, 'dp_time'), //时间组件
				inputH: getDomByCls(dom, 'hh'), //时input
				inputM: getDomByCls(dom, 'mm'), //分input
				inputS: getDomByCls(dom, 'ss'), //秒input
				btnBox: getDomByCls(dom, 'dp_btns'), //按钮组件
				clearBtn: getDomByCls(dom, 'clear'), //清空按钮
				todayBtn: getDomByCls(dom, 'today'), //今天按钮
				okBtn: getDomByCls(dom, 'ok'), //确认按钮
				timeListBox: getDomByCls(dom, 'dp_timebox'), //时间列表盒
				timeListTitle: getDomByCls(dom, 'db_title'), //时间列表标题
				timeListClose: getDomByCls(dom, 'db_close'), //时间列表关闭
				timeList: getDomByCls(dom, 'db_time_list') //时间列表
			}
			function getDomByCls(dom, name){
				return  dom.getElementsByClassName(name)[0];
			}
		},
		redraw: function(_obj, _valueType){  // 更新骨架内容
			this.dateObj =  _obj;
			var _aYmd = _obj.aYmd, _config = _obj.config, _elem = _obj.elem;
			if(!this.firstRedraw){
        		this.firstRedraw = true;
        		document.body.appendChild(this.dom)
        	}
        	// 引用更新对象
        	this.aYmd = _aYmd; 
        	this.config = _config;
        	this.elem = _elem;
        	this.valueType = _valueType;
        	this.maxArr = _config.max.match(/\d+/g);
        	this.minArr = _config.min.match(/\d+/g);
        	// 记录当前选择时间
        	this.Y = _aYmd[0] ? parseInt(_aYmd[0]) : 1970;
			this.M = _aYmd[1] ? parseInt(_aYmd[1]) : 1;
			this.D = _aYmd[2] ? parseInt(_aYmd[2]) : 1;
			this.h = _aYmd[3] ? parseInt(_aYmd[3]) : 0;
			this.m = _aYmd[4] ? parseInt(_aYmd[4]) : 0;
			this.s = _aYmd[5] ? parseInt(_aYmd[5]) : 0;
			this.doms.yearInput.innerHTML = _aYmd[0];
			this.doms.monthInput.innerHTML = _aYmd[1];
			this._drawDate(this.Y, this.M, this.D);
			Utils.isShow(this.doms.timeBox, _config.hasTime);
			this.doms.inputH.value = _aYmd[3] ? _aYmd[3] : '00';
			this.doms.inputM.value = _aYmd[4] ? _aYmd[4] : '00';
			this.doms.inputS.value = _aYmd[5] ? _aYmd[5] : '00';
			// 显示组件
			Utils.isShow(this.doms.clearBtn, _config.hasClear);
			Utils.isShow(this.doms.todayBtn, _config.hasToday);
			Utils.isShow(this.doms.okBtn, _config.hasConfirm);
			this._close(true)
			// 定位组件
			this._position(_elem, _config.fixed)
		},
		_checkDate: function(_ymd){
			return Utils.check(_ymd, this.minArr, this.maxArr)
		},
		_checkOk: function(){ // 根据范围控制确认按钮可点
			if(this._checkDate([this.Y, this.M, this.D, this.h, this.m, this.s])){
				this.doms.okBtn.setAttribute('dis', 'yes');
				this.doms.okBtn.className = 'dp_btn dp_cl_r dis'
			}else{
				this.doms.okBtn.setAttribute('dis', '');
				this.doms.okBtn.className = 'dp_btn dp_cl_r ok'
			}
		},
		_events: function(){//绑定事件找元素
			var _this = this,yearPage = 0,hmsType='';
			// vm自动 (NO IE8)
			// var year = this.Y;
			// Object.defineProperty(this, "Y", {
			//     get: function(){return year; },
			//     set: function(val){year = val; _this.doms.yearInput.innerHTML=val }
			// })
			// 绑定选年事件（左右 显示列表及点击 更新日历）
			Utils.on(this.doms.yearLeft, 'click', function(e){
				if(_this._checkDate([_this.Y - 1])) return false
				_this.doms.yearInput.innerHTML = --_this.Y;
				_this._closelayer()._drawDate()._checkOk();
			});
			Utils.on(this.doms.yearRight, 'click', function(e){
				if(_this._checkDate([_this.Y + 1])) return false
				_this.doms.yearInput.innerHTML = ++_this.Y;
				_this._closelayer()._drawDate()._checkOk();
			});
			Utils.on(this.doms.yearBtn, 'click', function(e){
				yearPage = 0;
				_this._closelayer()._drawYearList(yearPage);
				Utils.isShow(_this.doms.yearListBox, true);
			});
			Utils.on(this.doms.yearTop, 'click', function(e){
				_this._drawYearList(--yearPage);
			});
			Utils.on(this.doms.yearBottom, 'click', function(e){
				_this._drawYearList(++yearPage);
			});
			Utils.on(this.doms.yearList, 'click', 'li', function(e){
				if(this.getAttribute('dis')){
					e.stopPropagation()
					return false
				}
				_this.doms.yearInput.innerHTML = _this.Y = parseInt(this.innerHTML);
				_this._closelayer()._drawDate()._checkOk();
			});
			// 绑定选月事件（左右 显示列表及点击 更新日历）
			Utils.on(this.doms.monthLeft, 'click', function(e){
				if(_this._checkDate([_this.Y, _this.M - 1])) return false
				if(--_this.M < 1) {
					_this.M = 12;
					_this.doms.yearInput.innerHTML = --_this.Y;
				}
				_this.doms.monthInput.innerHTML = _this.M;
				_this._closelayer()._drawDate()._checkOk();
			});
			Utils.on(this.doms.monthRight, 'click', function(e){
				if(_this._checkDate([_this.Y, _this.M + 1])) return false
				if(++_this.M > 12) {
					_this.M = 1;
					_this.doms.yearInput.innerHTML = ++_this.Y;
				}
				_this.doms.monthInput.innerHTML = _this.M;
				_this._closelayer()._drawDate()._checkOk();
			});
			Utils.on(this.doms.monthBtn, 'click', function(e){
				_this._closelayer()._drawMonthList();
				Utils.isShow(_this.doms.monthListBox, true);
			});
			Utils.on(this.doms.monthList, 'click', 'li', function(e){
				if(this.getAttribute('dis')){
					e.stopPropagation()
					return false
				}
				_this.doms.monthInput.innerHTML = _this.M = parseInt(this.innerHTML);
				_this._closelayer()._drawDate()._checkOk();
			});
			// 选天
			Utils.on(this.doms.dayList, 'click', 'li', function(e){
				if(this.getAttribute('dis')){
					e.stopPropagation()
					return false
				}
				_this.M = this.getAttribute('m');
				_this.D = parseInt(this.innerHTML);
				_this.selectDate()._checkOk();
				DateView._close();
			});
			// 绑定时分秒（显示列表及点击）
			Utils.on(this.doms.timeListBox, 'click', function(e){});
			Utils.on(this.doms.inputH, 'click', function(e){
				hmsType = 'H';
				_this._drawTimeList(hmsType)
			});
			Utils.on(this.doms.inputM, 'click', function(e){
				hmsType = 'M';
				_this._drawTimeList(hmsType)
			});
			Utils.on(this.doms.inputS, 'click', function(e){
				hmsType = 'S';
				_this._drawTimeList(hmsType)
			});
			Utils.on(this.doms.timeListClose, 'click', function(e){
				_this._closelayer()
			});
			Utils.on(this.doms.timeList, 'click', 'li', function(e){
				if(this.getAttribute('dis')){
					e.stopPropagation()
					return false
				}
				var it = parseInt(this.innerHTML);
				_this[hmsType.toLocaleLowerCase()] = it;
				_this.doms['input'+hmsType].value = Utils.repair(it);
				_this._closelayer()._drawDate()._checkOk()
			});
			// 绑定tools按钮
			Utils.on(this.doms.clearBtn, 'click', function(e){
				_this._close().elem[_this.valueType] = '';
			});
			Utils.on(this.doms.todayBtn, 'click', function(e){
				var _de = new Date();
				_this.Y = _de.getFullYear();
				_this.M = _de.getMonth()+1;
				_this.D = _de.getDate();
				_this.selectDate()
			});
			Utils.on(this.doms.okBtn, 'click', function(e){
				if(this.getAttribute('dis')){
					e.stopPropagation()
					return false
				}
				_this.selectDate()
			});
			//点击body关闭组件
			Utils.on(document, 'click', function(e){
				_this._closelayer()
				DateView._close();
			});
			Utils.on(this.dom, 'click', function(e){
				_this._closelayer()
			});
		},
		_drawYearList: function(p){
			var _html='',yearRow = 12,that=this;
			var _start = yearRow/2-1;
			Utils.each(new Array(yearRow), function(i){
				var y = that.Y-_start+i+p*yearRow;
				_html += that._checkDate([y]) ? '<li dis="yes">'+y+'</li>' : '<li class="normal">'+y+'</li>';
			})
			this.doms.yearList.innerHTML = _html;
			return this;
		},
		_drawMonthList: function(){
			var _html='',that=this;
			Utils.each(new Array(12), function(i){
				_html += that._checkDate([that.Y, i+1]) ? '<li dis="yes">'+Utils.repair(i+1)+'</li>' :'<li class="normal">'+Utils.repair(i+1)+'</li>'
			})
			this.doms.monthList.innerHTML = _html;
			return this;
		},
		_drawDate: function(){
			var date1,date2,date3,date,dateP,dateT,dayP,_date,_html='',j=0,_time=0,_timeMin,_timeMax;
			date = new Date();
			date1 = new Date(this.Y, this.M-1, 0);
			date2 = new Date(this.Y, this.M, 0);
			date3 = new Date(this.Y, this.M-1, 1);
			dateP = date1.getDate(); // 上个月多少天
			dateT = date2.getDate(); // 这个月多少天
			dayP = date3.getDay(); // 1号星期几
			_date = Math.min(dateT, this.D)
			for (var i = 1; i <= 42; i++) {
				if(i <= dayP){
					_html += this._checkDate([this.Y, this.M-1, dateP-dayP+i, this.h, this.m, this.s]) ? '<li dis="yes" m="'+(this.M-1)+'">'+(dateP-dayP+i)+'</li>' : '<li class="other" m="'+(this.M-1)+'">'+(dateP-dayP+i)+'</li>';
				}else if(i <= dayP + dateT){
					var _de = i-dayP;
					var _cls = _de === _date ? 'on' : 'normal';
					_html += this._checkDate([this.Y, this.M, _de, this.h, this.m, this.s]) ? '<li dis="yes" m="'+this.M+'">'+(_de)+'</li>' : '<li class="'+_cls+'" m="'+this.M+'">'+(_de)+'</li>';
				}else{
					_html += this._checkDate([this.Y, this.M+1, j+1, this.h, this.m, this.s]) ? '<li dis="yes" m="'+(this.M+1)+'">'+(++j)+'</li>' : '<li class="other" m="'+(this.M+1)+'">'+(++j)+'</li>';
				}
			};
			this.doms.dayList.innerHTML = _html;
			return this;
		},
		_drawTimeList: function(type){
			var kv = {'H': {n:'时', c: 24, e:'h', i: 3}, 'M': {n:'分', c: 60, e:'m', i: 4}, 'S': {n:'秒', c: 60, e:'s', i: 5}},_html='',that=this;
			var arr = [that.Y, that.M, that.D, that.h, that.m, that.s];
			Utils.each(new Array(kv[type].c), function(i){
				var _cls = that[kv[type].e.toLocaleLowerCase()] === i ? 'on' : 'normal';
				arr[kv[type].i] = i;
				_html += that._checkDate(arr) ? '<li dis="yes">'+i+'</li>' : '<li class="'+_cls+'">'+i+'</li>';
			});
			this.doms.timeListBox.className = 'dp_timebox dp_'+kv[type].c;
			this.doms.timeListTitle.innerHTML = kv[type].n;
			this.doms.timeList.innerHTML = _html;
			Utils.isShow(this.doms.timeListBox, true);
		},
		_closelayer: function(){
			Utils.isShow(this.doms.yearListBox, false);
			Utils.isShow(this.doms.monthListBox, false);
			Utils.isShow(this.doms.timeListBox, false);
			return this;
		},
		_position: function(elem, isFixed){
			this.dom.style.position = isFixed ? 'fixed' : 'absolute'
			var rect = elem.getBoundingClientRect();
			this.dom.style.left = rect.left + (isFixed ? Utils.scroll(true) : 0) + 'px'
			if(rect.bottom + this.dom.offsetHeight < document.documentElement.clientHeight){
				this.dom.style.top = rect.bottom + (isFixed ? Utils.scroll() : 0) + 'px'
			}else{
				this.dom.style.top = Math.max(rect.top - document.documentElement.clientHeight + (isFixed ? Utils.scroll() : 0), 0) + 'px';
			}
		},
		selectDate: function(){
			this.aYmd[0] = Utils.repair(this.Y);
			this.aYmd[1] = Utils.repair(this.M);
			this.aYmd[2] = Utils.repair(this.D);
			this.aYmd[3] = Utils.repair(this.h);
			this.aYmd[4] = Utils.repair(this.m);
			this.aYmd[5] = Utils.repair(this.s);
			var time = +new Date(this.Y, this.M-1, this.D, this.h, this.m, this.s);
			this.elem[this.valueType] = Utils.format(time, this.config.format)
			this.config.callBack(this.elem[this.valueType], time);
			this.dateObj.time = time;
			this.dateObj.value = this.elem[this.valueType];
			this._close();
			return this;
		},
		_close: function(noclose){
			this.dom.style.display = noclose ? 'block' : 'none';
			return this;
		}
	}
	DateView._init();
	return dpdate
})();