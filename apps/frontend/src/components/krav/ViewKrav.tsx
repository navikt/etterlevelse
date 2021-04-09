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
import { CustomizedTabs, CustomizedTab } from '../common/CustomizedTabs'
import { LabelLarge } from 'baseui/typography'



const formatDate = (date?: string) => date && moment(date).format('ll')

export const ViewKrav = ({ krav }: { krav: KravQL }) => {
  const [expand, setExpand] = useState(false)

  return (
    <Block width='100%'>
      <Block paddingLeft='40px' paddingRight='40px' backgroundColor='#CCD9D7' justifyContent='center' display='flex'>
        <Block marginBottom='80px' marginTop='80px' width='600px'>
          <Label title='' markdown={krav.hensikt} />
        </Block>
      </Block>

      <Block display='flex' justifyContent='center' width='100%'>
        <Block backgroundColor='#CCD9D7' flex={1} height='58px'/>
        <Block width='600px'>
          <CustomizedTabs>
            <CustomizedTab title={<LabelLarge>Om kravet</LabelLarge>}>
              <LabelAboveContent title='Suksesskriterier' markdown={krav.suksesskriterier.map(s => `${s.id}: ${s.navn}`)} vertical />
              <LabelAboveContent title='Beskrivelse' markdown={krav.beskrivelse} />

              <Block height={theme.sizing.scale800} />

              {expand && <AllInfo krav={krav} />}
              {!expand && <MediumInfo krav={krav} />}
              <Block display='flex' justifyContent='flex-end'>
                <Button onClick={() => setExpand(!expand)}>{`${expand ? 'Skjul' : 'Vis'} detaljer`}</Button>
              </Block>
            </CustomizedTab>
            <CustomizedTab title={<LabelLarge>Spørsmål og svar</LabelLarge>}> test 2</CustomizedTab>
            <CustomizedTab title={<LabelLarge>Eksempler på etterlevelse</LabelLarge>}> test 3</CustomizedTab>
          </CustomizedTabs>
        </Block>
        <Block backgroundColor='#CCD9D7' flex={1} height='58px'/>
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
    <LabelAboveContent title='Utfyllende beskrivelse' markdown={krav.utdypendeBeskrivelse} />
    <LabelAboveContent title='Endringer fra forrige versjon' markdown={krav.versjonEndringer} />
    <LabelAboveContent title='Dokumentasjon' markdown={krav.dokumentasjon} />
    <LabelAboveContent title='Regelverk' hide={!krav.regelverk.length}>
      <LovViewList regelverk={krav.regelverk} />
    </LabelAboveContent>
    <LabelAboveContent title='Rettskilder' markdown={krav.rettskilder} />

    <LabelAboveContent title='Tagger'>{krav.tagger.join(', ')}</LabelAboveContent>
    <LabelAboveContent title='Kravet er relevant for'><DotTags list={ListName.RELEVANS} codes={krav.relevansFor} linkCodelist /></LabelAboveContent>
    <LabelAboveContent title='Relevante implementasjoner' markdown={krav.implementasjoner} />
    <LabelAboveContent title='Begreper'>{krav.begreper.map((b, i) => <BegrepView key={i} begrep={b} />)}</LabelAboveContent>

    {krav.periode?.start && <LabelAboveContent title='Gyldig fom'>{formatDate(krav.periode?.start)}</LabelAboveContent>}
    {krav.periode?.slutt && <LabelAboveContent title='Gyldig tom'>{formatDate(krav.periode?.slutt)}</LabelAboveContent>}

    <LabelAboveContent title='Status'>{kravStatus(krav.status)}</LabelAboveContent>
    <LabelAboveContent title='Varslingsadresser' hide={!user.isKraveier()}>
      <DotTags items={krav.varslingsadresser.map((va, i) => {
        if (va.type === AdresseType.SLACK) return <Block>Slack: <StyledLink href={slackLink(va.adresse)}>#{va.slackChannel?.name || va.adresse}</StyledLink></Block>
        if (va.type === AdresseType.SLACK_USER) return <Block>Slack: <StyledLink href={slackUserLink(va.adresse)}>{va.slackUser?.name || va.adresse}</StyledLink></Block>
        return <Block>Epost: <StyledLink href={`mailto:${va.adresse}`}>{va.adresse}</StyledLink></Block>
      }
      )} />
    </LabelAboveContent>
    <LabelAboveContent title='Avdeling'>{krav.avdeling?.shortName}</LabelAboveContent>
    <LabelAboveContent title='Underavdeling'><ObjectLink id={krav.underavdeling?.code} type={ListName.UNDERAVDELING}>{krav.underavdeling?.shortName}</ObjectLink></LabelAboveContent>
  </>
)

const BegrepView = ({ begrep }: { begrep: Begrep }) => (
  <DotTag>
    {begrep.navn} - {begrep.beskrivelse} <ExternalLink href={termUrl(begrep.id)} label={'Link begrepskatalogen'}>
      <FontAwesomeIcon icon={faExternalLinkAlt} />
    </ExternalLink>
  </DotTag>
)
