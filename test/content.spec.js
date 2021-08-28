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
            <body style="background-color:red">
            <a role="link">
            <div>
            <div>
            <div dir="auto"><span>
            <span>
            GeopJr
            </span></span></div>
            <div dir="auto"></div>
            </div>
            <div>
            <div dir="ltr">
            <span>
            @GeopJr1312
            </span></div></div></div>
            </a>
            <a href="/compose/tweet" aria-label="Tweet" role="link" style="background-color:red"></a>
            <a id="test_anchor" href="/GeopJr1312" role="link">
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
    const pronouns = "he/they/any";
    const capializedPronouns = PronounHandler.capitalize(pronouns);
    expect(capializedPronouns).to.equal("He/They/Any");
  });

  it("Sets some CSS vars", () => {
    PronounHandler.createCSSVars();
    const vars = window.getComputedStyle(document.documentElement);

    expect(vars.getPropertyValue("--uwu-twt-theme")).to.equal("red");
    expect(vars.getPropertyValue("--uwu-twt-bg")).to.equal("red");
    expect(vars.getPropertyValue("--uwu-twt-text")).to.equal("white");
  });

  it("Creates modal", () => {
    PronounHandler.createModal();
    const ids = [
      "uwu__modalChips1312",
      "uwu__modal1312",
      "uwu__title1312",
      "uwu__close1312",
      "uwu__topBar1312",
      "uwu__content1312",
    ];
    let elements = [];
    for (let i = 0; i < ids.length; i++) {
      elements.push(!document.getElementById(ids[i]));
    }

    elements = elements.filter((x) => x);
    expect(elements.length).to.equal(0);
  });

  it("Removes previous modal", () => {
    PronounHandler.createModal();

    PronounHandler.createModal();

    expect(document.getElementsByClassName("uwu__hide1312").length).to.equal(1);
  });

  it("Closes modal on click", () => {
    PronounHandler.createModal();

    // Show the modal
    const modal = document.getElementById("uwu__modal1312");

    // click
    modal.classList.add("uwu__show1312");

    modal.dispatchEvent(
      new MouseEvent("mousedown", {
        view: window,
        bubbles: true,
        cancelable: true,
      })
    );

    expect(document.getElementsByClassName("uwu__show1312").length).to.equal(0);

    // keyboard
    modal.classList.add("uwu__show1312");

    document.dispatchEvent(
      new KeyboardEvent("keydown", {
        view: window,
        bubbles: true,
        cancelable: true,
        key: "Escape",
      })
    );

    expect(document.getElementsByClassName("uwu__show1312").length).to.equal(0);

    // click "x" button
    modal.classList.add("uwu__show1312");

    document.getElementById("uwu__close1312").dispatchEvent(
      new MouseEvent("mousedown", {
        view: window,
        bubbles: true,
        cancelable: true,
      })
    );

    expect(document.getElementsByClassName("uwu__show1312").length).to.equal(0);

    // keyboard wrong button
    modal.classList.add("uwu__show1312");

    document.dispatchEvent(
      new KeyboardEvent("keydown", {
        view: window,
        bubbles: true,
        cancelable: true,
        key: "Shift",
      })
    );

    expect(document.getElementsByClassName("uwu__show1312").length).to.equal(1);
  });
});
