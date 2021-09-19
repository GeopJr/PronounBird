/**
 * Twitter API configuration
 *
 * @constant
 * @type {Object}
 */
export const requestConfigs = {
  /**
   * Endpoint for obtaining bios
   * @param handles - specify comma separated list of handles
   * @returns {string} - formatted URL
   */
  bioEndpoint: (handles) =>
    "https://api.twitter.com/1.1/users/lookup.json?skip_status=1&screen_name=" +
    handles,
};

/**
 * Determine if current browser is Firefox
 *
 * @constant
 * @type {Boolean}
 */
export const isFirefox = navigator.userAgent.indexOf("Firefox") > -1;

/**
 * Determine if current browser is Edge
 *
 * @constant
 * @type {Boolean}
 */
export const isEdge = navigator.userAgent.indexOf("Edg/") > -1;

/**
 * Determine if current browser is Opera
 *
 * @constant
 * @type {Boolean}
 */
export const isOpera = !!window.opr;

/**
 * Determine if current browser is Safari
 *
 * @constant
 * @type {Boolean}
 */
export const isSafari =
  navigator.vendor.match(/apple/i) &&
  !navigator.userAgent.match(/crios/i) &&
  !navigator.userAgent.match(/fxios/i);

/**
 * Determine if current browser is Chrome (might also be Brave)
 *
 * @constant
 * @type {Boolean}
 */
export const isChrome = !(isEdge || isOpera || isFirefox || isSafari);

/**
 * Extension/addon APIs reference
 * Use this method to dynamically determine the right context
 * based on browser; this is purposely a method to make this
 * work during unit testing.
 *
 * @type {Function}
 */
export const browserVariant = (_) => (isFirefox ? browser : window.chrome);

// /**
//  * Flag for marking appended DOM elements. This value can be anything,
//  * but it needs to be sufficiently unique so it doesn't clash with
//  * actual class names.
//  *
//  * @constant
//  * @type {String}
//  */
// export const idFlag = "uwu__awoo1312";

/**
 * The max amount of entries allowed in storage at one time
 * anything above that will be removed from the start.
 *
 * @constant
 * @type {number}
 */
export const maxEntries = 5000;

/**
 * The max amount of retries when Twitter API errors
 *
 * @constant
 * @type {number}
 */
export const maxRetries = 5;

/**
 * A set of preset pronouns. Feel free to add any pronouns you want.
 * Pronouns are preset to avoid only_one_joke.
 * Most have been generated from loops that would put them on every
 * possible position. If you use a script like that to generate them
 * please do check for duplicates before submitting.
 *
 * @constant
 * @type {String[]}
 */
export const presetPronouns = [
  "they/them",
  "he/him",
  "he/they",
  "she/her",
  "it/its",
  "she/they",
  "they/she",
  "he/they/any",
  "she/they/any",
  "any/he/she",
  "any/she/they",
  "she/he",
  "they/he",
  "it/he",
  "any/he",
  "he/she",
  "it/she",
  "any/she",
  "it/they",
  "any/they",
  "he/it",
  "she/it",
  "they/it",
  "any/it",
  "he/any",
  "she/any",
  "they/any",
  "it/any",
  "she/he/they",
  "she/he/it",
  "she/he/any",
  "they/he/she",
  "they/he/it",
  "they/he/any",
  "it/he/she",
  "it/he/they",
  "it/he/any",
  "any/he/they",
  "any/he/it",
  "he/she/they",
  "he/she/it",
  "he/she/any",
  "they/she/he",
  "they/she/it",
  "they/she/any",
  "it/she/he",
  "it/she/they",
  "it/she/any",
  "any/she/he",
  "any/she/it",
  "he/they/she",
  "he/they/it",
  "she/they/he",
  "she/they/it",
  "it/they/he",
  "it/they/she",
  "it/they/any",
  "any/they/he",
  "any/they/she",
  "any/they/it",
  "he/it/she",
  "he/it/they",
  "he/it/any",
  "she/it/he",
  "she/it/they",
  "she/it/any",
  "they/it/he",
  "they/it/she",
  "they/it/any",
  "any/it/he",
  "any/it/she",
  "any/it/they",
  "he/any/she",
  "he/any/they",
  "he/any/it",
  "she/any/he",
  "she/any/they",
  "she/any/it",
  "they/any/he",
  "they/any/she",
  "they/any/it",
  "it/any/he",
  "it/any/she",
  "it/any/they",
  "she/he/they/it",
  "she/he/they/any",
  "she/he/it/they",
  "she/he/it/any",
  "she/he/any/they",
  "she/he/any/it",
  "they/he/she/it",
  "they/he/she/any",
  "they/he/it/she",
  "they/he/it/any",
  "they/he/any/she",
  "they/he/any/it",
  "it/he/she/they",
  "it/he/she/any",
  "it/he/they/she",
  "it/he/they/any",
  "it/he/any/she",
  "it/he/any/they",
  "any/he/she/they",
  "any/he/she/it",
  "any/he/they/she",
  "any/he/they/it",
  "any/he/it/she",
  "any/he/it/they",
  "he/she/they/it",
  "he/she/they/any",
  "he/she/it/they",
  "he/she/it/any",
  "he/she/any/they",
  "he/she/any/it",
  "they/she/he/it",
  "they/she/he/any",
  "they/she/it/he",
  "they/she/it/any",
  "they/she/any/he",
  "they/she/any/it",
  "it/she/he/they",
  "it/she/he/any",
  "it/she/they/he",
  "it/she/they/any",
  "it/she/any/he",
  "it/she/any/they",
  "any/she/he/they",
  "any/she/he/it",
  "any/she/they/he",
  "any/she/they/it",
  "any/she/it/he",
  "any/she/it/they",
  "he/they/she/it",
  "he/they/she/any",
  "he/they/it/she",
  "he/they/it/any",
  "he/they/any/she",
  "he/they/any/it",
  "she/they/he/it",
  "she/they/he/any",
  "she/they/it/he",
  "she/they/it/any",
  "she/they/any/he",
  "she/they/any/it",
  "it/they/he/she",
  "it/they/he/any",
  "it/they/she/he",
  "it/they/she/any",
  "it/they/any/he",
  "it/they/any/she",
  "any/they/he/she",
  "any/they/he/it",
  "any/they/she/he",
  "any/they/she/it",
  "any/they/it/he",
  "any/they/it/she",
  "he/it/she/they",
  "he/it/she/any",
  "he/it/they/she",
  "he/it/they/any",
  "he/it/any/she",
  "he/it/any/they",
  "she/it/he/they",
  "she/it/he/any",
  "she/it/they/he",
  "she/it/they/any",
  "she/it/any/he",
  "she/it/any/they",
  "they/it/he/she",
  "they/it/he/any",
  "they/it/she/he",
  "they/it/she/any",
  "they/it/any/he",
  "they/it/any/she",
  "any/it/he/she",
  "any/it/he/they",
  "any/it/she/he",
  "any/it/she/they",
  "any/it/they/he",
  "any/it/they/she",
  "he/any/she/they",
  "he/any/she/it",
  "he/any/they/she",
  "he/any/they/it",
  "he/any/it/she",
  "he/any/it/they",
  "she/any/he/they",
  "she/any/he/it",
  "she/any/they/he",
  "she/any/they/it",
  "she/any/it/he",
  "she/any/it/they",
  "they/any/he/she",
  "they/any/he/it",
  "they/any/she/he",
  "they/any/she/it",
  "they/any/it/he",
  "they/any/it/she",
  "it/any/he/she",
  "it/any/he/they",
  "it/any/she/he",
  "it/any/she/they",
  "it/any/they/he",
  "it/any/they/she",
  "he/vae",
  "xe/xem",
  "zie/zim",
  "ve/ver",
  "sie/sir",
  "ne/nem",
  "ey/em",
  "fae/faer",
  "ze/hir",
  "ze/zir",
  "zhe/zher",
  "xe/xyr",
  "tey/tem",
  "xey/xem",
];
