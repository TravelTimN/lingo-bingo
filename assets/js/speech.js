/* jshint esversion: 11 */


let langsAvail = [];
let langCodes = [];
let theWord, theWordLang, voices;
let speechAvailable = false;
const btnAudio = by.id("btn-audio");
const languages = ["ar", "zh", "dk", "nl", "en", "ph", "fi", "fr", "de", "gr", "il", "hi", "hu", "is", "id", "ie", "it", "ja", "ko", "lv", "lt", "my", "no", "pl", "pt", "ro", "ru", "rs", "sk", "es", "sv", "th", "tr", "ua", "vi"];

// languages in order of spoken preference
const ar = ["ar-SA", "ar_SA", "ar"];
const zh = ["zh-CN", "zh_CN_#Hans", "zh", "zh-HK", "zh_HK_#Hans", "zh_HK_#Hant", "yue_HK_#Hant", "zh-TW", "zh_TW_#Hant"];
const da = ["da-DK", "da_DK", "dk"];
const nl = ["nl-NL", "nl_NL", "nl", "nl-BE", "nl_BE"];
const en = ["en-GB", "en_GB", "en-IE", "en_IE", "en-scotland", "en_scotland", "en", "en-US", "en_US", "en-AU", "en_AU", "en-ZA", "en_ZA", "en-IN", "en_IN", "en-NG", "en_NG"];
const ph = ["fil-PH", "fil_PH", "ph"];
const fi = ["fi-FI", "fi_FI", "fi"];
const fr = ["fr-FR", "fr_FR", "fr", "fr-CA", "fr_CA"];
const de = ["de-DE", "de_DE", "de", "de-AT", "de_AT", "de-LI", "de_LI", "de-CH", "de_CH"];
const gr = ["el-GR", "el_GR", "el"];
const il = ["he-IL", "he_IL", "il"];
const hi = ["hi-IN", "hi_IN", "hi"];
const hu = ["hu-HU", "hu_HU", "hu"];
const is = ["is-IS", "is_IS", "is"];
const id = ["id-ID", "id_ID", "id"];
const ie = ["ga-IE", "ga_IE", "ie"];
const it = ["it-IT", "it_IT", "it"];
const ja = ["ja-JP", "ja_JP", "ja"];
const ko = ["ko-KR", "ko_KR", "ko"];
const lv = ["lv-LV", "lv_LV", "lv"];
const lt = ["lt-LT", "lt_LT", "lt"];
const my = ["ms-MY", "ms_MY", "my"];
const no = ["nb-NO", "nb_NO", "nb", "no-NO", "no_NO", "nn-NO", "nn_NO", "nn"];
const pl = ["pl-PL", "pl_PL", "pl"];
const pt = ["pt-BR", "pt_BR", "pt", "pt-PT", "pt_PT"];
const ro = ["ro-RO", "ro_RO", "ro"];
const ru = ["ru-RU", "ru_RU", "ru"];
const rs = ["rs-RS", "rs_RS", "rs"];
const sk = ["sk-SK", "sk_SK", "sk"];
const es = ["es-MX", "es_MX", "es-ES", "es_ES", "es", "es-US", "es_US", "es-AR", "es_AR"];
const sv = ["sv-SE", "sv_SE", "sv"];
const th = ["th-TH", "th_TH", "th"];
const tr = ["tr-TR", "tr_TR", "tr"];
const ua = ["uk-UR", "uk_UA", "ua"];
const vi = ["vi-VN", "vi_VN", "vi"];


// speechSynthesis API
if ("speechSynthesis" in window) {
    speechAvailable = true;
    btnAudio.classList.remove("disabled-audio");

    function loadVoices() {
        voices = window.speechSynthesis.getVoices();
        voices.forEach((voice) => {
            if (langsAvail.indexOf(voice.lang) === -1) { // unique values only
                langsAvail.push(voice.lang);
            }
            if (langCodes.indexOf(voice.lang.slice(0, 2)) === -1) { // unique values only
                langCodes.push(voice.lang.slice(0, 2)); // only the first 2 letters
            }
        });
    }
    loadVoices();
    // Chrome loads voices asynchronously
    window.speechSynthesis.onvoiceschanged = () => {
        loadVoices();
    }
} else {
    speechAvailable = false;
    // alert("No SpeechSynthesis Available");
    const modalSpeech = by.id("modal-speech");
    noSpeechSynth();
    // modalSpeechSynth Error
    function noSpeechSynth() {
        modalSpeech.style.display = "block";
        document.body.classList.add("disabled-overflow");
    }
    btnAudio.innerHTML = "🔇";
    btnAudio.classList.add("disabled-audio");
}


// helper: speak the word if available
function speakWord(word, lang) {

    theWord = new SpeechSynthesisUtterance();

    // loop over selectedLanguage array
    for (let i = 0; i < eval(lang).length; i++) {
        // if speechSynth langsAvail matches an item in selectedLang array
        if (langsAvail.includes(eval(lang)[i])) {
            // use the first matched language from array
            theWordLang = eval(lang)[i];
            break;
        } else {
            theWordLang = undefined; // no match, set theWordLang back to 'undefined'
        }
    }

    // speechSynth available with selected lang code
    if (theWordLang != undefined) {
        btnAudio.style.pointerEvents = "auto";
        theWord.text = word.toString();
        theWord.lang = theWordLang.toString();
        speechSynthesis.speak(theWord); // speak
    } else {
        // speechSynth has selectedLang, but lang code not in array
        btnAudio.innerHTML = "🔇";
        btnAudio.style.pointerEvents = "none";
    }

}
