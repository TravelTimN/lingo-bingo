/* jshint esversion: 8 */


// detecting the browser: https://stackoverflow.com/a/11219680 && https://stackoverflow.com/a/9851769
const navAgt = navigator.userAgent;
const isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navAgt.indexOf(" OPR/") !== -1;
const isFirefox = typeof (InstallTrigger) !== "undefined" && navAgt.indexOf(" Firefox/") !== -1;
const isSafari = /constructor/i.test(window.HTMLElement) || (function (p) {return p.toString() === "[object SafariRemoteNotification]";})(!window["safari"] || (typeof(safari) !== "undefined" && safari.pushNotification)) || ((navAgt.indexOf("iPhone") !== -1 || navAgt.indexOf("iPad") !== -1 || navAgt.indexOf("Mac OS") !== -1) && navAgt.indexOf(" Safari/") !== -1);
// const isSafari = ((navAgt.indexOf("iPhone") !== -1 || navAgt.indexOf("iPad") !== -1 || navAgt.indexOf("Mac OS") !== -1) && navAgt.indexOf(" Safari/") !== -1)
const isIE = /*@cc_on!@*/ false || !!document.documentMode;
const isEdge = !isIE && !!window.StyleMedia;
const isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.csi || !!window.chrome.runtime);
const isEdgeChromium = isChrome && (navAgt.indexOf(" Edg/") !== -1);
const isSamsungBrowser = navAgt.indexOf(" SamsungBrowser/") !== -1;

const langList = document.getElementById("language-list");
const emojis = document.querySelectorAll(".emoji");

// update emoji icons/flags based on browser detection (and window.innerWidth for some)
if (isChrome && !isOpera && !isEdgeChromium && !isSamsungBrowser) { // Chrome
    emojis.forEach((emoji) => emoji.style.fontFamily = "Segoe UI Emoji, Noto Color Emoji, sans-serif");
    langList.style.fontFamily = "noto, sans-serif";
}
else if (isFirefox) { // Firefox
    emojis.forEach((emoji) => emoji.style.fontFamily = "Segoe UI Emoji, Noto Color Emoji, twemoji, sans-serif");
    langList.style.fontFamily = "twemoji, sans-serif";
}
else if (isSafari) { // Safari
    if (window.innerWidth < 992) { // iPhones + iPads
        emojis.forEach((emoji) => emoji.style.fontFamily = "Apple Color Emoji, Segoe UI Emoji, sans-serif");
        langList.style.fontFamily = "Apple Color Emoji, Segoe UI Emoji, sans-serif";
    } else { // iMac
        emojis.forEach((emoji) => emoji.style.fontFamily = "Apple Color Emoji, emoji-one, sans-serif");
        langList.style.fontFamily = "Apple Color Emoji, emoji-one, sans-serif";
    }
}
else if (isOpera) { // Opera
    emojis.forEach((emoji) => emoji.style.fontFamily = "Segoe UI Emoji, Noto Color Emoji, sans-serif");
    langList.style.fontFamily = "noto, sans-serif";
}
else if (isSamsungBrowser) { // Samsung Browser
    emojis.forEach((emoji) => emoji.style.fontFamily = "Segoe UI Emoji, Noto Color Emoji, sans-serif");
    langList.style.fontFamily = "noto, sans-serif";
}
else if (isEdgeChromium) { // Edge (Chromium)
    emojis.forEach((emoji) => emoji.style.fontFamily = "Segoe UI Emoji, Noto Color Emoji, sans-serif");
    langList.style.fontFamily = "noto, sans-serif";
}
else if (isEdge || isIE) { // Edge + Internet Explorer
    // out-dated browser ... recommend Chrome
}
else {
    // unknown browser ... recommend Chrome
}
