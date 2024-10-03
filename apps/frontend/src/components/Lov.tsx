import { Link } from '@navikt/ds-react'
import { IRegelverk } from '../constants'
import { CodelistService, EListName, ICodelistProps, TLovCode } from '../services/Codelist'
import { env } from '../util/env'

// unsure how to refactor code
// eslint-disable-next-line @typescript-eslint/no-require-imports
const reactProcessString = require('react-process-string')
// eslint-enable-next-line @typescript-eslint/no-require-imports
const processString = reactProcessString as (
  converters: { regex: RegExp; fn: (key: string, result: string[]) => JSX.Element | string }[]
) => (input?: string) => JSX.Element[]

interface ILovViewListProps {
  regelverkListe: IRegelverk[]
  openOnSamePage?: boolean
}

export const LovViewList = (props: ILovViewListProps) => (
  <div className="flex flex-col break-all">
    {props.regelverkListe.map((regelverk: IRegelverk, index: number) => (
      <div key={index} className="mb-2">
        <LovView regelverk={regelverk} openOnSamePage={props.openOnSamePage} />
      </div>
    ))}
  </div>
)

interface ILovViewProps {
  regelverk?: IRegelverk
  openOnSamePage?: boolean
}

export const LovView = (props: ILovViewProps) => {
  const { regelverk, openOnSamePage } = props
  const [codelistUtils] = CodelistService()

  if (!regelverk) return null

  const { spesifisering, lov } = regelverk
  const lovCode: string = lov?.code

  const lovDisplay: string = lov && codelistUtils.getShortname(EListName.LOV, lovCode)

  const descriptionText: string | JSX.Element[] | undefined = codelistUtils.valid(
    EListName.LOV,
    lovCode
  )
    ? legalBasisLinkProcessor(
        lovCode,
        codelistUtils,
        lovDisplay + ' ' + spesifisering,
        openOnSamePage
      )
    : spesifisering

  return <span>{descriptionText}</span>
}

const findLovId = (nationalLaw: string, codelistUtils: ICodelistProps): string => {
  const lov: TLovCode = codelistUtils.getCode(EListName.LOV, nationalLaw) as TLovCode
  return lov?.data?.lovId || lov?.description || ''
}

export const lovdataBase = (nationalLaw: string, codelistUtils: ICodelistProps): string => {
  const lovId: string = findLovId(nationalLaw, codelistUtils)
  if (codelistUtils.isForskrift(nationalLaw)) {
    return env.lovdataForskriftBaseUrl + lovId
  } else {
    return env.lovdataLovBaseUrl + lovId
  }
}

const legalBasisLinkProcessor = (
  law: string,
  codelistUtils: ICodelistProps,
  text?: string,
  openOnSamePage?: boolean
): string | JSX.Element[] | undefined => {
  if (!findLovId(law, codelistUtils).match(/^\d+.*/)) {
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
          href={`${lovdataBase(law, codelistUtils)}/§${result[4]}${result[6]}`}
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
          href={`${lovdataBase(law, codelistUtils)}/KAPITTEL_${result[3]}${result[4]}`}
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
          href={`${lovdataBase(law, codelistUtils)}/ARTIKKEL_${result[3]}${result[4]}`}
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
