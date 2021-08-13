// noinspection JSUnresolvedVariable,JSUnresolvedFunction

import { isOpera, isFirefox } from "../config";

/**
 * Application storage for persisting data. This module can
 * be used from content script and background context.
 *
 * @module
 * @name Storage
 */
export default class Storage {
  /**
   * @static
   * @private
   * @description
   * Determine which storage implementation
   * to use based on current browser.
   * @returns - storage implementation; either local or sync
   */
  static get storageImplementation() {
    if (isOpera || isFirefox) return chrome.storage.local;
    else return chrome.storage.sync;
  }

  /**
   * @static
   * @private
   * @function
   * @description get some property from storage
   * @param {String|Array<String>} keys must be one of `storage.keys` or `null`.
   * If `null`, entire contents of the storage will be returned.
   * @param {function} callback - function to call with result
   */
  static get(keys, callback) {
    Storage.storageImplementation.get(keys, callback);
  }

  /**
   * @static
   * @private
   * @function
   * @description save some property in storage
   * @param {String} key - one of `storage.keys`
   * @param {*} value - value to save
   * @param {function} callback - called after save operation has completed
   */
  static save(key, value, callback = undefined) {
    Storage.storageImplementation.set({ [key]: value }, callback);
  }
}
