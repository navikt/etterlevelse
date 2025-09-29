'use client'

import {
  EListName,
  IAllCodelists,
  IRegelverk,
  TLovCode,
} from '@/constants/kodeverk/kodeverkConstants'
import { CodelistContext, ICodelistProps } from '@/provider/kodeverk/kodeverkProvider'
import { env } from '@/util/env/env'
import { Link } from '@navikt/ds-react'
import { FunctionComponent, ReactNode, useContext } from 'react'

// unsure how to refactor code
// eslint-disable-next-line @typescript-eslint/no-require-imports
const reactProcessString = require('react-process-string')
// eslint-enable-next-line @typescript-eslint/no-require-imports
const processString = reactProcessString as (
  converters: { regex: RegExp; fn: (key: string, result: string[]) => ReactNode | string }[]
) => (input?: string) => ReactNode

interface ILovViewListProps {
  regelverkListe: IRegelverk[]
  openOnSamePage?: boolean
}

export const LovViewList: FunctionComponent<ILovViewListProps> = (props) => {
  const { regelverkListe, openOnSamePage } = props

  return (
    <div className='flex flex-col break-all'>
      {regelverkListe.map((regelverk: IRegelverk, index: number) => (
        <div key={index} className='mb-2'>
          <LovView regelverk={regelverk} openOnSamePage={openOnSamePage} />
        </div>
      ))}
    </div>
  )
}

interface ILovViewProps {
  regelverk?: IRegelverk
  openOnSamePage?: boolean
}

export const LovView: FunctionComponent<ILovViewProps> = (props) => {
  const { regelverk, openOnSamePage } = props
  const codelist = useContext(CodelistContext)

  if (!regelverk) return null

  const { spesifisering, lov } = regelverk

  const lovCode: string = lov?.code

  const lovDisplay: string = lov && codelist.utils.getShortname(EListName.LOV, lovCode)

  const descriptionText: string | ReactNode | undefined = codelist.utils.valid(
    EListName.LOV,
    lovCode
  )
    ? legalBasisLinkProcessor(lovCode, codelist, lovDisplay + ' ' + spesifisering, openOnSamePage)
    : spesifisering

  return <span>{descriptionText}</span>
}

const legalBasisLinkProcessor = (
  law: string,
  codelist: {
    utils: ICodelistProps
    lists: IAllCodelists
  },
  text?: string,
  openOnSamePage?: boolean
): string | ReactNode | undefined => {
  if (!findLovId(law, codelist).match(/^[\d|D]+.*/)) {
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
      regex: /(.*) §(§§)?(§)?\s*(\d+(-\d+)?) ?([A-Za-z]?)( *\([0-9]*\))*/g,
      fn: (key: string, result: string[]) => (
        <Link
          key={key}
          href={`${lovdataBase(law, codelist)}/§${result[4]}${result[6]}`}
          target={openOnSamePage ? '_self' : '_blank'}
          rel='noopener noreferrer'
        >
          {result[1]} {!result[2] && !result[3] && '§'} {result[3] && '§§'} {result[4]}
          {result[6]} {result[7]} {openOnSamePage ? '' : ' (åpner i en ny fane)'}
        </Link>
      ),
    },
    {
      regex: /(.*) kap(ittel)?\s*(\d+) ?([A-Za-z]?)( *\([0-9]*\))*/gi,
      fn: (key: string, result: string[]) => (
        <Link
          key={key}
          href={`${lovdataBase(law, codelist)}/KAPITTEL_${result[3]}${result[4]}`}
          target={openOnSamePage ? '_self' : '_blank'}
          rel='noopener noreferrer'
        >
          {result[1]} Kapittel {result[3]} {result[4]} {result[5]}{' '}
          {openOnSamePage ? '' : ' (åpner i en ny fane)'}
        </Link>
      ),
    },
    {
      regex: /(.*) art(ikkel)?\s*(\d+) ?([A-Za-z]?)( *\([0-9]*\))*/gi,
      fn: (key: string, result: string[]) => (
        <Link
          key={key}
          href={`${lovdataBase(law, codelist)}/ARTIKKEL_${result[3]}${result[4]}`}
          target={openOnSamePage ? '_self' : '_blank'}
          rel='noopener noreferrer'
        >
          {result[1]} Artikkel {result[3]} {result[4]} {result[5]}{' '}
          {openOnSamePage ? '' : ' (åpner i en ny fane)'}
        </Link>
      ),
    },
  ])(text)
}

const findLovId = (
  nationalLaw: string,
  codelist: {
    utils: ICodelistProps
    lists: IAllCodelists
  }
): string => {
  const lov: TLovCode = codelist.utils.getCode(EListName.LOV, nationalLaw) as TLovCode
  return lov?.data?.lovId || lov?.description || ''
}

export const lovdataBase = (
  nationalLaw: string,
  codelist: {
    utils: ICodelistProps
    lists: IAllCodelists
  }
): string => {
  const lovId: string = findLovId(nationalLaw, codelist)
  if (codelist.utils.isForskrift(nationalLaw)) {
    return env.lovdataForskriftBaseUrl + lovId
  } else if (codelist.utils.isRundskriv(nationalLaw)) {
    return env.lovdataRundskrivBaseUrl + lovId
  } else {
    return env.lovdataLovBaseUrl + lovId
  }
}
