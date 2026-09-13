/* chartbeat_mab_config for news v.20230322r1 */
var _sf_async_config={};

function _delete_cb_cookies(){
	var _cb_cookie_list = ['_cb',
						   '_chartbeat2',
						   '_v__chartbeat3',
						   '_cb_svref',
						   '_chartbeat4',
						   '_chartbeat5',
						   '_t_tests',
						   '_cb_ls',
						   ' _v__cb_cp',
						   '_superfly_lockout',
						   '_v__superfly_lockout'];
	for(var ii = 0; ii < _cb_cookie_list.length; ii++){
		if(0 <= document.cookie.indexOf(_cb_cookie_list[ii])){
			var del_cookie_cd = _cb_cookie_list[ii] + '=; ' + 'max-age=0; domain=.nhk.or.jp; path=/news;';
			document.cookie = del_cookie_cd;
		}
	}
}

function _chartbeat_check () {
var _cb_sections = '';
try {
	if (JSON.parse(this.responseText)['is_gdpr_state']) {
		//optout and delete cookie
		_delete_cb_cookies();
		return;
	}
} catch (e) {}
try {
	if (typeof(_cb_sections_preset) == 'undefined') {
		var _cb_pathinfo = location.pathname.split('/');
		switch (_cb_pathinfo[2]) {
			case 'tokushu': _cb_sections = 'WEB特集,ビジネス特集'; break;
			case 'web_tokushu': _cb_sections = 'WEB特集'; break;
			case 'business_tokushu': _cb_sections = 'ビジネス特集'; break;
			case 'special': _cb_sections = 'スペシャルコンテンツ'; break;
			case 'word': _cb_sections = '注目ワード'; break;
			case 'tokusetsu': _cb_sections = '特設'; break;
			default: _cb_sections = 'その他'; break;
		}
	} else {
		_cb_sections = _cb_sections_preset;
	}
} catch (e) {
	_cb_sections = '例外';
}
try {
	var _cb_sections_allname = '全記事';
	var _cb_sections_covidname = 'コロナ';
	var _cb_sections_nocovidname = 'コロナ外';
	var _cb_sections_chkcovidname = '新型コロナ';
	if (typeof(_cb_sections_preset) != 'undefined' &&
	    typeof(_cb_sections_preset_tags) != 'undefined') {
	    var _cb_sections_covidheader = _cb_sections_nocovidname;
	    for( var ii = 0; ii < _cb_sections_preset_tags.length; ii++ ) {
		    if (_cb_sections_preset_tags[ii].includes(_cb_sections_chkcovidname)) {
		    	_cb_sections_covidheader = _cb_sections_covidname;
		    	break;
		    }
		}
		_cb_sections += ',' + _cb_sections_covidheader + ' ' + _cb_sections_allname;
		var _cb_sections_preset_arr = _cb_sections_preset.split(',');
		if ( 0 < _cb_sections_preset_arr.length ) {
			_cb_sections += ',' + _cb_sections_covidheader + ' ' + _cb_sections_preset_arr[0];
			switch (_cb_sections_preset_arr[0]) {
				case '一般記事': break;
				case 'News Up': _cb_sections += ',' + _cb_sections_covidheader + ' ' + '特集記事'; break;
				case 'WEB特集': _cb_sections += ',' + _cb_sections_covidheader + ' ' + '特集記事'; break;
				case 'ビジネス特集': _cb_sections += ',' + _cb_sections_covidheader + ' ' + '特集記事'; break;
				default: break;
			}
		}
	}
} catch (e) {}
try {
	var _cb_sections_arr = _cb_sections.split(',');
	var _cb_sections_tmp = '';
	for( var ii = 0 ; ii < _cb_sections_arr.length ; ii++ ) {
		_cb_sections_tmp += 'NEWS WEB ' + _cb_sections_arr[ii];
		if (ii < (_cb_sections_arr.length - 1)) {
			_cb_sections_tmp += ',';
		}
	}
	_cb_sections = _cb_sections_tmp;
} catch (e) {}

/** CONFIGURATION START **/
_sf_async_config.uid = 64957;
_sf_async_config.domain = 'www3.nhk.or.jp';
_sf_async_config.useCanonical = true;
_sf_async_config.sections = _cb_sections;  //CHANGE THIS
_sf_async_config.authors = 'NEWS WEB';    //CHANGE THIS
_sf_async_config.playerdomain = 'www3.nhk.or.jp';
_sf_async_config.cookiePath = '/news';
/** CONFIGURATION END **/
(function(){
function loadChartbeat() {
window._sf_endpt=(new Date()).getTime();
var e = document.createElement('script');
e.setAttribute('language', 'javascript');
e.setAttribute('type', 'text/javascript');
e.setAttribute('src', '//static.chartbeat.com/js/chartbeat.js');
document.body.appendChild(e);
}
var oldonload = window.onload;
window.onload = (typeof window.onload != 'function') ?
loadChartbeat : function() { oldonload(); loadChartbeat(); };
})();
}

function _get_area_json(url, timeout, callback, ...args) {
	const xhr = new XMLHttpRequest();
	xhr.ontimeout = () => {};
	xhr.onload = () => {
		if (xhr.readyState === 4) {
			if (xhr.status === 200) {
				callback.apply(xhr, args);
			} else {
				console.error(xhr.statusText);
			}
		}
	};
	xhr.open("GET", url, true);
	xhr.timeout = timeout;
	xhr.send(null);
}

// check cookie
if (document.cookie.split(';').some(function(item) {
    return item.indexOf('CBoptout=true') >= 0
})) {
	//optout and delete cookie
	_delete_cb_cookies();
} else {
	var _cb_time = new Date();
	_get_area_json("https://location.nhk.or.jp/geoip/area.json" + '?' + _cb_time.getTime().toString(), 1000, _chartbeat_check, "");
}
