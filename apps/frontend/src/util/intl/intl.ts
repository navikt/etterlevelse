import * as moment from 'moment'
import 'moment/locale/nb'
import * as React from 'react'
import { useEffect } from 'react'
import LocalizedStrings, { GlobalStrings, LocalizedStringsMethods } from 'react-localization'
import { en, no } from './lang'
import { IStrings } from './langdef'
import { useForceUpdate } from '../hooks/customHooks'

// Remember import moment locales up top
export const langs: ILangs = {
  nb: { flag: 'no', name: 'Norsk', langCode: 'nb', texts: no },
  en: { flag: 'gb', name: 'English', langCode: 'en', texts: en },
}

export const langsArray: ILang[] = Object.keys(langs).map((lang) => langs[lang])

// Controls starting language as well as fallback language if a text is missing in chosen language
const defaultLang = langs.nb

type TIntl = LocalizedStringsMethods & IStrings

interface ILocalizedStringsFactory {
  new <T>(props: GlobalStrings<T>, options?: { customLanguageInterface: () => string }): TIntl
}

const strings: IIntlLangs = {}

Object.keys(langs).forEach((lang) => (strings[lang] = langs[lang].texts))

export const intl: TIntl = new (LocalizedStrings as ILocalizedStringsFactory)(strings as any, {
  customLanguageInterface: () => defaultLang.langCode,
})

interface IIntlLangs {
  [lang: string]: IStrings
}

export interface ILang {
  flag: string
  name: string
  langCode: string
  texts: any
}

interface ILangs {
  [lang: string]: ILang
}

// hooks

const localStorageAvailable = storageAvailable()

export const useLang = () => {
  const [lang, setLang] = React.useState<string>(
    ((localStorageAvailable && localStorage.getItem('tcat-lang')) as string) || defaultLang.langCode
  )
  const update = useForceUpdate()
  useEffect(() => {
    intl.setLanguage(lang)
    const momentlocale = moment.locale(lang)
    if (lang !== momentlocale) console.warn('moment locale missing', lang)
    localStorageAvailable && localStorage.setItem('tcat-lang', lang)
    update()
  }, [lang, update])

  return setLang
}

function storageAvailable() {
  try {
    const key = 'ptab'
    localStorage.setItem(key, key)
    localStorage.removeItem(key)
    return true
  } catch (e) {
    return false
  }
}
