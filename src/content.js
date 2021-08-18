/** * * * * * * * * * * * * * * * * * * * *
 *
 * @description
 * Content script
 *
 * * * * * * * * * * * * * * * * * * * * */

import PronounHandler from "./modules/pronounHandler";
import Storage from "./modules/storage";
import { idFlag, maxEntries } from "./config";

// Get the twitter tokens
PronounHandler.obtainTokens(handleDOMupdate);

// This function gets initially called
// after the tokens have been obtained
function handleDOMupdate() {
  // Clear storage
  Storage.storageImplementation.clear();
  // DOM observer that calls the pronounHandler functions
  // on change
  let observer = new MutationObserver((mutations) => {
    for (let mutation of mutations) {
      for (const addedNode of mutation.addedNodes) {
        // If the node is [object Text] ignore, because Twitter:tm:
        if (Object.prototype.toString.call(addedNode) === "[object Text]")
          continue;
        // Get all anchors
        const links = addedNode.getElementsByTagName("a");
        const users = [];
        // For each anchor...
        for (let n = 0; n < links.length; n++) {
          // ... that has is a handle link and hasnt been
          // appended to yet
          if (
            PronounHandler.isHandleLink(links[n]) &&
            links[n].querySelectorAll("#" + idFlag).length === 0
          ) {
            // add user handle
            users.push(PronounHandler.parseHandle(links[n]));
          }
        }
        // If there were users
        if (users.length > 0)
          // get storage (to avoid getting rate limtied)
          Storage.get(null, (res) => {
            const saved = Object.keys(res);
            const uncommonUsers = [];
            // Add only users that are not in storage yet
            for (let k = 0; k < users.length; k++) {
              if (!saved.includes(users[k])) uncommonUsers.push(users[k]);
            }

            // Go through requesting the bios only for the
            // non-yet-saved users
            PronounHandler.requestBios(uncommonUsers);
          });
        // Modify DOM for all saved users anyway
        PronounHandler.executeBlock();
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}


// Every 5 minutes, go through storage
// if there are over the amount of max entries
// allowed (set in config), remove any above
// that from the beginning.
// Eg. if there are 6512 entries,
// remove the first 1512 from storage
// (if maxEntries is set to 5000)
setInterval(function () {
  Storage.get(null, (res) => {
    const saved = Object.keys(res);
    if (saved.length > maxEntries)
      Storage.storageImplementation.remove(saved.slice(0, saved.length - maxEntries));
  });
}, 5 * 60 * 1000); // 5mins
