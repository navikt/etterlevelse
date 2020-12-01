import {Krav} from '../../constants'
import {Block} from 'baseui/block'
import React from 'react'
import {kravStatus} from '../../pages/KravPage'
import {theme} from '../../util'
import {usePersonLookup} from '../../api/TeamApi'
import DataText from '../common/DataText'
import {Markdown} from '../common/Markdown'
import {StyledLink} from 'baseui/link'
import {teamKatPersonLink} from '../../util/config'
import moment from 'moment'

const formatDate = (date?: string) => date && moment(date).format('ll')

export const ViewKrav = ({krav}: {krav: Krav}) => {
  const people = usePersonLookup()

  return (
    <Block width='100%'>
      <Label title='Hensikt'>{krav.hensikt}</Label>
      <Label title='Beskrivelse' markdown={krav.beskrivelse}/>

      <Block height={theme.sizing.scale600}/>

      <Label title='Utdypende beskrivelse' markdown={krav.utdypendeBeskrivelse}/>
      <Label title='Dokumentasjon' markdown={krav.dokumentasjon}/>
      <Label title='Rettskilder' markdown={krav.rettskilder}/>

      <Block height={theme.sizing.scale600}/>

      <Label title='Relevante implementasjoner' markdown={krav.implementasjoner}/>
      <Label title='Begreper'>{krav.begreper.join(', ')}</Label>
      <Label title='Tagger'>{krav.tagger.join(', ')}</Label>
      <Label title='Relevant for'>{krav.relevansFor?.shortName}</Label>

      <Block height={theme.sizing.scale600}/>

      <Label title='Periode'>{krav.periode?.start && 'Fra:'} {formatDate(krav.periode?.start)} {krav.periode?.slutt && 'Til:'} {formatDate(krav.periode?.slutt)}</Label>

      <Block height={theme.sizing.scale600}/>

      <Label title='Kontaktpersoner'>
        <Block display='flex'>
          {krav.kontaktPersoner.map((ident, i) =>
            <Block key={i} marginRight={theme.sizing.scale200}>
              <StyledLink target="_blank" rel="noopener noreferrer" href={teamKatPersonLink(ident)}>{people(ident)}      </StyledLink>
            </Block>
          )}
        </Block>
      </Label>
      <Label title='Avdeling'>{krav.avdeling?.shortName}</Label>
      <Label title='Underavdeling'>{krav.underavdeling?.shortName}</Label>
      <Label title='Status'>{kravStatus(krav.status)}</Label>
    </Block>
  )
}

const Label = (props: {title: string, children?: React.ReactNode, markdown?: string | string[]}) => {
  return (
    <DataText label={props.title}>
      {props.markdown ?
        <Markdown sources={Array.isArray(props.markdown) ? props.markdown : [props.markdown]} noMargin shortenLinks/>
        : props.children}
    </DataText>
  )
}
