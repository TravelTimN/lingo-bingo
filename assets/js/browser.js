/* jshint esversion: 11 */

// concept from Sean Murphy (CI alumnus)
const by = Object.freeze({
    query: query => document.querySelector(query),
    queryAll: queryAll => document.querySelectorAll(queryAll),
    tag: tag => document.getElementsByTagName(tag),
    id: id => document.getElementById(id),
    className: className => document.getElementsByClassName(className),
});

const navAgt = navigator.userAgent;
const langList = by.id("language-list");
const emojis = by.queryAll(".emoji");

// https://stackoverflow.com/a/38241481
getOS();
function getOS() {
    let platform = navigator.platform;
    let macosPlatforms = ["Macintosh", "MacIntel", "MacPPC", "Mac68K"];
    let iosPlatforms = ["iPhone", "iPad", "iPod"];
    let windowsPlatforms = ["Win32", "Win64", "Windows", "WinCE"];

    if (macosPlatforms.indexOf(platform) !== -1) {os = "macOS";}
    else if (iosPlatforms.indexOf(platform) !== -1) {os = "iOS";}
    else if (windowsPlatforms.indexOf(platform) !== -1) {os = "Windows";}
    else if (/android/gi.test(navAgt)) {os = "Android";}
    else if (!os && /linux/gi.test(platform)) {os = "Linux";}
}


// detecting browser: https://stackoverflow.com/a/11219680 && https://stackoverflow.com/a/9851769
const isOpera = (!!window.opr && !!opr.addons) || !!window.opera || (/\s(opr|opera)\//gi.test(navAgt) && /(\smobile(\s|\/)?|)/gi.test(navAgt));
const isFirefox = typeof (InstallTrigger) !== "undefined" && (/\sgecko\//gi.test(navAgt) && /\sfirefox\//gi.test(navAgt));
const isSafari = (/(iphone|ipad|macintosh)/gi.test(navAgt) && /\sversion\//gi.test(navAgt) && /\ssafari\//gi.test(navAgt) && (os == "iOS" || os == "macOS"));
const isIE = /*@cc_on!@*/ false || !!document.documentMode && (/(\smsie\s|\strident\/)/gi.test(navAgt));
const isEdge = !isIE && !!window.StyleMedia;
const isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.csi || !!window.chrome.runtime) && /\schrome\//gi.test(navAgt);
const isEdgeChromium = isChrome && (/\sedg(a?)\//gi.test(navAgt) && /(\smobile(\s|\/)?|)/gi.test(navAgt));
const isSamsungBrowser = (/\ssamsungbrowser\//gi.test(navAgt) && /\smobile(\s|\/)/gi.test(navAgt));


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
