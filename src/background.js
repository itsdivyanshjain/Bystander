import alertJson from './alert.js';
import Interpreter from './acorn_interpreter.js';
let testingMode = false;
let alerts = [];
let httpDetails = {};
let alreadySentHttpDetails = [];

var evalSequence = new Interpreter('');
evalSequence.REGEXP_MODE = 1;

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

function encodeRFC3986URIComponent(str) {
    return encodeURIComponent(str).replace(
      /[!'()*]/g,
      (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
    );
  }

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function evaluateCondition(alertName, condition, httpObject) {
    
    //evalSequence.appendCode(`[requestUrl, requestHeaders]`)

    // evalSequence.run()
    // console.log(evalSequence.value)
    // console.log(evalSequence.getStatus())
    

    let prepared_code = condition.check;

    for (let variable in condition.variables){
        if (condition.variables[variable].startsWith("/")) {
            let flags_split = condition.variables[variable].split("/")
            let flags = flags_split.pop();
            let finalVariable = flags_split.join("/").slice(1)
            evalSequence.appendCode(`${variable} = '${encodeRFC3986URIComponent(finalVariable)}';`)
            evalSequence.appendCode(`${variable} = new RegExp(decodeURIComponent(${variable}), '${flags}');`)
            // prepared_code = prepared_code.replaceAll(variable, condition.variables[variable]);
        } else {
            evalSequence.appendCode(`${variable} = '${encodeRFC3986URIComponent(condition.variables[variable])}';`)
            evalSequence.appendCode(`${variable} = new RegExp(decodeURIComponent(${variable}), 'gm');`)
        }
    }

    console.log("prepared_code: ", prepared_code)

    evalSequence.appendCode(`${prepared_code};`)
    evalSequence.run();
    while (true) {
        evalSequence.step()
        console.log("ok")

        if (!evalSequence.step()) {
            break
        }
        await sleep(10)
    }
    

    let isAlert = evalSequence.value
    console.log("isAlert: ", isAlert)
    console.log("alertName: ", alertName)
    // evalSequence.appendCode(`keywords.test(responseBody)`)
    // while (true) {
    //     evalSequence.step()
    //     console.log("ok")

    //     if (!evalSequence.step()) {
    //         break
    //     }
    //     await sleep(10)

    // }
    // evalSequence.run()
    console.log("keywords: ", evalSequence.value)
    console.log("alertName: ", alertName)
    console.log(httpObject)
    
    if (isAlert){
        let keywordRegex = condition.variables["keywords"].startsWith("/") ? condition.variables["keywords"] : "/" + condition.variables["keywords"] + "/gm";
        let keywordsVariables = prepared_code.split(" ");
        let contextRegex =  /keywords\.test\((\w+)\)/gm;
        for (let keyword_variable of keywordsVariables){
            console.log("keyword_variable: ", keyword_variable)
            
            let context = contextRegex.exec(keyword_variable);
            console.log("context: ", context)
            if (context){
                console.log("First group: ", context[1]);
                // evalSequence.appendCode(context[1] + ".match(" + keywordRegex + ")")
                evalSequence.appendCode(context[1] + ".match(" + keywordRegex + ")") //responseBody.match(new RegExp(firstGroup))[0];
                evalSequence.run();
                while (true) {
                    evalSequence.step()
                    console.log("ok")
            
                    if (!evalSequence.step()) {
                        break
                    }
                    await sleep(10)
            
                }
                let evidence = evalSequence.value
                console.log("Evidence: ", evidence);
                if (!evalSequence.run() && evidence){
                    console.log("sending alert: ", evidence["h"][0])
                    handleAlert({
                        "alertName": alertName, 
                        "evidence": evidence["h"][0],
                        "severity": condition.severity,
                        "context": context[1],
                        "url": httpObject.url,
                        "timestamp": new Date().toISOString()
                    })
                    break;
                }
            }
        }
    }
}



// Optimized function to process HTTP objects
async function processHttpObject(httpObject) {
    console.log("processHttpObject: ", httpObject);
    // console.log("alertJson: ", alertJson);

    alerts = await getLocalStorageValue("alerts")
    testingMode = await getLocalStorageValue("testingMode")

    let validAlertName = [];
    evalSequence = new Interpreter('');
    evalSequence.REGEXP_MODE = 1;

    console.log("hello");

    //url
    let encodedUrl = encodeRFC3986URIComponent(httpObject.url);
    evalSequence.appendCode(`requestUrl = '${encodedUrl}'`)
    evalSequence.appendCode(`requestUrl = decodeURIComponent(requestUrl);`)
    // method
    evalSequence.appendCode(`requestMethod = '${httpObject.method}'`)

    // requestHeader
    let requestHeadersString = "";
    if (typeof httpObject.requestHeaders == Object) {
        Object.keys(httpObject.requestHeaders).forEach(requestId => {
            try {
                requestHeadersString += requestId + ": " +httpObject.requestHeaders[requestId] + "\n"
            } catch {
                return;
            }
        })
    } else {
        requestHeadersString += "";
    }
    requestHeadersString = encodeRFC3986URIComponent(requestHeadersString);
    evalSequence.appendCode(`requestHeaders = '${requestHeadersString}'`)
    evalSequence.appendCode(`requestHeaders = decodeURIComponent(requestHeaders);`)

    // requestBody
    let encodedRequestBody = encodeRFC3986URIComponent(httpObject.requestBody);
    evalSequence.appendCode(`requestBody = '${encodedRequestBody}'`)
    evalSequence.appendCode(`requestBody = decodeURIComponent(requestBody);`)

    // responseHeader
    let responseHeadersString = "";
    if (typeof httpObject.responseHeaders == Object) {
        Object.keys(httpObject.responseHeaders).forEach(responseId => {
            try {
                responseHeadersString += responseId + ": " +httpObject.responseHeaders[responseId] + "\n"
            } catch {
                return;
            }
        })
    } else {
        responseHeadersString += "";
    }
    responseHeadersString = encodeRFC3986URIComponent(responseHeadersString);
    evalSequence.appendCode(`responseHeaders = '${responseHeadersString}'`)
    evalSequence.appendCode(`responseHeaders = decodeURIComponent(responseHeaders);`)

    // responseBody
    let encodedResponseBody = encodeRFC3986URIComponent(httpObject.responseBody);
    evalSequence.appendCode(`responseBody = '${encodedResponseBody}'`)
    evalSequence.appendCode(`responseBody = decodeURIComponent(responseBody);`)

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

        evaluateCondition(alertName, condition, httpObject);
    }
}

// Main function to handle incoming messages
chrome.runtime.onMessage.addListener(async (message) => {
    if (message.messageType === 'httpObject') {
        console.log("httpObject received: ", JSON.stringify(message));
        processHttpObject(message.httpObject);
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
            processHttpObject(httpDetails[requestId])
        };
    })
    httpDetails = {};
}, 15000);