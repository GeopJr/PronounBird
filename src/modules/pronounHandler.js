import { browserVariant, presetPronouns, maxRetries } from "../config";
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
        !link.innerText.endsWith(" Retweeted") &&
        // is not a list
        !link.href.includes("/lists/")
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
  static requestBios(handles, retry = 0) {
    if (!handles || handles.length === 0 || retry > maxRetries) return;
    let handleList = handles;
    TwitterApi.getTheBio(
      handleList,
      ps.tokens.bearerToken,
      ps.tokens.csrfToken,
      (userData) => {
        const successHandles = userData.map((x) => x.handle);
        handleList = handleList.filter((x) => !successHandles.includes(x));
        PronounHandler.processBios(userData);
      },
      () => {
        PronounHandler.obtainTokens();
        requestBios(handleList, retry + 1);
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
      const { bio, id, location } = users[i];
      // ...that has both an id and a bio
      if (!id || (!bio && !location)) continue;
      let pronouns = PronounHandler.checkWords(bio);
      if (pronouns == 0) pronouns = PronounHandler.checkWords(location);
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
      .replace(/[^a-zA-Z \/,;\n]/g, "")
      .split(/ |,|;|\n/)
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
   * Creates CSS variables of common
   * colors
   */
  static createCSSVars() {
    const composeBtn =
      document.querySelectorAll("[href='/compose/tweet']")[0] ||
      document.querySelectorAll("[aria-label='Compose Tweet']")[0];
    const theme = composeBtn
      ? window.getComputedStyle(composeBtn).backgroundColor
      : "rgb(29, 161, 242)";
    document.documentElement.style.setProperty("--uwu-twt-theme", theme);
    const backgroundColor = window.getComputedStyle(
      document.body
    ).backgroundColor;
    document.documentElement.style.setProperty("--uwu-twt-bg", backgroundColor);
    const isWhite = backgroundColor === "rgb(255, 255, 255)";
    document.documentElement.style.setProperty(
      "--uwu-twt-text",
      isWhite ? "black" : "white"
    );
  }

  /**
   * Creates the modal used
   * for multiple pronouns
   */
  static createModal() {
    const modal = document.createElement("div");
    modal.id = "uwu__modal1312";
    modal.classList.add("uwu__hide1312");

    modal.onmousedown = function (e) {
      if (e.currentTarget !== e.target) return;
      modal.classList.remove("uwu__show1312");
    };

    document.onkeydown = function (e) {
      if (e.key !== "Escape" || !modal.classList.contains("uwu__show1312"))
        return;
      modal.classList.remove("uwu__show1312");
    };

    const modalContent = document.createElement("div");
    modalContent.id = "uwu__content1312";

    const modalTopBar = document.createElement("div");
    modalTopBar.id = "uwu__topBar1312";

    const modalClose = document.createElement("div");
    modalClose.id = "uwu__close1312";
    modalClose.appendChild(document.createTextNode("×"));
    modalClose.onmousedown = function () {
      modal.classList.remove("uwu__show1312");
    };
    modalTopBar.prepend(modalClose);

    const modalTitle = document.createElement("div");
    modalTitle.id = "uwu__title1312";
    modalTitle.appendChild(document.createTextNode("More Pronouns"));
    modalTopBar.append(modalTitle);

    modalContent.prepend(modalTopBar);

    const modalChips = document.createElement("div");
    modalChips.id = "uwu__modalChips1312";
    modalContent.append(modalChips);

    modal.append(modalContent);
    if (document.getElementById("uwu__modal1312")) {
      document.body.removeChild(document.getElementById("uwu__modal1312"));
    }
    document.body.prepend(modal);
  }

  /**
   * Add pronouns in dom
   *
   * @returns {Promise}
   */
  static executeBlock() {
    // Get all saved pronouns
    return Storage.get(null, (res) => {
      if (!res || Object.keys(res).length === 0) return;
      // Get all anchors in main
      const links = document.body
        .getElementsByTagName("main")[0]
        .getElementsByTagName("a");
      // For each anchor
      for (let n = 0; n < links.length; n++) {
        // Check if anchor is handle + hasnt been appended yet
        if (
          !PronounHandler.isHandleLink(links[n]) ||
          links[n].parentElement.querySelectorAll("#uwu__awoo1312").length !== 0
        )
          continue;

        const link = links[n];
        const handle = PronounHandler.parseHandle(link);
        let pronouns;
        // If handle is in storage
        if (res.hasOwnProperty(handle)) {
          pronouns = res[handle];
        } else {
          continue;
        }
        link.classList.add("uwu__link1312");
        link.parentElement.classList.add("uwu__link1312");
        const parentDiv = document.createElement("div");
        // Set it as appended
        parentDiv.id = "uwu__awoo1312";
        const pronTable = document.createElement("div");
        pronTable.classList.add("uwu__hide1312");
        pronTable.classList.add("uwu__pronList1312");
        // Set button if multiple
        for (let i = 0; i < 2; i++) {
          if (i === 1 && pronouns.length === 1) break;
          const newDiv = document.createElement("div");
          if (i === 1) {
            newDiv.classList.add("uwu__plus1312");
            newDiv.onclick = function (e) {
              e.stopPropagation();
              const table = link.parentElement
                .querySelector(".uwu__pronList1312")
                .cloneNode(true);
              if (table) {
                const modal = document.getElementById("uwu__modal1312");
                const chips = document.getElementById("uwu__modalChips1312");
                chips.textContent = "";
                chips.append(...table.childNodes);
                modal.classList.add("uwu__show1312");
              }
            };
          } else {
            const newContent = document.createTextNode(
              PronounHandler.capitalize(pronouns[0])
            );
            newDiv.appendChild(newContent);
          }
          // Append to parent
          parentDiv.appendChild(newDiv);
        }

        // Skip first
        for (let i = 1; i < pronouns.length; i++) {
          const pronTableItem = document.createElement("div");
          const pronTableItemContent = document.createTextNode(
            PronounHandler.capitalize(pronouns[i])
          );
          pronTableItem.appendChild(pronTableItemContent);

          pronTable.appendChild(pronTableItem);
        }
        if (pronouns.length > 1) parentDiv.appendChild(pronTable);

        // Append parent to anchor
        link.parentElement.appendChild(parentDiv);
      }
    });
  }
}
