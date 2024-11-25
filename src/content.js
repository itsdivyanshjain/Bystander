console.log('content.js');
var storageKey = "processedRequests";
localStorage.setItem(storageKey, JSON.stringify({}));
var s2 = document.createElement('script');
s2.src = chrome.runtime.getURL('src/injected.js');
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
  
            
            var processedRequests = JSON.parse(localStorage.getItem(storageKey)) || {};
            console.log("processedRequests: ", processedRequests);
        
            var currentRequestKey = httpObject.url;
            if (!processedRequests.hasOwnProperty(currentRequestKey)) {
                processedRequests[currentRequestKey] = "";
                localStorage.setItem(storageKey, JSON.stringify(processedRequests));
                httpObjectList.push(httpObject)
                console.log("adding here 1");
            } 
        // Do nothing
            console.log("httpObject dom: ", httpObject);
        }
    });
  });
  
  observer.observe(document, config);


setInterval(() => {
    for (i=0; i<httpObjectList.length; i++) {
        console.log("sending to background.js")
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
    }   
})
