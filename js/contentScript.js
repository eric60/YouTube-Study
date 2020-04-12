
let firstRun = false;
let activated;
let category;
let observer;
let prevUrls = [];
let url;

function initiateMutationObserver() {
    MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

    observer = new MutationObserver(function(mutations, observer) {
        // fired when a mutation occurs
        if(activated == true) {
            initiate()
        }
    });

    // define what element should be observed by the observer
    // and what types of mutations fr the callback
    observer.observe(document, {
        subtree: true,
        childList: true
    });
}

chrome.storage.local.get(['activated'], function(data) {
    activated = data.activated;  

    if (activated == true) {
        console.log('Blocking is activated. Initiating blocking')
        $(document).ready(initiate)
    } 
    else {
        console.log('Blocking not activated. Not initiating')
    }
});

// Youtube SPA updates DOM dynamically
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {  
    if (request.query === 'Page updated' && activated == true)
    {
        console.log('Page updated');
        initiate();
    }
 });
 
//  initiateMutationObserver()

 function excludeDuplicateUrls(url) {
    if (prevUrls.includes(url)) {
        return;
    }
    prevUrls.push(url)
 }

 /*
    clickMore
    getCategory
    processYoutubeCategory 
    BlockYoutubeUrl
 */
 function initiate() {
    url = window.location.href;
    excludeDuplicateUrls(url)
    console.log(prevUrls)
    if (!isYoutubeVideo(url)) {
        console.log("Not youtube video")
        return;
    } 
    else {
        console.log("Initiating Youtube Study for " + url);

        $(document).ready(function() {
            let running = true;
            let cnt = 0;
         
            while (running) {
                running = false;
                try {
                    setTimeout(clickMoreToExposeCategory, 1000)
                    setTimeout(getCategory, 1000)
                }
                catch (err) {                         
                    cnt++;
                    if(cnt < 3) {
                        running = true                     
                    }
                    else {
                        // window.location.reload()
                    }
                    console.log("running cnt: " + cnt)
                    console.log(err)
                }
            }
  
        })
    }
 }

 function isYoutubeVideo(url) {
    let match = url.includes("v=")
    if (!match) {
        return false
    }
    return true
 }

 function clickMoreToExposeCategory() {
    let result = document.querySelector("paper-button#more").click()
    console.log("triggered click more: " + result)
 }

 function getCategory() {
     try {
        category = document.getElementById("collapsible").getElementsByTagName("a")[0].text
        console.log('triggered getCategory: ' + category)
        processYoutubeCategory()
     } catch(err) {
        console.log(err)
        chrome.runtime.sendMessage({createNotification: false})
     }
 }

function processYoutubeCategory() {
    console.log("inside processYoutube")
    console.log('------>' +  category)
    let allowedCategories = ["Education", "Science & Technology", "Howto & Style"]

    if( category) {
        let isAllowedResult = allowedCategories.includes(category);
        console.log('isAllowedUrl: ' + isAllowedResult);

        if (isAllowedResult == false) {
            blockYoutubeUrl();
        }
    }   
}

function blockYoutubeUrl() {
    console.log('in blockYoutubeUrl')
    chrome.storage.local.get(['activated'], function(data) {
        console.log('Blocking Activated value: ' + data.activated)
    
        if (data.activated === true) {
            chrome.runtime.sendMessage({createNotification: true})
            console.log('---- Sent create notification to background ----');
            location.replace('http://youtube.com')
        }
    });
}





