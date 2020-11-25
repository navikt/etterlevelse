import {Block} from 'baseui/block'
import {H2, LabelSmall} from 'baseui/typography'
import {useParams} from 'react-router-dom'
import {useKrav} from '../api/KravApi'
import {Spinner} from '../components/common/Spinner'
import React from 'react'
import {theme} from '../util'
import {Krav, KravStatus} from '../constants'

export const kravName = (krav: Krav) => `${krav.kravNummer}.${krav.kravVersjon} - ${krav.navn}`

export const kravStatus = (krav: Krav) => {
  switch (krav.status) {
    case KravStatus.UNDER_REDIGERING:
      return 'Under redigering'
    case KravStatus.FERDIG:
      return 'Ferdig'
    default:
      return krav.status
  }
}

export const KravPage = () => {
  const id = useParams<{id: string}>().id
  const krav = useKrav(id)

  if (!krav) return <Spinner/>

  return (
    <Block>
      <H2>Krav: {kravName(krav)}</H2>

      <Label title='Beskrivelse'>{krav.beskrivelse}</Label>
      <Label title='Utdypende beskrivelse'>{krav.utdypendeBeskrivelse}</Label>
      <Label title='Hensikt'>{krav.hensikt}</Label>
      <Label title='Dokumentasjon'>{krav.dokumentasjon.join(', ')}</Label>
      <Label title='Relevante implementasjoner'>{krav.implementasjoner.join(', ')}</Label>
      <Label title='Begreper'>{krav.begreper.join(', ')}</Label>
      <Label title='Kontakpersoner'>{krav.kontaktPersoner.join(', ')}</Label>
      <Label title='Rettskilder'>{krav.rettskilder.join(', ')}</Label>
      <Label title='Tagger'>{krav.tagger.join(', ')}</Label>
      <Label title='Periode'>{krav.periode?.start} {krav.periode?.slutt}</Label>
      <Label title='Avdeling'>{krav.avdeling}</Label>
      <Label title='Underavdeling'>{krav.underavdeling}</Label>
      <Label title='relevantFor'>{krav.relevansFor?.shortName}</Label>
      <Label title='status'>{kravStatus(krav)}</Label>
    </Block>
  )
}


const Label = (props: {title: string, children: React.ReactNode}) => {
  return (
    <Block display='flex'>
      <LabelSmall marginRight={theme.sizing.scale400}>{props.title}: </LabelSmall>
      <LabelSmall>{props.children}</LabelSmall>
    </Block>
  )
}
