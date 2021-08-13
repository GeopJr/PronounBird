/**
 * @description
 * Manage pronoun state
 *
 * @module
 * @name PronounState
 */
export default class PronounState {
  /**
   * Get/set API tokens
   * @returns {Object}
   */
  static get tokens() {
    return this._tokens;
  }

  static set tokens(value) {
    this._tokens = value;
  }

  /**
   * Check if module is ready to make API
   * calls; it needs API tokens from background
   * first and this is an async process. Ignoring
   * this check means API call will fail if not
   * ready yet.
   *
   * @readonly
   * @returns {boolean} - true when ready to call API
   */
  static get ready() {
    return !!(
      PronounState.tokens &&
      PronounState.tokens.csrfToken &&
      PronounState.tokens.bearerToken
    );
  }
}
