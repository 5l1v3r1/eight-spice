// if you checked "fancy-settings" in extensionizr.com, uncomment this lines
/*
var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
});
*/
chrome.browserAction.setPopup({popup:''});

// get config
var config = { extensions: {} }

var loadConfig = function() {
    console.debug('Loading config...');
    
    chrome.storage.sync.get('config', function(data) {
	config = data.config || { extensions: {} };
    });
};

loadConfig();

chrome.browserAction.onClicked.addListener(function(tab) {
    // show active extensions for current page
    console.debug('chrome.browserAction.onClicked');
});

chrome.extension.onMessage.addListener( function(request, sender, sendResponse) {
	if (request.key == 'reload-config') {
	    loadConfig();	    
	    sendResponse({});
	} else {
	    var extensions = {
		    'http://bitcoinwisdom.com/.*': {
			title: 'test',
			description: '',
			author: '',
			version: "0.0.1",
			website: 'http:///',
			css: [
			    "a.link_premium { display: none; } .gg160x600 { display: none; }"
			],
			script: [
			    "/* console.debug(document.readyState); $(document).ready(function() {$( window ).trigger('resize'); console.debug('remco'); }); */"
			]
		    },
		    'https://www.google.nl/.*': {
			css: [
			    ".ads-container { display: none !important; }; "
			],
			script: [
			    
			]
		    },
		    'http://kickass.to/.*': {
			css: [
			    ".advertising, .slotbox, .tabs { display: none !important; }; "
			],
			script: [
			    
			]
		    },
		    'http://www.(zie|nu).nl/.*': {
			css: [
			    "#pageheader { min-height: 30px !important;} .adblock_h, #adblock_v, .adblock_noborder { display: none !important; }"
			],
			script: [
			    /* remove ga.js and twitter */
			]
		    },
		    'https://btc-e.com/.*': {
			css: [
			    "#content div:first-child .block:first-child {display: none !important;} p.gray { font-weight: bold; }; "
			],
			script: [
			    /* remove ga.js and twitter */
			]
		    }, 
		    'https://twitter.com/.*': {
			css: [
			    "body { background-image: none !important; background-color: #fff !important; }; "
			],
			script: [
			    
			]
		    }
	    }
	    
	    chrome.browserAction.disable(sender.tab.id);
	    chrome.browserAction.setBadgeText({ text:'', tabId: sender.tab.id});
	    chrome.browserAction.setBadgeBackgroundColor({ color:'#FFF', tabId: sender.tab.id } );
	    
	    var scripts = [];
	    var css = [];
	    
	    for (var key in config.extensions) {
		if (!config.extensions[key].enabled)
		    continue;
		
		var reg = new RegExp(config.extensions[key].matches[0]);
		if (!sender.url.match(reg)) 
		    continue;
		
		chrome.browserAction.enable(sender.tab.id);
		chrome.browserAction.setBadgeText({ text:'Actv', tabId: sender.tab.id});
		chrome.browserAction.setBadgeBackgroundColor({ color:'#000', tabId: sender.tab.id} )
		
		// get from localstorage and inject
		var extension = JSON.parse(localStorage.getItem(key) || null);
		if (!extension)
		    continue;
    
		for (i = 0; i< extension.resources.length; i++) {
		    console.debug(extension.resources[i].type);
		    if (extension.resources[i].type=='text/css') {
			css.push(localStorage[extension.resources[i].sha] || null);
		    } else if (extension.resources[i].type=='application/javascript') {
			scripts.push(localStorage[extension.resources[i].sha] || null);
		    }
		}
	    }
	    
	    sendResponse({ css: css, scripts: scripts});
	}
	
	return (true);
  });
  
