import { AdresseType, Begrep, KravQL } from '../../constants'
import { Block } from 'baseui/block'
import React from 'react'
import { kravStatus } from '../../pages/KravPage'
import { theme } from '../../util'
import moment from 'moment'
import { DotTag, DotTags } from '../common/DotTag'
import { ListName } from '../../services/Codelist'
import { Label, LabelAboveContent } from '../common/PropertyLabel'
import { ExternalLink, ObjectLink } from '../common/RouteLink'
import { slackLink, slackUserLink, termUrl } from '../../util/config'
import { user } from '../../services/User'
import { LovViewList } from '../Lov'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'
import { SuksesskriterieCard } from './Suksesskriterie'
import { Paragraph2 } from 'baseui/typography'
import CustomizedLink from "../common/CustomizedLink";


const formatDate = (date?: string) => date && moment(date).format('ll')

const LabelWrapper = ({ children }: { children: React.ReactNode }) => (
  <Block marginTop='48px' marginBottom='48px'>
    {children}
  </Block>
)

export const ViewKrav = ({ krav }: { krav: KravQL }) => {

  return (
    <Block width='100%'>

      {krav.suksesskriterier.map((s, i) => <SuksesskriterieCard key={s.id} suksesskriterie={s} num={i + 1} totalt={krav.suksesskriterier.length} />)}
      <Block height={theme.sizing.scale1000} />

      {/* <LabelAboveContent header title='Beskrivelse' markdown={krav.beskrivelse} /> */}

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
    {/* <LabelWrapper>
      <LabelAboveContent header title='Utfyllende beskrivelse' markdown={krav.utdypendeBeskrivelse} />
    </LabelWrapper> */}

    {/* <LabelWrapper>
      <LabelAboveContent header title='Endringer fra forrige versjon' markdown={krav.versjonEndringer} />
    </LabelWrapper> */}

    <LabelWrapper>
      <LabelAboveContent header title='Dokumentasjon' markdown={krav.dokumentasjon} />
    </LabelWrapper>

    {/* <LabelWrapper>
      <LabelAboveContent header title='Rettskilder' markdown={krav.rettskilder} />
    </LabelWrapper> */}

    {user.isKraveier() && (
      <LabelWrapper>
        <LabelAboveContent header title='Etiketter'>{krav.tagger.join(', ')}</LabelAboveContent>
      </LabelWrapper>
    )}

    <LabelWrapper>
      <LabelAboveContent header title='Relevante implementasjoner' markdown={krav.implementasjoner} />
    </LabelWrapper>

    <LabelWrapper>
      <LabelAboveContent header title='Begreper'>{krav.begreper.map((b, i) => <BegrepView key={i} begrep={b} />)}</LabelAboveContent>
    </LabelWrapper>

    {/* <LabelAboveContent title='Avdeling'>{krav.avdeling?.shortName}</LabelAboveContent> */}

    <LabelWrapper>
      <LabelAboveContent header title='Kravet er relevant for'><DotTags list={ListName.RELEVANS} codes={krav.relevansFor} linkCodelist inColumn/></LabelAboveContent>
    </LabelWrapper>

    <Block backgroundColor='#F1F1F1' padding='32px'>
      <Label title='Ansvarlig'><ObjectLink id={krav.underavdeling?.code} type={ListName.UNDERAVDELING}>{krav.underavdeling?.shortName}</ObjectLink></Label>
      <Label title='Regelverk' hide={!krav.regelverk.length}>
        <LovViewList regelverk={krav.regelverk} />
      </Label>
      <Label title='Varslingsadresser' hide={!user.isKraveier()}>
        <DotTags items={krav.varslingsadresser.map((va, i) => {
          if (va.type === AdresseType.SLACK) return <Block>Slack: <CustomizedLink href={slackLink(va.adresse)}>#{va.slackChannel?.name || va.adresse}</CustomizedLink></Block>
          if (va.type === AdresseType.SLACK_USER) return <Block>Slack: <CustomizedLink href={slackUserLink(va.adresse)}>{va.slackUser?.name || va.adresse}</CustomizedLink></Block>
          return <Block>Epost: <CustomizedLink href={`mailto:${va.adresse}`}>{va.adresse}</CustomizedLink></Block>
        }
        )} />
      </Label>
      <Label title='Status'>{kravStatus(krav.status)}</Label>
      {/* {krav.periode?.start && <Label title='Gyldig fom'>{formatDate(krav.periode?.start)}</Label>}
      {krav.periode?.slutt && <Label title='Gyldig tom'>{formatDate(krav.periode?.slutt)}</Label>} */}
    </Block>

    <Block>
      <Paragraph2>Sist endret: {moment(krav.changeStamp.lastModifiedDate).format('ll')} av {krav.changeStamp.lastModifiedBy.split(' - ')[1]}</Paragraph2>
    </Block>
  </>
)

const BegrepView = ({ begrep }: { begrep: Begrep }) => (
  <DotTag>
    <ExternalLink href={termUrl(begrep.id)} label={'Link begrepskatalogen'}>
      {begrep.navn}
    </ExternalLink> - {begrep.beskrivelse} 
  </DotTag>
)
