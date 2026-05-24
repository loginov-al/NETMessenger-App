const UI_PREFS_KEY = "net_ui_prefs";

const DEFAULT_UI_PREFS = {
    primaryColor: "#256c2d",
    fontSize: "medium",
    compactMode: false,
    appTitle: "NETMessenger",
    bubbleStyle: "rounded",
    sidebarWidth: 320
};

function loadUiPrefs() {
    try {
        return { ...DEFAULT_UI_PREFS, ...JSON.parse(localStorage.getItem(UI_PREFS_KEY) || "{}") };
    } catch {
        return { ...DEFAULT_UI_PREFS };
    }
}

function saveUiPrefs(prefs) {
    localStorage.setItem(UI_PREFS_KEY, JSON.stringify({ ...loadUiPrefs(), ...prefs }));
}

function getContrastColor(hex) {
    const value = hex.replace("#", "");
    if (value.length !== 6) return "#ffffff";
    const r = parseInt(value.slice(0, 2), 16);
    const g = parseInt(value.slice(2, 4), 16);
    const b = parseInt(value.slice(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? "#191d18" : "#ffffff";
}

function applyUiPrefs(prefs = loadUiPrefs()) {
    const root = document.documentElement;
    const fontSizes = { small: "14px", medium: "16px", large: "18px" };
    const bubbleRadius = prefs.bubbleStyle === "classic" ? "6px 6px 6px 2px" : "18px";
    const bubbleSent = prefs.bubbleStyle === "classic" ? "6px 6px 2px 6px" : "18px 18px 4px 18px";
    const bubbleReceived = prefs.bubbleStyle === "classic" ? "6px 6px 6px 2px" : "16px 16px 16px 4px";

    root.style.setProperty("--md-sys-color-primary", prefs.primaryColor);
    root.style.setProperty("--md-sys-color-on-primary", getContrastColor(prefs.primaryColor));
    root.style.setProperty("--app-sidebar-width", `${prefs.sidebarWidth}px`);
    root.style.setProperty("--app-font-size", fontSizes[prefs.fontSize] || fontSizes.medium);
    root.style.setProperty("--app-bubble-radius", bubbleRadius);
    root.style.setProperty("--app-bubble-sent", bubbleSent);
    root.style.setProperty("--app-bubble-received", bubbleReceived);

    document.body.classList.toggle("compact-mode", Boolean(prefs.compactMode));

    document.querySelectorAll(".brand-title").forEach((el) => {
        el.textContent = prefs.appTitle;
    });

    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) themeColorMeta.content = prefs.primaryColor;

    const dashIndex = document.title.indexOf(" - ");
    if (dashIndex !== -1) {
        document.title = prefs.appTitle + document.title.slice(dashIndex);
    }
}

function resetUiPrefs() {
    localStorage.removeItem(UI_PREFS_KEY);
    applyUiPrefs({ ...DEFAULT_UI_PREFS });
    return { ...DEFAULT_UI_PREFS };
}
