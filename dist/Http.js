/*Http.js*/
/**
*@description
*1、修改数据提交格式
**/
(function (window, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : window.http = factory();
})(this, function factory() {
	"use strict"
	var accepts = {
		"*": "",
		text: "text/plain",
		html: "text/html",
		xml: "application/xml, text/xml",
		json: "application/json, text/javascript"
	}
	var TIME_OUT = 60000;


	function noop() {

	}
	function errorHandler(request, xhr) {
		if (request.isCompleted) {
			return;
		}
		request.isCompleted = true;
		request.onerror({});
	}
	function successHandler(request, xhr) {
		if (request.isCompleted) {
			return;
		}
		request.isCompleted = true;
		var responseData = null;
		try {
			responseData = JSON.parse(xhr.responseText);
		} catch (e) {
			responseData = xhr.responseText;
		}
		request.onsuccess(responseData);
	}
	function timeoutHandler(request, xhr) {
		if (request.isCompleted) {
			return;
		}
		request.isCompleted = true;
		request.onerror({});
	}
	function isNull(value) {
		return value === null;
	}
	function isUndefined(value) {
		return value === void 0;
	}

	var rEmpty = /^[\s]*$/;
	function isString(value) {
		return typeof value === 'string';
	}
	function isEmptyString(value) {
		return rEmpty.test(value);
	}
	function isEmptyArray(value) {
		return isArray(value) && value.length <= 0;
	}
	function isEmptyJSON(value) {
		try {
			return JSON.stringify(value) === '{}'
		} catch (e) {
			return false;
		}
	}

	function isEmpty(value) {
		return isEmptyString(value) || isNull(value) || isUndefined(value) || isEmptyArray(value) || isEmptyJSON(value);
	}
	var isFormDataSupport = !!window.FormData;
	function isFormData(value) {
		try {
			return isFormDataSupport && value.constructor === FormData;
		} catch (e) {
			return false;
		}

	}
	var isArray = Array.isArray || function (value) {
		Object.proptotype.toString.call(value) === '[object Array]';
	}
	function isFunction(value) {
		return Object.prototype.toString.call(value) === '[object Function]';
	}
	function FakeFormData(data) {
		this.data = [];
	}
	FakeFormData.prototype = {
		constructor: FakeFormData,
		append: function (key, value) {
			this.data.push(encodeURI(key) + "=" + encodeURI(value));
		},
		stringify: function () {
			return this.data.join("&");
		}
	}
	function HTTPRequest(url, init) {
		init = init || {};
		this.url = url;
		this.method = init.method ? init.method.toLowerCase() : 'get';
		this.headers = init.headers || {};//请求头
		this.referrer = init.referrer || '';
		this.body = init.body;//请求体

		this.isCompleted = false;//是否完成 超时 成功 或者失败都算完成
		this.onsuccess = init.onsuccess || noop;
		this.onerror = init.onerror || noop;
		this.async = init.async || true;
		this.timeout = init.timeout || TIME_OUT;//超时时间
		this.timeoutHandler = null;

		//如果formdata类型 强制post请求
		if (isFormData(this.body)) {
			this.method = 'post';
		} else {
			this.body = serializeData(this.body);
		}
		if (this.method === 'get' && !isEmpty(this.body)) {
			this.url += '?' + this.body;
		}
		if (!isFormData(this.body)) {
			this.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
		}
		this.dataType = init.dataType || '*';

		//this.ontimeout = init.ontimeout||noop;
	}
	function setRequestHeaders(headers, xhr) {
		for (var header in headers) {
			xhr.setRequestHeader(header, headers[header]);
		}
	}
	function serializeData(data) {
		if (isEmpty(data)) {
			return null;
		}
		if (isString(data) || isFormData(data)) {
			return data;
		} else {
			var form = new FakeFormData();
			for (var o in data) {
				if (data.hasOwnProperty(o)) {
					form.append(o, data[o]);
				}
			}
			return form.stringify();
		}
	}
	function throwRuntimeError(methodName, reason) {
		throw new Error('http ' + methodName + ':' + reason);
	}
	function assign(dst, source) {
		if (typeof dst !== 'object') {
			throwRuntimeError(assign, 'the first argument must be an object');
		} else if (typeof source !== 'object') {
			throwRuntimeError(assign, 'the second argument must be an object');
		}
		return shadowCopy(dst, source);
	}
	function shadowCopy(dst, source) {
		for (var o in source) {
			dst[o] = source[o];
		}
		return dst;
	}
	function http(source) {
		if (isEmpty(source)) {
			return null;
		}
		var request = new HTTPRequest(source.url, source);

		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function () {
			if (xhr.readyState == 4) {
				clearTimeout(source.ontimeout);
				xhr.onreadystatechange = null;
				if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
					successHandler(request, xhr);
				} else {
					errorHandler(request, xhr);
				}
			}
		};

		xhr.open(request.method, request.url, request.async);
		setRequestHeaders(request.headers, xhr);
		//ie9以下不支持overrideMimeType
		request.dataType &&xhr.overrideMimeType&& xhr.overrideMimeType(request.dataType);
		xhr.send(request.body);
		request.timeoutHandler = setTimeout(function () {
			timeoutHandler(request, xhr);
		}, request.timeout);
	}
	function post(url, body, success, error) {
		if (isFunction(body)) {
			success = body;
			error = success;
			body = null;
		}
		var source = {
			method: 'post',
			body: body,
			url: url,
			onsuccess: success,
			onerror: error
		}
		http(source);
	}
	function get(url, body, success, error) {
		if (isFunction(body)) {
			success = body;
			error = success;
			body = null;
		}
		var source = {
			method: 'get',
			body: body,
			url: url,
			onsuccess: success,
			onerror: error
		}
		http(source);
	}
	var HTTP = {
		http: http,
		post: post,
		get: get,
		timeout: TIME_OUT
	}
	return HTTP;
});