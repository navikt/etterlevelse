import { AdresseType, Begrep, KravQL } from '../../constants'
import { Block } from 'baseui/block'
import React, { useState } from 'react'
import { kravStatus } from '../../pages/KravPage'
import { theme } from '../../util'
import moment from 'moment'
import Button from '../common/Button'
import { DotTag, DotTags } from '../common/DotTag'
import { ListName } from '../../services/Codelist'
import { Label } from '../common/PropertyLabel'
import { ExternalLink, ObjectLink } from '../common/RouteLink'
import { StyledLink } from 'baseui/link'
import { slackLink, slackUserLink, termUrl } from '../../util/config'
import { user } from '../../services/User'
import { LovViewList } from '../Lov'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'
import { Tabs, Tab } from "baseui/tabs";



const formatDate = (date?: string) => date && moment(date).format('ll')

export const ViewKrav = ({ krav }: { krav: KravQL }) => {
  const [expand, setExpand] = useState(false)
  const [activeKey, setActiveKey] = useState('0')

  return (
    <Block width='100%'>
      <Block paddingLeft='40px' paddingRight='40px' backgroundColor='#CCD9D7' justifyContent='center' display='flex'>
        <Block marginBottom='80px' marginTop='80px' width='600px'>
          <Label title='' markdown={krav.hensikt} />
        </Block>
      </Block>

      <Block display='flex' justifyContent='center'>
          <Tabs
            onChange={({ activeKey}) => {
              setActiveKey(activeKey.toString())
            }}
            activeKey={activeKey}
          >
            <Tab title="Tab Link 1">Content 1</Tab>
            <Tab title="Tab Link 2">Content 2</Tab>
            <Tab title="Tab Link 3">Content 3</Tab>
          </Tabs>
        </Block>

      <Label title='Suksesskriterier' markdown={krav.suksesskriterier.map(s => `${s.id}: ${s.navn}`)} vertical />
      <Label title='Beskrivelse' markdown={krav.beskrivelse} />

      <Block height={theme.sizing.scale800} />

      {expand && <AllInfo krav={krav} />}
      {!expand && <MediumInfo krav={krav} />}
      <Block display='flex' justifyContent='flex-end'>
        <Button onClick={() => setExpand(!expand)}>{`${expand ? 'Skjul' : 'Vis'} detaljer`}</Button>
      </Block>
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
    <Label title='Utfyllende beskrivelse' markdown={krav.utdypendeBeskrivelse} />
    <Label title='Endringer fra forrige versjon' markdown={krav.versjonEndringer} />
    <Label title='Dokumentasjon' markdown={krav.dokumentasjon} />
    <Label title='Regelverk' hide={!krav.regelverk.length}>
      <LovViewList regelverk={krav.regelverk} />
    </Label>
    <Label title='Rettskilder' markdown={krav.rettskilder} />

    <Label title='Tagger'>{krav.tagger.join(', ')}</Label>
    <Label title='Kravet er relevant for'><DotTags list={ListName.RELEVANS} codes={krav.relevansFor} linkCodelist /></Label>
    <Label title='Relevante implementasjoner' markdown={krav.implementasjoner} />
    <Label title='Begreper'>{krav.begreper.map((b, i) => <BegrepView key={i} begrep={b} />)}</Label>

    {krav.periode?.start && <Label title='Gyldig fom'>{formatDate(krav.periode?.start)}</Label>}
    {krav.periode?.slutt && <Label title='Gyldig tom'>{formatDate(krav.periode?.slutt)}</Label>}

    <Label title='Status'>{kravStatus(krav.status)}</Label>
    <Label title='Varslingsadresser' hide={!user.isKraveier()}>
      <DotTags items={krav.varslingsadresser.map((va, i) => {
        if (va.type === AdresseType.SLACK) return <Block>Slack: <StyledLink href={slackLink(va.adresse)}>#{va.slackChannel?.name || va.adresse}</StyledLink></Block>
        if (va.type === AdresseType.SLACK_USER) return <Block>Slack: <StyledLink href={slackUserLink(va.adresse)}>{va.slackUser?.name || va.adresse}</StyledLink></Block>
        return <Block>Epost: <StyledLink href={`mailto:${va.adresse}`}>{va.adresse}</StyledLink></Block>
      }
      )} />
    </Label>
    <Label title='Avdeling'>{krav.avdeling?.shortName}</Label>
    <Label title='Underavdeling'><ObjectLink id={krav.underavdeling?.code} type={ListName.UNDERAVDELING}>{krav.underavdeling?.shortName}</ObjectLink></Label>
  </>
)

const BegrepView = ({ begrep }: { begrep: Begrep }) => (
  <DotTag>
    {begrep.navn} - {begrep.beskrivelse} <ExternalLink href={termUrl(begrep.id)} label={'Link begrepskatalogen'}>
      <FontAwesomeIcon icon={faExternalLinkAlt} />
    </ExternalLink>
  </DotTag>
)
