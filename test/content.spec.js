import PronounHandler from "../src/modules/pronounHandler";
import { JSDOM } from "jsdom";

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
      PronounHandler.checkWords("Talk to me about k8s [they/them, she/her,it/its]")
    ).to.eql(["they/them", "she/her", "it/its"]);
  });

  it("Extracts Handle", () => {
    const anchor = document.getElementsByTagName("a")[0]
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
    expect(
      PronounHandler.parseHandle(anchor)
    ).to.eql("GeopJr1312");
  });
});
