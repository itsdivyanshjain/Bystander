let httpObjectList = [];
let oldHttpObject = [];
let alreadySentHttpObject = [];

(function(xhr) {

    var XHR = XMLHttpRequest.prototype;

    var open = XHR.open;
    var send = XHR.send;
    var setRequestHeader = XHR.setRequestHeader;

    XHR.open = function(method, url) {
        this._method = method;
        this._url = url;
        this._requestHeaders = {};
        this._startTime = (new Date()).toISOString();

        return open.apply(this, arguments);
    };

    XHR.setRequestHeader = function(header, value) {
        this._requestHeaders[header] = value;
        return setRequestHeader.apply(this, arguments);
    };

    XHR.send = function(postData) {

        this.addEventListener('load', function() {

            let httpObject = {
                "url": this._url ? this._url.toLowerCase() : this._url,
                "method": this._method,
                "requestHeaders": this._requestHeaders,
                "requestBody": postData ? postData : "",
                "responseHeaders": this.getAllResponseHeaders(),
                "responseBody": this.response ? this.response : "", // TODO: validate the responseBody
                "type": JSON.stringify(this.getAllResponseHeaders()).includes("application/json") ? "json" : "text",
            }

            httpObjectList.push(httpObject)
            // window.postMessage({"messageType": "httpObject", "httpObject": httpObject})

            // var storageKey = "processedRequests";
            // var processedRequests = JSON.parse(localStorage.getItem(storageKey)) || {};

            // var currentRequestKey = httpObject.url;
            // if (!processedRequests[currentRequestKey]) {
            //     processedRequests[currentRequestKey] = [httpObject.responseBody];
            //     localStorage.setItem(storageKey, JSON.stringify(processedRequests));
            //     window.postMessage({"messageType": "httpObject", "httpObject": httpObject})
            //     // send message to background script
            // } else if (processedRequests[currentRequestKey].indexOf(httpObject.responseBody) === -1) {
            //     processedRequests[currentRequestKey].push(httpObject.responseBody);
            //     localStorage.setItem(storageKey, JSON.stringify(processedRequests));
            //     window.postMessage({"messageType": "httpObject", "httpObject": httpObject})
            //     // send message to background script
            // }

            // Do nothing

            console.log("httpObject XHR: ", httpObject)

        });

        return send.apply(this, arguments);
    };

})(XMLHttpRequest);

// handle fetch message




const constantMock = window.fetch;
 window.fetch = function() {
    return new Promise((resolve, reject) => {
        console.log("fetch arguments: ", arguments)
        
        constantMock.apply(this, arguments)
            .then((response) => {
                responseHeaders = {}
                response.headers.forEach((value, key) => {
                    responseHeaders[key] = value
                })
                if (arguments.length > 1) {                   
                    //console.log("response: ", response)
                    response.clone().text().then((text) => {
                        let httpObject = {
                            "url": response.url,
                            "method": arguments[1].method ? arguments[1].method.toUpperCase() : "",
                            "requestHeaders": arguments[1].headers,
                            "requestBody": arguments[1].body,
                            "responseHeaders": responseHeaders,
                            "responseBody": text,
                            "type": JSON.stringify(responseHeaders).includes("application/json") ? "json" : "text"
                            }
                        //console.log("httpObject fetch: ", httpObject)

                        httpObjectList.push(httpObject)
                        // window.postMessage({"messageType": "httpObject", "httpObject": httpObject})

                        // var storageKey = "processedRequests";
                        // var processedRequests = JSON.parse(localStorage.getItem(storageKey)) || {};

                        // var currentRequestKey = httpObject.url;
                        // if (!processedRequests[currentRequestKey]) {
                        //     processedRequests[currentRequestKey] = [httpObject.responseBody];
                        //     localStorage.setItem(storageKey, JSON.stringify(processedRequests));
                        //     window.postMessage({"messageType": "httpObject", "httpObject": httpObject})
                        //     // send message to background script
                        // } else if (processedRequests[currentRequestKey].indexOf(httpObject.responseBody) === -1) {
                        //     processedRequests[currentRequestKey].push(httpObject.responseBody);
                        //     localStorage.setItem(storageKey, JSON.stringify(processedRequests));
                        //     window.postMessage({"messageType": "httpObject", "httpObject": httpObject})
                        //     // send message to background script
                        // }

                        // Do nothing
                    })
                }
                resolve(response);
            })
            .catch((error) => {
                console.log(error);
                reject(error);
            })
    })
}

setInterval(() => {
    if (oldHttpObject.length > 0) {
        httpObjectList = httpObjectList.slice(oldHttpObject.length-1);
        //oldHttpObject = []
    }
    maxIteration = httpObjectList.length > 10 ? 10 : httpObjectList.length; 
    for (let i=0; i<maxIteration; i++) {
        alreadySent = alreadySentHttpObject.some(sentHttpObject => 
            sentHttpObject.url == httpObjectList[i].url &&
            sentHttpObject.method == httpObjectList[i].method &&
            sentHttpObject.requestBody == httpObjectList[i].requestBody
        )
        if (!alreadySent) {
            window.postMessage({"messageType": "httpObject", "httpObject": httpObjectList[i]})
            alreadySentHttpObject.push(httpObjectList[i])
        }
    }
    oldHttpObject = httpObjectList.slice(0,maxIteration);
}, 5000)

setInterval(() => {
    alreadySentHttpObject = [];
}, 60000)