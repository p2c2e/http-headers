/** 
	HTTP Headers - https://www.paulhempshall.com/io/http-headers/
	Copyright (C) 2016-2021, Paul Hempshall. All rights reserved.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. 
	
	No redistribution without prior written consent.
 */

'use strict';

var defaultSettings = {
	'o_theme': 'o_theme_light',
	'o_live_output': 'o_live_output_formatted',
	'o_live_direction': ['o_live_direction_in', 'o_live_direction_out'],
	'o_live_type': ['o_live_type_main_frame', 'o_live_type_sub_frame', 'o_live_type_stylesheet', 'o_live_type_script', 'o_live_type_image', 'o_live_type_object', 'o_live_type_xmlhttprequest', 'o_live_type_other'],
	'o_live_donation': 'o_live_donation_show',
	'o_addl_headers': '',
};
var currentSettings;

var headers = {};

var filters = {
  urls: ["<all_urls>"],
  types: ["main_frame"]
};

var handler = function(details) {

	var isRefererSet = false;
	var headers = details.requestHeaders,
		blockingResponse = {};

	// for (var i = 0, l = headers.length; i < l; ++i) {
	// 	if (headers[i].name == 'Referer') {
	// 		headers[i].value = "http://your-url.com/";
	// 		isRefererSet = true;
	// 		break;
	// 	}
	// }

	// if (!isRefererSet) {
	var addl_headers = currentSettings.o_addl_headers;
	addl_headers = parseKeyValueString(addl_headers);

	console.log("addl_headers", addl_headers);
	$.each(addl_headers, function (key, value) {
		headers.push({
			name: key,
			value: value
		});
	});
		headers.push({
			name: "CUSTOM-AUTH",
			value: "Auth Token"
		});
	// }

	blockingResponse.requestHeaders = headers;
	return blockingResponse;
};
var extraInfoSpec = ['requestHeaders', 'blocking'];
chrome.webRequest.onBeforeSendHeaders.addListener(handler, filters, extraInfoSpec);


/* headers sent */
chrome.webRequest.onSendHeaders.addListener(function(details) {
  headers[details.tabId] = headers[details.tabId] || {};
  headers[details.tabId].request = details;
}, filters, ["requestHeaders"]);

/* headers received */
chrome.webRequest.onHeadersReceived.addListener(function(details) {
  headers[details.tabId] = headers[details.tabId] || {};
  headers[details.tabId].response = details;
}, filters, ["responseHeaders"]);

/* remove tab data from headers object when tab is onRemoved */
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
	delete headers[tabId];
});

function get_options() {
  chrome.storage.sync.get(
		defaultSettings,
 		function (settings) {
 			currentSettings = settings;
 		}
 	);
}
get_options();
