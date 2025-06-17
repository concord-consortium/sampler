import _translations from "./pulled-strings.json";
const translations: Record<string, Record<string, string>> = _translations;

const DEFAULT_LOCALE = "en-us";

let locale = (getQueryParam("lang") || DEFAULT_LOCALE).toLowerCase();
if (!(locale && translations[locale])) {
  locale = DEFAULT_LOCALE;
}

function getQueryParam(s: string) {
  return new URLSearchParams(window.location.search).get(s);
}

function resolve(stringID: any) {
  return translations[locale][stringID]
    ? translations[locale][stringID]
    : (translations[DEFAULT_LOCALE][stringID]
      ? translations[DEFAULT_LOCALE][stringID]
      : stringID);
}

/**
 * Translates a string by referencing a hash of translated strings.
 * If the lookup fails, the string ID is used.
 * Arguments after the String ID are substituted for substitution tokens in
 * the looked up string.
 * Substitution tokens can have the form "%@" or "%@" followed by a single digit.
 * Substitution parameters with no digit are substituted sequentially.
 * So, tr('%@, %@, %@', 'one', 'two', 'three') returns 'one, two, three'.
 * Substitution parameters followed by a digit are substituted positionally.
 * So, tr('%@1, %@1, %@2', 'baa', 'black sheep') returns 'baa, baa, black sheep'.
 * If there are not substitution parameters, or not one for the expected position,
 * then the string is not modified.
 *
 * @param sID {{string}} a string id
 * @param args an array of strings or variable sequence of strings
 * @returns {string}
 */
export function tr(sID: string, args?: string[]): string {
  function replacer(match: string[]) {
    if (match.length===2) {
      return (args && (args[ix] != null))? args[ix++]: match;
    } else {
      return (args && (args[Number(match[2])-1] != null))? args[Number(match[2])-1]: match;
    }
  }

  if (typeof args === "string") {
    args = [args];
  }
  let s = resolve(sID);
  let ix = 0;
  return s.replace(/%@[0-9]?/g, replacer);
}
