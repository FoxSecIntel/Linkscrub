const MENU_ID = "linkscrub-copy-clean-link";

const TRACKING_KEYS = new Set([
  "fbclid",
  "gclid",
  "dclid",
  "msclkid",
  "yclid",
  "mc_cid",
  "mc_eid",
  "igshid",
  "rb_clickid",
  "s_cid",
  "vero_id",
  "oly_enc_id",
  "oly_anon_id",
  "ref",
  "ref_src",
  "ref_url",
  "source",
  "src",
  "si",
  "_hsenc",
  "_hsmi",
  "mkt_tok"
]);

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: MENU_ID,
    title: "Copy clean link",
    contexts: ["link"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId !== MENU_ID) return;
  if (!info.linkUrl) return;

  const cleanedUrl = cleanUrl(info.linkUrl);

  try {
    await ensureOffscreenDocument();
    await chrome.runtime.sendMessage({
      type: "COPY_TO_CLIPBOARD",
      text: cleanedUrl
    });
  } catch (err) {
    console.error("LinkScrub: failed to copy clean link", err);
  }
});

function cleanUrl(rawUrl) {
  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    return rawUrl;
  }

  const params = url.searchParams;
  const keysToDelete = [];

  for (const key of params.keys()) {
    const lower = key.toLowerCase();

    if (lower.startsWith("utm_")) {
      keysToDelete.push(key);
      continue;
    }

    if (TRACKING_KEYS.has(lower)) {
      keysToDelete.push(key);
    }
  }

  for (const key of keysToDelete) {
    params.delete(key);
  }

  url.search = params.toString();
  return url.toString();
}

async function ensureOffscreenDocument() {
  const offscreenUrl = chrome.runtime.getURL("offscreen.html");

  if (chrome.runtime.getContexts) {
    const contexts = await chrome.runtime.getContexts({
      contextTypes: ["OFFSCREEN_DOCUMENT"],
      documentUrls: [offscreenUrl]
    });

    if (contexts.length > 0) return;
  } else {
    try {
      await chrome.offscreen.createDocument({
        url: "offscreen.html",
        reasons: ["CLIPBOARD"],
        justification: "Copy cleaned links to the clipboard from the service worker."
      });
      return;
    } catch (e) {
      if (!String(e?.message || "").includes("Only a single offscreen document")) {
        throw e;
      }
      return;
    }
  }

  await chrome.offscreen.createDocument({
    url: "offscreen.html",
    reasons: ["CLIPBOARD"],
    justification: "Copy cleaned links to the clipboard from the service worker."
  });
}
