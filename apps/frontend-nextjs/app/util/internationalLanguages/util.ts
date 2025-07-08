import LocalizedStrings, { GlobalStrings, LocalizedStringsMethods } from 'react-localization'
import { en, no } from './language/utils'
import { IStrings } from './languageDefine/utils'

interface ILanguage {
  flag: string
  name: string
  langCode: string
  texts: any
}

interface ILanguages {
  [lang: string]: ILanguage
}

// Remember import moment locales up top
const languages: ILanguages = {
  nb: { flag: 'no', name: 'Norsk', langCode: 'nb', texts: no },
  en: { flag: 'gb', name: 'English', langCode: 'en', texts: en },
}

// Controls starting language as well as fallback language if a text is missing in chosen language
const defaultLang = languages.nb

type TIntl = LocalizedStringsMethods & IStrings
const strings: IIntlLangs = {}
interface IIntlLangs {
  [language: string]: IStrings
}

interface ILocalizedStringsFactory {
  new <T>(props: GlobalStrings<T>, options?: { customLanguageInterface: () => string }): TIntl
}

export const intl: TIntl = new (LocalizedStrings as ILocalizedStringsFactory)(strings as any, {
  customLanguageInterface: () => defaultLang.langCode,
})
