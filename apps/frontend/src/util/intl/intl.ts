import LocalizedStrings, {GlobalStrings, LocalizedStringsMethods} from 'react-localization'
import * as React from 'react'
import {useEffect} from 'react'
import {useForceUpdate} from '../hooks'
import {en, no} from './lang'
import * as moment from 'moment'
import 'moment/locale/nb'
import {IStrings} from './langdef'

// Remember import moment locales up top
export const langs: Langs = {
  nb: {flag: 'no', name: 'Norsk', langCode: 'nb', texts: no},
  en: {flag: 'gb', name: 'English', langCode: 'en', texts: en},
}

export const langsArray: Lang[] = Object.keys(langs).map((lang) => langs[lang])

// Controls starting language as well as fallback language if a text is missing in chosen language
const defaultLang = langs.nb

type IIntl = LocalizedStringsMethods & IStrings;

interface LocalizedStringsFactory {
  new<T>(props: GlobalStrings<T>, options?: { customLanguageInterface: () => string }): IIntl;
}

const strings: IntlLangs = {}

Object.keys(langs).forEach((lang) => (strings[lang] = langs[lang].texts))

export const intl: IIntl = new (LocalizedStrings as LocalizedStringsFactory)(strings as any, {customLanguageInterface: () => defaultLang.langCode})

interface IntlLangs {
  [lang: string]: IStrings;
}

export interface Lang {
  flag: string;
  name: string;
  langCode: string;
  texts: any;
}

interface Langs {
  [lang: string]: Lang;
}

// hooks

const localStorageAvailable = storageAvailable()

export const useLang = () => {
  const [lang, setLang] = React.useState<string>(((localStorageAvailable && localStorage.getItem('tcat-lang')) as string) || defaultLang.langCode)
  const update = useForceUpdate()
  useEffect(() => {
    intl.setLanguage(lang)
    let momentlocale = moment.locale(lang)
    if (lang !== momentlocale) console.warn('moment locale missing', lang)
    localStorageAvailable && localStorage.setItem('tcat-lang', lang)
    update()
  }, [lang])

  return setLang
}

function storageAvailable() {
  try {
    let key = 'ptab'
    localStorage.setItem(key, key)
    localStorage.removeItem(key)
    return true
  } catch (e) {
    return false
  }
}
