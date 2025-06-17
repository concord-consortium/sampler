#!/usr/bin/env node

/**
 * This program reads all the available translation strings from the Po Editor
 * for a given project in all languages, filters the strings by a String ID prefix
 * and removing strings which have identical values as the default language and
 * writes a single file. The file is a two level hash with language id the top level keys
 * and string IDs the secondary keys.
 *
 * This was adapted from the original script by jsandoe in the codap-data-interactives repo.
 */

/*globals process:true */

const { writeFile } = require('fs/promises');

const progname = process.argv[1].replace(/^.*\//, '');
const usage = `usage: node ${progname} <apitoken>`;

const projectCode = 125447; // CODAP
const defaultLocale = 'en-us';

const poAPIBase = 'https://api.poeditor.com/v2';
const poAPILanguageListEndpoint = '/languages/list';
const poAPITranslationRequestEndpoint = '/projects/export';
const prefix = 'DG.Plugin.Sampler.';
const prefixRegEx = new RegExp(`^${prefix}`, "i");
const targetFilePath = `${__dirname}/../src/utils/pulled-strings.json`;
let apiToken;

function makeAPITokenPhrase(token) { return `api_token=${token}`;}
function makeProjectPhrase(id) { return `id=${id}`;}
function makeLanguagePhrase(lang) {return `language=${lang}`;}
function makeTypePhrase() {return 'type=key_value_json';}

function log(msg) {
  console.log(msg.toString() + '\n');
}

function configure(args) {
  args.shift();
  args.shift();

  apiToken = args.shift();

  if (apiToken == null) {
    return Promise.reject(usage);
  } else {
    return Promise.resolve();
  }
}

function fetchFromPo(endpoint, body) {
  const url = `${poAPIBase}${endpoint}`;
  const headers = {"Content-Type": "application/x-www-form-urlencoded"};
  return fetch(url, {method: 'POST', headers, body})
    .then(response => response.json());
}

function fetchTranslationList() {
  const tokenPhrase = makeAPITokenPhrase(apiToken);
  const idPhrase = makeProjectPhrase(projectCode);
  let languageListRequest = `${poAPIBase}${poAPILanguageListEndpoint}`;
  log(`Fetching list of translations from ${languageListRequest}`);
  return fetchFromPo(poAPILanguageListEndpoint, [tokenPhrase, idPhrase].join('&'))
      .then((data) => {
        if (data.response.status === 'fail') {
          return Promise.reject(data.response.message);
        } else {
          return Promise.resolve(data.result);
        }
      });
}

function requestTranslationStrings(languageDef) {
  const body = [
      makeProjectPhrase(projectCode),
      makeAPITokenPhrase(apiToken),
      makeLanguagePhrase(languageDef.code),
      makeTypePhrase()
  ].join('&');
  log(`Requesting translation for ${languageDef.code} from ${poAPITranslationRequestEndpoint}`);
  return fetchFromPo(poAPITranslationRequestEndpoint, body)
      .then(reply => fetch(reply.result.url))
      .then(reply => reply.json())
      .then(json => {
        log(`Received translation for ${languageDef.code}`);
        return Promise.resolve([languageDef.code, json]);
      });
}

function requestAllTranslationStrings(translationList) {
  let requests = translationList.languages.map(requestTranslationStrings);
  return Promise.allSettled(requests);
}

function filterStrings(translation, defaultTrans) {
  return Object.fromEntries(
    Object.entries(translation)
      .filter((stringMappingEntry) => {
        const [id, value] = stringMappingEntry;
        return prefixRegEx.test(id) && !(defaultTrans && value === defaultTrans[id]);
      })
      .map((stringMappingEntry) => {
        const [id, value] = stringMappingEntry;
        return [id.replace(prefixRegEx, prefix), value];
      })
  );
}

function filterTranslations(translations, defaultLang) {
  let defaultTrans = translations[defaultLang];
  log("Filtering translations for sampler prefix");
  return Object.fromEntries(Object.entries(translations).map((translationEntry) => {
    const [langID, translation] = translationEntry;
    let filteredTranslation = filterStrings(translation, (langID!==defaultLang)?defaultTrans:null);
    if (Object.keys(filteredTranslation).length > 0) {
      return [langID, filteredTranslation];
    } else {
      return null;
    }
  }).filter((entry) => entry));
}

function main(args) {
  configure(args)
    .then(fetchTranslationList)
    .then(requestAllTranslationStrings)
    .then(results => Object.fromEntries(results.filter(result => result.status === 'fulfilled').map(result => result.value)))
    .then((translations) => {
      let filteredTranslations = filterTranslations(translations, defaultLocale);
      let output = JSON.stringify(filteredTranslations, null, '  ') + '\n';
      log(`Writing output to ${targetFilePath}`);
      return writeFile(targetFilePath, output);
    });
}

main(process.argv);
