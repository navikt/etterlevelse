import {AdresseType, KravQL} from '../../constants'
import {Block} from 'baseui/block'
import React, {useState} from 'react'
import {kravStatus} from '../../pages/KravPage'
import {theme} from '../../util'
import moment from 'moment'
import Button from '../common/Button'
import {DotTags} from '../common/DotTag'
import {ListName} from '../../services/Codelist'
import {Label} from '../common/PropertyLabel'
import {ObjectLink} from '../common/RouteLink'
import {StyledLink} from 'baseui/link'
import {slackLink, slackUserLink} from '../../util/config'
import {user} from '../../services/User'
import {LovViewList} from '../Lov'

const formatDate = (date?: string) => date && moment(date).format('ll')

export const ViewKrav = ({krav}: {krav: KravQL}) => {
  const [expand, setExpand] = useState(false)

  return (
    <Block width='100%'>
      <Label title='Hensikt' markdown={krav.hensikt}/>
      <Label title='Suksesskriterier' markdown={krav.suksesskriterier.map(s => `${s.id}: ${s.navn}`)} vertical/>
      <Label title='Beskrivelse' markdown={krav.beskrivelse}/>

      <Block height={theme.sizing.scale800}/>

      {expand && <AllInfo krav={krav}/>}
      {!expand && <MediumInfo krav={krav}/>}
      <Block display='flex' justifyContent='flex-end'>
        <Button onClick={() => setExpand(!expand)}>{`${expand ? 'Skjul' : 'Vis'} detaljer`}</Button>
      </Block>
    </Block>
  )
}

const MediumInfo = ({krav}: {krav: KravQL}) => (
  <>
    <Label title='Status'>{kravStatus(krav.status)}</Label>
    <Label title='Underavdeling'><ObjectLink id={krav.underavdeling?.code} type={ListName.UNDERAVDELING}>{krav.underavdeling?.shortName}</ObjectLink></Label>
  </>
)

const AllInfo = ({krav}: {krav: KravQL}) => (
  <>
    <Label title='Utfyllende beskrivelse' markdown={krav.utdypendeBeskrivelse}/>
    <Label title='Endringer fra forrige versjon' markdown={krav.versjonEndringer}/>
    <Label title='Dokumentasjon' markdown={krav.dokumentasjon}/>
    <Label title='Regelverk' hide={!krav.regelverk.length}>
      <LovViewList regelverk={krav.regelverk}/>
    </Label>
    <Label title='Rettskilder' markdown={krav.rettskilder}/>

    <Label title='Tagger'>{krav.tagger.join(', ')}</Label>
    <Label title='Kravet er relevant for'><DotTags list={ListName.RELEVANS} codes={krav.relevansFor} linkCodelist/></Label>
    <Label title='Relevante implementasjoner' markdown={krav.implementasjoner}/>
    <Label title='Begreper'>{krav.begreper.join(', ')}</Label>

    {krav.periode?.start && <Label title='Gyldig fom'>{formatDate(krav.periode?.start)}</Label>}
    {krav.periode?.slutt && <Label title='Gyldig tom'>{formatDate(krav.periode?.slutt)}</Label>}

    <Label title='Status'>{kravStatus(krav.status)}</Label>
    <Label title='Varslingsadresser' hide={!user.isKraveier()}>
      <DotTags items={krav.varslingsadresser.map((va, i) => {
          if (va.type === AdresseType.SLACK) return <Block>Slack: <StyledLink href={slackLink(va.adresse)}>#{va.slackChannel?.name || va.adresse}</StyledLink></Block>
          if (va.type === AdresseType.SLACK_USER) return <Block>Slack: <StyledLink href={slackUserLink(va.adresse)}>{va.slackUser?.name || va.adresse}</StyledLink></Block>
          return <Block>Epost: <StyledLink href={`mailto:${va.adresse}`}>{va.adresse}</StyledLink></Block>
        }
      )}/>
    </Label>
    <Label title='Avdeling'>{krav.avdeling?.shortName}</Label>
    <Label title='Underavdeling'><ObjectLink id={krav.underavdeling?.code} type={ListName.UNDERAVDELING}>{krav.underavdeling?.shortName}</ObjectLink></Label>
  </>
)
