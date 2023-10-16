import { AdresseType, Begrep, Krav, KravQL, KravVersjon } from '../../constants'
import { Block, Responsive } from 'baseui/block'
import React from 'react'
import { theme } from '../../util'
import moment from 'moment'
import { DotTag, DotTags } from '../common/DotTag'
import { ListName } from '../../services/Codelist'
import { Label, LabelAboveContent } from '../common/PropertyLabel'
import { ExternalLink } from '../common/RouteLink'
import { slackLink, slackUserLink, termUrl } from '../../util/config'
import { user } from '../../services/User'
import { LovViewList } from '../Lov'
import { SuksesskriterieCard } from './Suksesskriterie'
import { LabelSmall, ParagraphMedium } from 'baseui/typography'
import { Markdown } from '../common/Markdown'
import ExpiredAlert from './ExpiredAlert'
import SidePanel from './SidePanel'

const LabelWrapper = ({ children }: { children: React.ReactNode }) => (
  <Block marginTop="48px" marginBottom="48px">
    {children}
  </Block>
)

const responsiveView: Responsive<any> = ['block', 'block', 'block', 'flex', 'flex', 'flex']
const labelMargin = '24px'

export const ViewKrav = ({ krav, alleKravVersjoner }: { krav: KravQL; alleKravVersjoner: KravVersjon[] }) => {
  return (
    <Block display="flex" width="100%">
      <Block width="100%">
        {krav.suksesskriterier.map((s, i) => (
          <SuksesskriterieCard key={s.id} suksesskriterie={s} num={i + 1} totalt={krav.suksesskriterier.length} />
        ))}
        {/*  <LabelAboveContent header title='Beskrivelse' markdown={krav.beskrivelse} /> */}
        {<AllInfo krav={krav} alleKravVersjoner={alleKravVersjoner} />}
      </Block>
      <Block display="block" position={'fixed'} right={'-211px'}>
        <SidePanel />
      </Block>
    </Block>
  )
}

export const AllInfo = ({ krav, alleKravVersjoner }: { krav: KravQL; alleKravVersjoner: KravVersjon[] }) => {
  const hasKravExpired = () => {
    return krav && krav.kravVersjon < parseInt(alleKravVersjoner[0].kravVersjon.toString())
  }

  return (
    <>
      {/* <LabelWrapper>
      <LabelAboveContent header title='Utfyllende beskrivelse' markdown={krav.utdypendeBeskrivelse} />
    </LabelWrapper> */}

      {/* <LabelWrapper>
      <LabelAboveContent header title='Endringer fra forrige versjon' markdown={krav.versjonEndringer} />
    </LabelWrapper> */}

      <LabelWrapper>
        <LabelAboveContent header title="Kilder">
          <DotTags items={krav.dokumentasjon} markdown inColumn />
        </LabelAboveContent>
      </LabelWrapper>

      {/* <LabelWrapper>
      <LabelAboveContent header title='Rettskilder' markdown={krav.rettskilder} />
    </LabelWrapper> */}

      {user.isKraveier() && (
        <LabelWrapper>
          <LabelAboveContent header title="Etiketter">
            {krav.tagger.join(', ')}
          </LabelAboveContent>
        </LabelWrapper>
      )}

      <LabelWrapper>
        <LabelAboveContent header title="Relevante implementasjoner" markdown={krav.implementasjoner} maxWidth="650px" />
      </LabelWrapper>

      <LabelWrapper>
        <LabelAboveContent header title="Begreper">
          {krav.begreper.map((b, i) => (
            <BegrepView key={'begrep_' + i} begrep={b} />
          ))}
        </LabelAboveContent>
      </LabelWrapper>

      <LabelWrapper>
        <LabelAboveContent header title="Relasjoner til andre krav">
          {krav.kravRelasjoner.map((kr, i) => (
            <KravRelasjonView key={'kravRelasjon' + i} kravRelasjon={kr} />
          ))}
        </LabelAboveContent>
      </LabelWrapper>

      {/* <LabelWrapper>
        <LabelAboveContent header title="Relevant for følgende virkemiddel">
          {krav.virkemidler.length > 0 ? krav.virkemidler.map((v, i) => <VirkemiddelView key={'virkemiddel' + i} virkemiddel={v} />) : 'Ikke angitt'}
        </LabelAboveContent>
      </LabelWrapper> */}

      {/* <LabelAboveContent title='Avdeling'>{krav.avdeling?.shortName}</LabelAboveContent> */}

      <LabelWrapper>
        <LabelAboveContent header title="Kravet er relevant for">
          <DotTags list={ListName.RELEVANS} codes={krav.relevansFor} inColumn />
        </LabelAboveContent>
      </LabelWrapper>

      {alleKravVersjoner.length !== 0 && krav.kravVersjon > 1 && (
        <LabelWrapper>
          <LabelAboveContent title={'Tidligere versjoner'} header>
            {alleKravVersjoner.map((k, i) => {
              if (k.kravVersjon && parseInt(k.kravVersjon.toString()) < krav.kravVersjon) {
                return (
                  <DotTag key={'kravVersjon_list_' + i}>
                    <ExternalLink href={'/krav/' + k.kravNummer + '/' + k.kravVersjon}>{`K${k.kravNummer}.${k.kravVersjon}`}</ExternalLink>
                  </DotTag>
                )
              }
              return null
            })}
            {krav.versjonEndringer && (
              <Block marginTop={theme.sizing.scale900} marginBottom={theme.sizing.scale1600}>
                <LabelSmall>Dette er nytt fra forrige versjon</LabelSmall>
                <Markdown source={krav.versjonEndringer} />
              </Block>
            )}
          </LabelAboveContent>
        </LabelWrapper>
      )}

      {hasKravExpired() && (
        <Block $style={{ marginTop: theme.sizing.scale900, marginBottom: theme.sizing.scale1200 }}>
          <ExpiredAlert alleKravVersjoner={alleKravVersjoner} statusName={krav.status} />
        </Block>
      )}

      <Block backgroundColor="#F1F1F1" padding="32px">
        <Block marginBottom={labelMargin}>
          <Label display={responsiveView} title="Ansvarlig" compact>
            {krav.underavdeling?.shortName}
          </Label>
        </Block>

        <Block marginBottom={labelMargin}>
          <Label display={responsiveView} title="Regelverk" hide={!krav.regelverk.length} compact>
            <LovViewList regelverk={krav.regelverk} />
          </Label>
        </Block>

        <Block marginBottom={labelMargin}>
          <Label display={responsiveView} title="Varslingsadresser" hide={!user.isKraveier()} compact>
            {krav.varslingsadresser.map((va, i) => {
              const marginBottom = '8px'
              if (va.type === AdresseType.SLACK)
                return (
                  <Block marginBottom={marginBottom} key={'kravVarsling_list_SLACK_' + i} display="flex">
                    <Block marginRight="4px">Slack:</Block>
                    <ExternalLink href={slackLink(va.adresse)}>{`#${va.slackChannel?.name || va.adresse}`}</ExternalLink>
                  </Block>
                )
              if (va.type === AdresseType.SLACK_USER)
                return (
                  <Block marginBottom={marginBottom} key={'kravVarsling_list_SLACK_USER_' + i} display="flex">
                    <Block marginRight="4px">Slack:</Block>
                    <ExternalLink href={slackUserLink(va.adresse)}>{`${va.slackUser?.name || va.adresse}`}</ExternalLink>
                  </Block>
                )
              return (
                <Block marginBottom={marginBottom} key={'kravVarsling_list_EMAIL_' + i} display="flex">
                  <Block marginRight="4px">Epost:</Block>
                  <ExternalLink href={`mailto:${va.adresse}`} openOnSamePage>
                    {va.adresse}
                  </ExternalLink>
                </Block>
              )
            })}
          </Label>
        </Block>

        {/* <Block marginBottom={labelMargin}>
          <Label title="Status" display={responsiveView} compact>
            {kravStatus(krav.status)}
          </Label>
        </Block> */}

        {/* {krav.periode?.start && <Label title='Gyldig fom'>{formatDate(krav.periode?.start)}</Label>}
      {krav.periode?.slutt && <Label title='Gyldig tom'>{formatDate(krav.periode?.slutt)}</Label>} */}
      </Block>

      <Block>
        <ParagraphMedium>
          Sist endret: {moment(krav.changeStamp.lastModifiedDate).format('ll')} {user.isAdmin() || user.isKraveier() ? 'av ' + krav.changeStamp.lastModifiedBy.split(' - ')[1] : ''}
        </ParagraphMedium>
      </Block>
    </>
  )
}

const BegrepView = ({ begrep }: { begrep: Begrep }) => (
  <Block maxWidth={'650px'}>
    <DotTag>
      <ExternalLink href={termUrl(begrep.id)} label={'Link begrepskatalogen'}>
        {begrep.navn}
      </ExternalLink>{' '}
      - {begrep.beskrivelse}
    </DotTag>
  </Block>
)

const KravRelasjonView = ({ kravRelasjon }: { kravRelasjon: Partial<Krav> }) => (
  <Block maxWidth={'650px'}>
    <DotTag>
      <ExternalLink href={`/krav/${kravRelasjon.id}`} label={'Link til krav relasjon'}>
        {`K${kravRelasjon.kravNummer}.${kravRelasjon.kravVersjon}`}
      </ExternalLink>{' '}
      - {kravRelasjon.navn}
    </DotTag>
  </Block>
)
