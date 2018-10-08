const fs = require('fs');
const React = process.type === 'renderer' ? require('react') : null;
const locale =
  process.type === 'renderer' ? window.navigator.language : require('electron').app.getLocale();
const lang = locale.split('-')[0] || 'en';

let localizations = {};
if (fs.existsSync(__dirname + `/../lang/${lang}.json`)) {
  localizations = require(__dirname + `/../lang/${lang}.json`);
}

export function localized(en, ...subs) {
  let i = 0;
  let translated = localizations[en] || en;
  if (subs.length) {
    // Support "%@ and %@" OR "%1$@ and %2$@" which allows for param reordering.
    // The translation may contain this format even if the original string does not.
    if (translated.includes('%1$@')) {
      subs.forEach((sub, idx) => {
        translated = translated.replace(`%${idx}$@`, sub);
      });
    } else {
      translated = translated.replace('%@', () => subs[i++]);
    }
  }
  return translated;
}

export function localizedReactFragment(en, ...subs) {
  let translated = localizations[en] || en;
  if (!subs.length) {
    return translated;
  }

  // Support "%@ and %@" OR "%1$@ and %2$@" which allows for param reordering.
  // The translation may contain this format even if the original string does not.

  let parts = [];
  let r = /%(?:(\d)+\$)?@/g;
  let match = null;
  let used = 0;
  while ((match = r.exec(translated))) {
    if (match.index > 0) {
      parts.push(translated.substr(0, match.index));
    }
    if (match[1]) {
      parts.push(subs[match[1] / 1]);
    } else {
      parts.push(subs[used++]);
    }
    translated = translated.substr(match.index + match[0].length);
  }
  if (translated.length > 0) {
    parts.push(translated);
  }

  return React.createElement(React.Fragment, [], ...parts);
}
