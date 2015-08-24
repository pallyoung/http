/*Http.js*/
"use strict"
/**
*@description
*1、修改数据提交格式
**/
function factory() {
	var accepts= {
		"*": "",
		text: "text/plain",
		html: "text/html",
		xml: "application/xml, text/xml",
		json: "application/json, text/javascript"
	}
	function _FormData(data){
		this.data = [];
	}
	_FormData.prototype = {
		append:function(key, value) {
				this.data.push(encodeURI(key) + "=" + encodeURI(value));
			},
		stringify:function() {
				return this.data.join("&");
			}
	}

	function serializeData(data){
		if(!data){
			return null;
		}
		if(typeof data==='string'||data===null||data.constructor == FormData){
			return data;
		}else{
			var form=new _FormData();
			for (var o in data){
				if(data.hasOwnProperty(o)){
					form.append(o,data[o]);
				}
			}
			return form.stringify();
		}
	}
	function ajax(source) {
		source = source || {
			url: "",
			type: "GET",
			async: true,
			contentType: "application/x-www-form-urlencoded; charset=UTF-8",
			data:null,
			dataType:"*",
			timeout:6000,
			success: function() {},
			error: function() {}
		}
		source.type=source.type||"GET";
		source.async=source.async||"true";
		source.data=source.data||null;
		source.timeout=source.timeout||6000;
		source.contentType=source.contentType||"application/x-www-form-urlencoded; charset=UTF-8";
   		source.responseType="blob";
		source.success=source.success||function() {};
		source.error=source.error||function() {};
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {			
			if (xhr.readyState == 4) {
				clearTimeout(source.ontimeout);
				xhr.onreadystatechange=null;
				if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
					source.success(xhr.responseText);
				} else {
					source.error(xhr.status);
				}
			}
		};
		if(source.type.toUpperCase()==="GET"){
			source.url+="?"+serializeData(source.data);
			source.data=null;
		}
		xhr.open(source.type, source.url, source.async);
		xhr.setRequestHeader("Content-Type", source.contentType);
		source.dataType&&xhr.overrideMimeType(source.dataType);
		xhr.send(serializeData(source.data));
		source.ontimeout=setTimeout(function(){
			source.error("timeout")
		},source.timeout);
	}
		var	_export = {
		ajax: ajax,
		timeout: 6000
	};
	return _export;
}

module.exports = factory();
