import React from 'react'
import {codelist, ListName} from '../services/Codelist'
import {env} from '../util/env'
import {Regelverk} from '../constants'
import {Block} from 'baseui/block'
import CustomizedLink from './common/CustomizedLink'

const reactProcessString = require('react-process-string')
const processString = reactProcessString as (
  converters: {
    regex: RegExp
    fn: (key: string, result: string[]) => JSX.Element | string
  }[],
) => (input?: string) => JSX.Element[]

export const LovViewList = (props: {regelverk: Regelverk[]}) => {
  return (
    <Block
      display="flex"
      flexDirection="column"
      $style={{wordBreak: 'break-all'}}
    >
      {props.regelverk.map((r, i) => (
        <Block key={i}>
          <LovView regelverk={r} />
        </Block>
      ))}
    </Block>
  )
}

export const LovView = (props: {regelverk?: Regelverk}) => {
  if (!props.regelverk) return null
  const {spesifisering, lov} = props.regelverk
  const lovCode = lov?.code

  let lovDisplay = lov && codelist.getShortname(ListName.LOV, lovCode)

  let descriptionText = codelist.valid(ListName.LOV, lovCode)
    ? legalBasisLinkProcessor(lovCode, spesifisering)
    : spesifisering

  return (
    <span>
      {lovDisplay} {descriptionText}
    </span>
  )
}

const findLovId = (nationalLaw: string) => {
  const lov = codelist.getCode(ListName.LOV, nationalLaw)
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

const legalBasisLinkProcessor = (law: string, text?: string) => {
  if (!findLovId(law).match(/^\d+.*/)) {
    return text
  }

  return processString([
    {
      // Replace '§§ 10 og 4' > '§§ 10 og §§§ 4', so that our rewriter picks up the 2nd part
      regex: /§§\s*(\d+(-\d+)?)\s*og\s*(\d+(-\d+)?)/gi,
      fn: (key: string, result: string[]) =>
        `§§ ${result[1]} og §§§ ${result[3]}`,
    },
    {
      // triple '§§§' is hidden, used as a trick in combination with rule 1 above
      regex: /§(§§)?(§)?\s*(\d+(-\d+)?)/g,
      fn: (key: string, result: string[]) => (
        <CustomizedLink
          key={key}
          href={`${lovdataBase(law)}/§${result[3]}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {!result[1] && !result[2] && '§'} {result[2] && '§§'} {result[3]}
        </CustomizedLink>
      ),
    },
    {
      regex: /kap(ittel)?\s*(\d+)/gi,
      fn: (key: string, result: string[]) => (
        <CustomizedLink
          key={key}
          href={`${lovdataBase(law)}/KAPITTEL_${result[2]}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Kapittel {result[2]}
        </CustomizedLink>
      ),
    },
  ])(text)
}
