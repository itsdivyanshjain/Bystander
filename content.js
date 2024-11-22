console.log('content.js');
var s2 = document.createElement('script');
s2.src = chrome.runtime.getURL('injected.js');
console.log('s2.src', s2.src);
(document.head || document.documentElement).appendChild(s2);

httpObjectList = [];

const config = { childList: true, subtree: true };
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
            let responseBody = document.documentElement.outerHTML;
            let httpObject = {
                "url": document.location.href,
                "method": "",
                "requestHeaders": "",
                "requestBody": "",
                "responseHeaders": "",
                "responseBody": responseBody,
                "type": "html"
            }
            
            // console.log("httpObject dom: ", httpObject);
          
  
      // window.postMessage({"messageType": "httpObject", "httpObject": httpObject})
  
            var storageKey = "processedRequests";
            var processedRequests = JSON.parse(localStorage.getItem(storageKey)) || {};
        
            var currentRequestKey = httpObject.url;
            if (!processedRequests[currentRequestKey]) {
                processedRequests[currentRequestKey] = [httpObject.responseBody];
                localStorage.setItem(storageKey, JSON.stringify(processedRequests));
                httpObjectList.push(httpObject)
            } else if (processedRequests[currentRequestKey].indexOf(httpObject.responseBody) === -1) {
                processedRequests[currentRequestKey].push(httpObject.responseBody);
                localStorage.setItem(storageKey, JSON.stringify(processedRequests));
                httpObjectList.push(httpObject)
            }
        // Do nothing
            console.log("httpObject dom: ", httpObject);
        }
    });
  });
  
  observer.observe(document, config);


setInterval(() => {
    for (i=0; i<httpObjectList.length; i++) {
        chrome.runtime.sendMessage({
            "messageType": "httpObject",
            "httpObject": httpObjectList[i]
        });
    }
    httpObjectList = []
}, 10000)


 // send message to background.js so that it can get alertJson

window.addEventListener("message",(event) => {
    if (event.data) {
        if (event.data.messageType === 'httpObject') { // from injected.js
            chrome.runtime.sendMessage(event.data) // to background.js
        }
        if (event.data.messageType === 'alert') { // from injected.js
            console.log("raising alert")
            chrome.runtime.sendMessage(event.data) // to popup.js
        }
        // if (event.data.messageType === 'alert') { // from injected.js
        //     chrome.runtime.sendMessage(event.data) // to background.js
        // }
        // if (event.data.messageType === 'getAlertJson') { // from injected.js
        //     chrome.runtime.sendMessage(event.data) // to background.js
        // }
    }   
})
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // for settings alertJson variables
    console.log("message: ", message)
    if (message.messageType === 'evaluateCondition') { // from background.js
        console.log("evaluateCondition: ", message)
        evaluateCondition(message.alertName, message.condition, message.httpObject); // to injected.js
    }
    // sendResponse({damn: true});
    // if (message.type === 'alertJson') { // from background.js
    //     console.log("alertJson: ", message)
    //     window.postMessage(message) // to injected.js
    // }
    // if (message.type === 'passiveCheck') { // from background.js
    //     console.log("passiveCheck: ", message)
    //     window.postMessage(message) // to injected.js
    // }
})

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
    console.log("hello");

    var evalSequence = new Interpreter('');

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
    //evalSequence.appendCode(`[requestUrl, requestHeaders]`)

    // evalSequence.run()
    // console.log(evalSequence.value)
    // console.log(evalSequence.getStatus())
    

    let prepared_code = condition.check;

    for (let variable in condition.variables){
        if (condition.variables[variable].startsWith("/")) {
            let flags_split = condition.variables[variable].split("/")
            flags = flags_split.pop();
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
                evidence = evalSequence.value
                console.log("Evidence: ", evidence);
                if (!evalSequence.run() && evidence){
                    console.log("sending alert: ", evidence["h"][0])
                    chrome.runtime.sendMessage({
                        "messageType": "alert",
                        "alert": {
                            "alertName": alertName, 
                            "evidence": evidence["h"][0],
                            "severity": condition.severity,
                            "context": context[1],
                            "url": httpObject.url,
                            "timestamp": new Date().toISOString()
                        }
                    })
                    break;
                }
            }
        }
    }
}

