import alertJson from './alert.js';
let testingMode = false;
let alerts = [];
let httpDetails = {};
let alreadySentHttpDetails = [];

// Function to get local storage values
async function getLocalStorageValue(key) {
    return new Promise((resolve) => {
        chrome.storage.local.get(key, (result) => {
            if (key == "alerts") {
                resolve(result[key] || []);
            } else {
                resolve(result[key] || false);
            }
        });
    });
}

// Optimized function to process HTTP objects
async function processHttpObject(httpObject) {
    console.log("processHttpObject: ", httpObject);
    // console.log("alertJson: ", alertJson);

    alerts = await getLocalStorageValue("alerts")
    testingMode = await getLocalStorageValue("testingMode")

    let validAlertName = [];

    // pre checks
    for (const alertName in alertJson) {
        let condition = alertJson[alertName];
        // 1. alertOncePerHost check
        if (condition.hasOwnProperty('alertOncePerHost') && condition.alertOncePerHost){
            let alertExists = false;
            let url = new URL(httpObject.url);
            // check if the host already exists in the alerts array
            alertExists = alerts.some(alert => 
                alert.alertName === alertName && alert.url.includes(url.host)
            )
            if (alertExists){
                console.log("alert already exists for this once per host")
                continue;
            }
        }

        // 2. if testingMode is enabled, only detect during testing needs to true
        if (testingMode && condition.hasOwnProperty('detectDuringTesting') && !condition.detectDuringTesting){
            console.log("detectDuringTesting is false, skipping")
            continue;
        }

        // 3. basic include and exclude check
        if (condition.hasOwnProperty('include') && !condition.include.includes(httpObject.type)) {
            console.log("type not included, skipping")
            continue;
        } else if (condition.hasOwnProperty('exclude') && condition.exclude.includes(httpObject.type)) {
            console.log("type excluded, skipping")
            continue;
        }

            // 3.a default skip font, image
        if (['font', 'image'].includes(httpObject.type)){
            console.log("type is font or image, skipping")
            continue;
        }

        validAlertName.push(alertName);

    }

    let [activeTab, activeHttpObject] = await getActiveTab(httpObject); 

    for (const index in validAlertName) {
        let alertName = validAlertName[index];
        // Every this it will create stack entry automatically so that previous entry won't be forgotten  
        console.log("activeTab: ", activeTab);
        console.log("activeHttpObject: ", activeHttpObject);
        let condition = alertJson[alertName];
        if (!activeTab) return;

        console.log("sending ", alertName);
        chrome.tabs.sendMessage(activeTab.tabId, {
            messageType: 'evaluateCondition',
            alertName: alertName,
            condition: condition,
            httpObject: activeHttpObject
        });
    }
}

// Function to get the active tab
function getActiveTab(httpObject) {
    return new Promise((resolve) => {
      chrome.tabs.onActivated.addListener(function getThatTab(tab) {
            chrome.tabs.onActivated.removeListener(getThatTab);
            httpDetails = {};
            alreadySentHttpDetails = [];
            resolve([tab, httpObject]);
        });
    });
}

// Main function to handle incoming messages
chrome.runtime.onMessage.addListener(async (message) => {
    if (message.messageType === 'httpObject') {
        console.log("httpObject received: ", JSON.stringify(message));
        await processHttpObject(message.httpObject);
    }
    if (message.messageType === 'alert') {
        console.log('Alert received:', message);
        await handleAlert(message.alert);
    }
});

// Function to handle alerts
async function handleAlert(message) {
    const alerts = await getLocalStorageValue('alerts');
    if (!alerts.some(alert => alert.evidence === message.evidence && alert.url === message.url)) {
        alerts.push(message);
        chrome.storage.local.set({ alerts: alerts }, () => {
            console.log('New alert added');
        });
    } else {
        console.log('Alert already exists, not adding duplicate');
    }
}

// Web request listeners
chrome.webRequest.onBeforeRequest.addListener(
    function (details) {
        
        if (details.type !== 'main_frame' && details.type !== 'script') return;

        if (!httpDetails[details.requestId]) {
            httpDetails[details.requestId] = {};
        }

        if (details.requestBody) {
            httpDetails[details.requestId]["requestBody"] = parseRequestBody(details);
        } else {
            httpDetails[details.requestId]["requestBody"] = "";
        }

        
    },
    { urls: ['<all_urls>'] },
    ['requestBody']
);

chrome.webRequest.onBeforeSendHeaders.addListener(
    async function (details) {
        if (details.type !== 'main_frame' && details.type !== 'script') return;

        if (!httpDetails[details.requestId]) {
            httpDetails[details.requestId] = {};
        }

        httpDetails[details.requestId]["url"] = details.url;
        httpDetails[details.requestId]["method"] = details.method ? details.method : "GET";
        httpDetails[details.requestId]["type"] = "html";

        if (details.type === 'script') {
            httpDetails[details.requestId]["type"] = "js"
            if (/^chrome\-extension|\?ver=|jquery|vendor|bundle|lib|cdn\-cgi/igm.test(details.url)) {
                //Intentionally return so that requestHeader key not added, 
                //so before eval we check certain keys exist or not, and this allows to skip testing on unwanted js.
                return;
            }
            // below action looks like sending request to server but script response is being served from cache.
            await fetch(details.url).then(response => response.text()).then(text => httpDetails[details.requestId]["responseBody"] = text);
        }

        httpDetails[details.requestId]["requestHeaders"] = JSON.stringify(
            details.requestHeaders.reduce((acc, header) => {
                acc[header.name] = header.value;
                return acc;
            }, {})
        );

        
    },
    { urls: ['<all_urls>'] },
    ['requestHeaders']
);

chrome.webRequest.onHeadersReceived.addListener(
    function (details) {
        if (details.type !== 'main_frame' && details.type !== 'script') return;

        if (!httpDetails[details.requestId]) {
            httpDetails[details.requestId] = {};
        }

        // httpDetails[details.requestId]["responseHeaders"] = 
        //     details.responseHeaders.reduce((acc, header) => {
        //         acc[header.name] = header.value;
        //         return acc;
        //     }, {});

        httpDetails[details.requestId]["responseHeaders"] = JSON.stringify(
            details.responseHeaders.reduce((acc, header) => {
                acc[header.name] = header.value;
                return acc;
            }, {})
        );
        httpDetails[details.requestId]["responseBody"] = "";
    },
    { urls: ["<all_urls>"] },
    ["responseHeaders"]
);

// Function to parse request body
function parseRequestBody(details) {
    if (details.requestBody.raw) {
        return new TextDecoder().decode(details.requestBody.raw[0].bytes);
    } else if (details.requestBody.formData) {
        return Object.entries(details.requestBody.formData)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value[0])}`)
            .join('&');
    }
    return "";
}

// Periodically clean up old HTTP details
setInterval(() => {
    console.log("httpdetails int: ", httpDetails)
    Object.keys(httpDetails).forEach(async requestId => {
        if (alreadySentHttpDetails.includes(requestId)) return; 
        if (httpDetails[requestId].hasOwnProperty("requestBody") && httpDetails[requestId].hasOwnProperty("responseBody") && httpDetails[requestId].hasOwnProperty("requestHeaders") && httpDetails[requestId].hasOwnProperty("responseHeaders")) {
            alreadySentHttpDetails.push(requestId);
            await processHttpObject(httpDetails[requestId])
        };
    })
}, 5000);