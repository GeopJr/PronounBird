import { browserVariant, idFlag, presetPronouns } from "../config";
import Storage from "./storage";
import TwitterApi from "./twitterApi";
import ps from "./pronounState";

/**
 * @description
 * PronounHandler provides functions that handle pronouns from the content
 * script
 *
 * First it will request the bios of handles (in batch) and then check thos bios
 * for pronouns (from the preset array of pronouns in config).
 * If pronouns are found, they are being saved temporarily in storage and then
 * the required divs to display them are being created and appended to the dom.
 *
 * Notes:
 * - While the original extension used a queue, I founded it pretty slow for
 *   what PronounBird does (modifying the DOM as you browse).
 * - To avoid twitter rate limits, it instead saves them in storage (there's
 *   a max amount of entries (defined in config) to avoid slowing down the
 *   browser)
 *
 * @module
 * @name PronounHandler
 */
export default class PronounHandler {
  /**
   * @ignore
   */
  constructor() {}

  /**
   * Request the tokens from background context.
   * @param {function?} callback - will call if ready to proceed
   */
  static obtainTokens(callback) {
    browserVariant().runtime.sendMessage(
      { tokens: true },
      ({ bearer, csrf }) => {
        ps.tokens = {
          bearerToken: bearer,
          csrfToken: csrf,
        };
        if (ps.ready && callback) callback();
      }
    );
  }

  /**
   * Determine if some link element is a handle.
   *
   * @param {Element} link DOM element
   * @returns {boolean}
   */
  static isHandleLink(link) {
    return !!(
      // must contain text
      (
        link.innerText &&
        // has role = "link" attribute
        link.getAttribute("role") === "link" &&
        // contains "@" of handle
        link.innerText.lastIndexOf("@") >= 0 &&
        // is not a "X Retweeted" anchor
        !link.innerText.endsWith(" Retweeted")
      )
    );
  }

  /**
   * Extract handle string from a DOM element.
   *
   * @param {Element} link element
   * @returns {string} twitter user handle
   */
  static parseHandle(link) {
    const substr = link.innerText.substr(link.innerText.lastIndexOf("@") + 1);
    const [handle] = substr.split(/\s+/, 1);

    return handle;
  }

  /**
   * Request bios from API.
   */
  static requestBios(handles) {
    if (!handles || handles.length === 0) return;
    TwitterApi.getTheBio(
      handles,
      ps.tokens.bearerToken,
      ps.tokens.csrfToken,
      (userData) => {
        PronounHandler.processBios(userData);
      },
      () => {
        return;
      }
    );
  }

  /**
   * Check users to find bios that have pronouns.
   *
   * @param {Object[]} users
   */
  static processBios(users) {
    if (!users || !users.length) return;
    // all users that have pronouns
    const usersWithPronouns = PronounHandler.havePronouns(users);
    // proceed to save them
    PronounHandler.savePronouns(usersWithPronouns);
  }

  /**
   * Check if users have pronouns
   *
   * @param {Object} user
   * @returns {boolean}
   */
  static havePronouns(users) {
    const usersWithPronouns = [];
    // For each user...
    for (let i = 0; i < users.length; i++) {
      const { bio, id } = users[i];
      // ...that has both an id and a bio
      if (!id || !bio) continue;
      const pronouns = PronounHandler.checkWords(bio);
      // If they have pronouns
      if (pronouns.length > 0) {
        // Add them to their user object ([] of String)
        users[i].pronouns = pronouns;
        usersWithPronouns.push(users[i]);
      }
    }
    return usersWithPronouns;
  }

  /**
   * Match bio against  pronouns
   * @param {String} bio - twitter bio
   * @returns {String[]} pronouns
   */
  static checkWords(bio) {
    const pronouns = [];
    // Lowercase, clean (remove any non latin characters,
    // special characters (other than space, slash, comma and ;))
    // split on slash and comma (to match more ways people list
    // their pronouns)
    // and only allow items with a slash in them.

    // Note: this might lead to other problems and im open to
    // suggestions. (problems include: non latin characters,
    // people who use commas like they,them instead of slashes)
    const pronounSet = bio
      .toLowerCase()
      .replace(/[^a-zA-Z \/,;]/g, "")
      .split(/ |,|;/)
      .filter((x) => x.includes("/"));

    for (let i = 0; i < pronounSet.length; i++) {
      // for each pronoun found, check against
      // the preset and add if true
      if (presetPronouns.includes(pronounSet[i])) {
        pronouns.push(pronounSet[i]);
      }
    }

    return pronouns;
  }

  /**
   * Recursively save user pronouns in storage
   *
   * @param {Object[]} users
   */
  static savePronouns(users) {
    if (users && users.length) {
      for (let i = 0; i < users.length; i++) {
        Storage.save(users[i].handle, users[i].pronouns);
      }
      PronounHandler.executeBlock();
    }
  }

  /**
   * Capitalize each word in pronounSet
   * they/them => They/Them
   *
   * @param {String} pronounSet
   */
  static capitalize(str) {
    return str
      .split("/")
      .map((x) => x.charAt(0).toUpperCase() + x.slice(1))
      .join("/");
  }

  /**
   * Add pronouns in dom
   *
   * @returns {Promise}
   */
  static executeBlock() {
    // Get all saved pronouns
    return Storage.get(null, (res) => {
      if (res.length === 0) return;
      // Get all anchors in main
      const links = document.body
        .getElementsByTagName("main")[0]
        .getElementsByTagName("a");
      // For each anchor
      for (let n = 0; n < links.length; n++) {
        // Check if anchor is handle + hasnt been appended yet
        if (
          PronounHandler.isHandleLink(links[n]) &&
          links[n].querySelectorAll("#" + idFlag).length === 0
        ) {
          const link = links[n];
          const handle = PronounHandler.parseHandle(link);
          let pronouns;
          // If handle is in storage
          if (res.hasOwnProperty(handle)) {
            pronouns = res[handle];
          } else {
            continue;
          }
          // Get current color theme (from the compose button)
          const theme = window.getComputedStyle(
            document.querySelectorAll("[href='/compose/tweet']")[0]
          ).backgroundColor;
          // CSS for the anchor
          // main point being setting flex to column if there are many
          // pronouns so it looks better
          link.style.cssText += `align-items: center;display: inline-flex;flex-direction: ${
            pronouns.length > 1 ? "column" : "row"
          };`;
          // Pronoun pill handler
          const parentDiv = document.createElement("div");
          // Set it as appended
          parentDiv.id = idFlag;
          // Parent CSS
          parentDiv.style.cssText = `display: inline-flex;flex-direction: row;flex-wrap: wrap;align-self: flex-start;`;
          // For each pronoun create a pill
          // and append to parent div
          for (let i = 0; i < pronouns.length; i++) {
            const newDiv = document.createElement("div");
            const newContent = document.createTextNode(
              PronounHandler.capitalize(pronouns[i])
            );
            newDiv.appendChild(newContent);
            // Pill CSS that uses the current twitter color theme
            newDiv.style.cssText = `align-items: center;justify-content: center;display: flex;border-radius: 25px;margin: .3rem;padding: .3rem;background-color:${theme};color: white;font-family:TwitterChirp, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;
            // Append to parent
            parentDiv.appendChild(newDiv);
          }
          // Append parent to anchor
          link.appendChild(parentDiv);
        }
      }
    });
  }
}
