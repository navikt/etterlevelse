import {Krav} from '../../constants'
import {Block} from 'baseui/block'
import React from 'react'
import {kravStatus} from '../../pages/KravPage'
import {LabelSmall} from 'baseui/typography'
import {theme} from '../../util'


export const ViewKrav = ({krav}: {krav: Krav}) => {
  return (
    <Block>
      <Label title='Beskrivelse'>{krav.beskrivelse}</Label>
      <Label title='Utdypende beskrivelse'>{krav.utdypendeBeskrivelse}</Label>
      <Label title='Hensikt'>{krav.hensikt}</Label>
      <Label title='Dokumentasjon'>{krav.dokumentasjon.join(', ')}</Label>
      <Label title='Relevante implementasjoner'>{krav.implementasjoner.join(', ')}</Label>
      <Label title='Begreper'>{krav.begreper.join(', ')}</Label>
      <Label title='Kontaktpersoner'>{krav.kontaktPersoner.join(', ')}</Label>
      <Label title='Rettskilder'>{krav.rettskilder.join(', ')}</Label>
      <Label title='Tagger'>{krav.tagger.join(', ')}</Label>
      <Label title='Periode'>{krav.periode?.start} {krav.periode?.slutt}</Label>
      <Label title='Avdeling'>{krav.avdeling}</Label>
      <Label title='Underavdeling'>{krav.underavdeling}</Label>
      <Label title='Relevant for'>{krav.relevansFor?.shortName}</Label>
      <Label title='Status'>{kravStatus(krav.status)}</Label>
    </Block>
  )
}

const Label = (props: {title: string, margin?: string, children: React.ReactNode}) => {
  return (
    <Block display='flex' marginBottom={props.margin || theme.sizing.scale100}>
      <LabelSmall marginRight={theme.sizing.scale400}>{props.title}: </LabelSmall>
      <LabelSmall>{props.children}</LabelSmall>
    </Block>
  )
}
