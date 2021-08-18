import PronounHandler from "../src/modules/pronounHandler";
import PronounState from "../src/modules/pronounState";
import Tokens from "../src/modules/tokens";
import Storage from "../src/modules/storage";
import { JSDOM } from "jsdom";
// import 'regenerator-runtime/runtime'

describe("Content script", () => {
  beforeEach(() => {
    const dom = new JSDOM(
      `<html>
            <body>
            <a id="test_anchor" href="/GeopJr1312" role="link" class="css-4rbku5 css-18t94o4 css-1dbjc4n r-1loqt21 r-1wbh5a2 r-dnmrzs r-1ny4l3l">
            <div class="css-1dbjc4n r-1awozwy r-18u37iz r-1wbh5a2 r-dnmrzs r-1ny4l3l" id="id__muw2h9corh">
            <div class="css-1dbjc4n r-1awozwy r-18u37iz r-dnmrzs">
            <div dir="auto" class="css-901oao css-bfa6kz r-1awozwy r-jwli3a r-6koalj r-37j5jr r-a023e6 r-b88u0q r-rjixqe r-bcqeeo r-1udh08x r-3s2u2q r-qvutc0"><span class="css-901oao css-16my406 r-poiln3 r-bcqeeo r-qvutc0">
            <span class="css-901oao css-16my406 r-poiln3 r-bcqeeo r-qvutc0">
            GeopJr
            </span></span></div>
            <div dir="auto" class="css-901oao r-jwli3a r-xoduu5 r-18u37iz r-1q142lx r-37j5jr r-a023e6 r-16dba41 r-rjixqe r-bcqeeo r-qvutc0"></div>
            </div>
            <div class="css-1dbjc4n r-18u37iz r-1wbh5a2 r-13hce6t">
            <div dir="ltr" class="css-901oao css-bfa6kz r-111h2gw r-18u37iz r-37j5jr r-a023e6 r-16dba41 r-rjixqe r-bcqeeo r-qvutc0"><span class="css-901oao css-16my406 r-poiln3 r-bcqeeo r-qvutc0">
            @GeopJr1312
            </span></div></div></div>
            </a>
            </body>
        </html>`,
      { url: "http://localhost" }
    );

    global.window = dom.window;
    global.document = dom.window.document;
  });

  afterEach(function () {
    chrome.flush();
    sandbox.restore();
  });

  it("Matches pronouns", () => {
    expect(PronounHandler.checkWords("🏳️‍🌈 Writer (They/Them)")).to.eql([
      "they/them",
    ]);
    expect(
      PronounHandler.checkWords(
        "Talk to me about k8s [they/them, she/her,it/its]"
      )
    ).to.eql(["they/them", "she/her", "it/its"]);
  });

  it("Checks if anchor is handle", () => {
    const anchor = document.getElementsByTagName("a")[0];
    // https://github.com/jsdom/jsdom/issues/1245
    if ("undefined" === typeof anchor.innerText) {
      Object.defineProperty(anchor, "innerText", {
        get() {
          const el = this.cloneNode(true);
          el.querySelectorAll("script,style").forEach((s) => s.remove());
          return el.textContent;
        },
        set(value) {
          this.textContent = value;
        },
      });
    }
    expect(PronounHandler.isHandleLink(anchor)).to.eql(true);
  });

  it("Extracts Handle", () => {
    const anchor = document.getElementsByTagName("a")[0];
    // https://github.com/jsdom/jsdom/issues/1245
    if ("undefined" === typeof anchor.innerText) {
      Object.defineProperty(anchor, "innerText", {
        get() {
          const el = this.cloneNode(true);
          el.querySelectorAll("script,style").forEach((s) => s.remove());
          return el.textContent;
        },
        set(value) {
          this.textContent = value;
        },
      });
    }
    expect(PronounHandler.parseHandle(anchor)).to.eql("GeopJr1312");
  });

  it("Gets correct storage implementation", () => {
    const implementation = Storage.storageImplementation;
    expect(implementation).to.eql(chrome.storage.sync);
  });

  it("Checks if PS is ready", () => {
    // Obtain csrf token from cookie
    Tokens.getTheCookieTokens({
      cookie: {
        name: "ct0",
        value: "csrf",
      },
      cause: "overwrite",
    });

    // Obtain bearer token from headers
    Tokens.getTheTokens({
      requestHeaders: JSON.parse(
        "[" +
          '{"name":"x-twitter-client-language","value":"en"},' +
          '{"name":"x-csrf-token","value":"csrf"},' +
          '{"name":"sec-ch-ua-mobile","value":"?0"},' +
          '{"name":"authorization","value":"bearer"},' +
          '{"name":"content-type","value":"application/x-www-form-urlencoded"},' +
          '{"name":"Accept","value":"*/*"},' +
          '{"name":"User-Agent","value":"Mozilla/5.0"},' +
          '{"name":"x-twitter-auth-type","value":"OAuth2Session"},' +
          '{"name":"x-twitter-active-user","value":"yes"}' +
          "]"
      ),
    });

    PronounState.tokens = {
      bearerToken: Tokens.bearerToken,
      csrfToken: Tokens.csrfToken,
    };

    expect(PronounState.ready).to.eql(true);
  });

  it("Filters users with pronouns", () => {
    const users = [
      {
        handle: "GeopJr1312",
        bio: "He/They/Any - Not a parent of 2",
        id: "1",
      },
      {
        handle: "jack",
        bio: "#bitcoin",
        id: "0",
      },
    ];
    const usersWithPronouns = PronounHandler.havePronouns(users);
    expect(usersWithPronouns[0].pronouns[0]).to.equal("he/they/any");
  });

  it("Capitalizes pronouns", () => {
    const pronouns = "he/they/any"
    const capializedPronouns = PronounHandler.capitalize(pronouns)
    expect(capializedPronouns).to.equal("He/They/Any");
  });
});
