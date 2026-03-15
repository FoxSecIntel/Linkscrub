chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || message.type !== "COPY_TO_CLIPBOARD") return;

  copyText(message.text)
    .then(() => sendResponse({ ok: true }))
    .catch((error) => {
      console.error("LinkScrub: clipboard copy failed", error);
      sendResponse({ ok: false, error: String(error) });
    });

  return true;
});

async function copyText(text) {
  if (typeof text !== "string") {
    throw new Error("Clipboard payload must be text.");
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Fallback below for environments where async clipboard is blocked.
    }
  }

  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.left = "-9999px";
  document.body.appendChild(area);

  area.focus();
  area.select();

  const ok = document.execCommand("copy");
  document.body.removeChild(area);

  if (!ok) {
    throw new Error("Clipboard copy failed in both API and fallback modes.");
  }
}
