import { Link } from '@navikt/ds-react'
import { IRegelverk } from '../constants'
import { EListName, codelist } from '../services/Codelist'
import { env } from '../util/env'

// unsure how to refactor code
// eslint-disable-next-line @typescript-eslint/no-var-requires
const reactProcessString = require('react-process-string')
// eslint-enable-next-line @typescript-eslint/no-var-requires
const processString = reactProcessString as (
  converters: { regex: RegExp; fn: (key: string, result: string[]) => JSX.Element | string }[]
) => (input?: string) => JSX.Element[]

export const LovViewList = (props: { regelverkListe: IRegelverk[]; openOnSamePage?: boolean }) => (
  <div className="flex flex-col break-all">
    {props.regelverkListe.map((regelverk, index) => (
      <div key={index} className="mb-2">
        <LovView regelverk={regelverk} openOnSamePage={props.openOnSamePage} />
      </div>
    ))}
  </div>
)

export const LovView = (props: { regelverk?: IRegelverk; openOnSamePage?: boolean }) => {
  if (!props.regelverk) return null
  const { spesifisering, lov } = props.regelverk
  const lovCode = lov?.code

  const lovDisplay = lov && codelist.getShortname(EListName.LOV, lovCode)

  const descriptionText = codelist.valid(EListName.LOV, lovCode)
    ? legalBasisLinkProcessor(lovCode, lovDisplay + ' ' + spesifisering, props.openOnSamePage)
    : spesifisering

  return <span>{descriptionText}</span>
}

const findLovId = (nationalLaw: string) => {
  const lov = codelist.getCode(EListName.LOV, nationalLaw)
  return lov?.data?.lovId || lov?.description || ''
}

export const lovdataBase = (nationalLaw: string) => {
  const lovId = findLovId(nationalLaw)
  if (codelist.isForskrift(nationalLaw)) {
    return env.lovdataForskriftBaseUrl + lovId
  } else {
    return env.lovdataLovBaseUrl + lovId
  }
}

const legalBasisLinkProcessor = (law: string, text?: string, openOnSamePage?: boolean) => {
  if (!findLovId(law).match(/^\d+.*/)) {
    return text
  }

  return processString([
    {
      // Replace '§§ 10 og 4' > '§§ 10 og §§§ 4', so that our rewriter picks up the 2nd part
      regex: /(.*) §§\s*(\d+(-\d+)?)\s*og\s*(\d+(-\d+)?)/gi,
      fn: (_key: string, result: string[]) => `${result[1]} §§ ${result[2]} og §§§ ${result[4]}`,
    },
    {
      // triple '§§§' is hidden, used as a trick in combination with rule 1 above
      regex: /(.*) §(§§)?(§)?\s*(\d+(-\d+)?) ?([aA-zZ]?)( *\([0-9]*\))*/g,
      fn: (key: string, result: string[]) => (
        <Link
          key={key}
          href={`${lovdataBase(law)}/§${result[4]}${result[6]}`}
          target={openOnSamePage ? '_self' : '_blank'}
          rel="noopener noreferrer"
        >
          {result[1]} {!result[2] && !result[3] && '§'} {result[3] && '§§'} {result[4]}
          {result[6]} {result[7]} {openOnSamePage ? '' : ' (åpnes i ny fane)'}
        </Link>
      ),
    },
    {
      regex: /(.*) kap(ittel)?\s*(\d+) ?([aA-zZ]?)( *\([0-9]*\))*/gi,
      fn: (key: string, result: string[]) => (
        <Link
          key={key}
          href={`${lovdataBase(law)}/KAPITTEL_${result[3]}${result[4]}`}
          target={openOnSamePage ? '_self' : '_blank'}
          rel="noopener noreferrer"
        >
          {result[1]} Kapittel {result[3]} {result[4]} {result[5]}{' '}
          {openOnSamePage ? '' : ' (åpnes i ny fane)'}
        </Link>
      ),
    },
    {
      regex: /(.*) art(ikkel)?\s*(\d+) ?([aA-zZ]?)( *\([0-9]*\))*/gi,
      fn: (key: string, result: string[]) => (
        <Link
          key={key}
          href={`${lovdataBase(law)}/ARTIKKEL_${result[3]}${result[4]}`}
          target={openOnSamePage ? '_self' : '_blank'}
          rel="noopener noreferrer"
        >
          {result[1]} Artikkel {result[3]} {result[4]} {result[5]}{' '}
          {openOnSamePage ? '' : ' (åpnes i ny fane)'}
        </Link>
      ),
    },
  ])(text)
}
