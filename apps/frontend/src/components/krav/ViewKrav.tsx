import { AdresseType, Begrep, KravQL } from '../../constants'
import { Block } from 'baseui/block'
import React, { useState } from 'react'
import { kravStatus } from '../../pages/KravPage'
import { theme } from '../../util'
import moment from 'moment'
import Button from '../common/Button'
import { DotTag, DotTags } from '../common/DotTag'
import { ListName } from '../../services/Codelist'
import { Label, LabelAboveContent } from '../common/PropertyLabel'
import { ExternalLink, ObjectLink } from '../common/RouteLink'
import { StyledLink } from 'baseui/link'
import { slackLink, slackUserLink, termUrl } from '../../util/config'
import { user } from '../../services/User'
import { LovViewList } from '../Lov'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'


const formatDate = (date?: string) => date && moment(date).format('ll')

export const ViewKrav = ({ krav }: { krav: KravQL }) => {

  return (
    <Block width='100%'>
      <LabelAboveContent title='Suksesskriterier' markdown={krav.suksesskriterier.map(s => `${s.id}: ${s.navn}`)} vertical />
      <LabelAboveContent title='Beskrivelse' markdown={krav.beskrivelse} />

      <Block height={theme.sizing.scale800} />

      {<AllInfo krav={krav} />}
    </Block>
  )
}

const MediumInfo = ({ krav }: { krav: KravQL }) => (
  <>
    <Label title='Status'>{kravStatus(krav.status)}</Label>
    <Label title='Underavdeling'><ObjectLink id={krav.underavdeling?.code} type={ListName.UNDERAVDELING}>{krav.underavdeling?.shortName}</ObjectLink></Label>
  </>
)

const AllInfo = ({ krav }: { krav: KravQL }) => (
  <>
    <LabelAboveContent title='Utfyllende beskrivelse' markdown={krav.utdypendeBeskrivelse} />
    <LabelAboveContent title='Endringer fra forrige versjon' markdown={krav.versjonEndringer} />
    <LabelAboveContent title='Dokumentasjon' markdown={krav.dokumentasjon} />

    <LabelAboveContent title='Rettskilder' markdown={krav.rettskilder} />

    <LabelAboveContent title='Tagger'>{krav.tagger.join(', ')}</LabelAboveContent>
    <LabelAboveContent title='Relevante implementasjoner' markdown={krav.implementasjoner} />
    <LabelAboveContent title='Begreper'>{krav.begreper.map((b, i) => <BegrepView key={i} begrep={b} />)}</LabelAboveContent>




    <LabelAboveContent title='Varslingsadresser' hide={!user.isKraveier()}>
      <DotTags items={krav.varslingsadresser.map((va, i) => {
        if (va.type === AdresseType.SLACK) return <Block>Slack: <StyledLink href={slackLink(va.adresse)}>#{va.slackChannel?.name || va.adresse}</StyledLink></Block>
        if (va.type === AdresseType.SLACK_USER) return <Block>Slack: <StyledLink href={slackUserLink(va.adresse)}>{va.slackUser?.name || va.adresse}</StyledLink></Block>
        return <Block>Epost: <StyledLink href={`mailto:${va.adresse}`}>{va.adresse}</StyledLink></Block>
      }
      )} />
    </LabelAboveContent>
    {/* <LabelAboveContent title='Avdeling'>{krav.avdeling?.shortName}</LabelAboveContent> */}
    <LabelAboveContent title='Ansvarlig'><ObjectLink id={krav.underavdeling?.code} type={ListName.UNDERAVDELING}>{krav.underavdeling?.shortName}</ObjectLink></LabelAboveContent>
    <LabelAboveContent title='Kravet er relevant for'><DotTags list={ListName.RELEVANS} codes={krav.relevansFor} linkCodelist /></LabelAboveContent>
   
    <Block backgroundColor='#F6E8E6' padding='40px'>
      <Label title='Regelverk' hide={!krav.regelverk.length}>
        <LovViewList regelverk={krav.regelverk} />
      </Label>
      <Label title='Status'>{kravStatus(krav.status)}</Label>
      {krav.periode?.start && <Label title='Gyldig fom'>{formatDate(krav.periode?.start)}</Label>}
      {krav.periode?.slutt && <Label title='Gyldig tom'>{formatDate(krav.periode?.slutt)}</Label>}
    </Block>
  </>
)

const BegrepView = ({ begrep }: { begrep: Begrep }) => (
  <DotTag>
    {begrep.navn} - {begrep.beskrivelse} <ExternalLink href={termUrl(begrep.id)} label={'Link begrepskatalogen'}>
      <FontAwesomeIcon icon={faExternalLinkAlt} />
    </ExternalLink>
  </DotTag>
)
