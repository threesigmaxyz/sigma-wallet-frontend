chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log("message received");
            if (request.method == "setCustomToken"){
                chrome.storage.local.set({"customToken": request.customToken}, function() {
                    if(chrome.runtime.lastError) {
                        console.error("Error setting " + key + " to " + JSON.stringify(data) + ": " + chrome.runtime.lastError.message);
                    }
                });
            }

            if (request.method == "getCustomToken"){
                chrome.storage.local.get("customToken", function(data) {
                    console.log(data);
                    sendResponse(data.customToken);
                });
            }
        }
  );