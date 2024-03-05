import 'moment/locale/nb'
import LocalizedStrings, { GlobalStrings, LocalizedStringsMethods } from 'react-localization'
import { en, no } from './lang'
import { IStrings } from './langdef'

// Remember import moment locales up top
export const langs: ILangs = {
  nb: { flag: 'no', name: 'Norsk', langCode: 'nb', texts: no },
  en: { flag: 'gb', name: 'English', langCode: 'en', texts: en },
}

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
