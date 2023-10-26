import {AdresseType, Begrep, Krav, KravQL, KravVersjon} from '../../constants'
import {Block, Responsive} from 'baseui/block'
import React from 'react'
import moment from 'moment'
import {DotTag, DotTags} from '../common/DotTag'
import {ListName} from '../../services/Codelist'
import {CustomLabel} from '../common/PropertyLabel'
import {ExternalLink} from '../common/RouteLink'
import {slackLink, slackUserLink, termUrl} from '../../util/config'
import {user} from '../../services/User'
import {LovViewList} from '../Lov'
import {SuksesskriterieCard} from './Suksesskriterie'
import {Markdown} from '../common/Markdown'
import ExpiredAlert from './ExpiredAlert'
import SidePanel from './SidePanel'
import {BodyShort, Box, Heading, Label} from "@navikt/ds-react";

const LabelWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className={"my-12"}>
    {children}
  </div>
)

const responsiveView: Responsive<any> = ['block', 'block', 'block', 'flex', 'flex', 'flex']

export const ViewKrav = ({ krav, alleKravVersjoner }: { krav: KravQL; alleKravVersjoner: KravVersjon[] }) => {
  return (
    <div className={"flex w-full"}>
      <div className={"w-full"}>
        {krav.suksesskriterier.map((s, i) => (
          <SuksesskriterieCard key={s.id} suksesskriterie={s} num={i + 1} totalt={krav.suksesskriterier.length} />
        ))}
        {/*  <LabelAboveContent header title='Beskrivelse' markdown={krav.beskrivelse} /> */}
        {<AllInfo krav={krav} alleKravVersjoner={alleKravVersjoner} />}
      </div>
      <div className={"block fixed right-0"}>
        <SidePanel />
      </div>
    </div>
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
        <Heading size={"medium"}>
          Kilder
        </Heading>
        <Label>
          <DotTags items={krav.dokumentasjon} markdown inColumn />
        </Label>
      </LabelWrapper>

      {/* <LabelWrapper>
      <LabelAboveContent header title='Rettskilder' markdown={krav.rettskilder} />
    </LabelWrapper> */}

      {user.isKraveier() && (
        <LabelWrapper>
          <Heading size={"medium"}>
            Etiketter
          </Heading>
            {krav.tagger.join(', ')}
        </LabelWrapper>
      )}

      <LabelWrapper>
        {/*<LabelAboveContent header title="" markdown={krav.implementasjoner} maxWidth="650px" />*/}
        <Heading size={"medium"}>
          Relevante implementasjoner
        </Heading>
        <Markdown source={krav.implementasjoner}/>
      </LabelWrapper>

      <LabelWrapper>
        <Heading size={"medium"}>Begreper</Heading>
          {krav.begreper.map((b, i) => (
            <BegrepView key={'begrep_' + i} begrep={b} />
          ))}
      </LabelWrapper>

      <LabelWrapper>
        <Heading size={"medium"}>
          Relasjoner til andre krav
        </Heading>
        {/*<LabelAboveContent header title="">*/}
          {krav.kravRelasjoner.map((kr, i) => (
            <KravRelasjonView key={'kravRelasjon' + i} kravRelasjon={kr} />
          ))}
        {/*</LabelAboveContent>*/}
      </LabelWrapper>

      {/* <LabelWrapper>
        <LabelAboveContent header title="Relevant for følgende virkemiddel">
          {krav.virkemidler.length > 0 ? krav.virkemidler.map((v, i) => <VirkemiddelView key={'virkemiddel' + i} virkemiddel={v} />) : 'Ikke angitt'}
        </LabelAboveContent>
      </LabelWrapper> */}

      {/* <LabelAboveContent title='Avdeling'>{krav.avdeling?.shortName}</LabelAboveContent> */}

      <LabelWrapper>
        <Heading size={"medium"}>
          Kravet er relevant for
        </Heading>
        {/*<LabelAboveContent header title="">*/}
          <DotTags list={ListName.RELEVANS} codes={krav.relevansFor} inColumn />
        {/*</LabelAboveContent>*/}
      </LabelWrapper>

      {alleKravVersjoner.length !== 0 && krav.kravVersjon > 1 && (
        <LabelWrapper>
          <Heading size={ "medium"}>Tidligere versjoner</Heading>
          {/*<LabelAboveContent title={''} header>*/}
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
              <div className={"my-8"}>
                <Label>Dette er nytt fra forrige versjon</Label>
                <Markdown source={krav.versjonEndringer} />
              </div>
            )}
          {/*</LabelAboveContent>*/}
        </LabelWrapper>
      )}

      {hasKravExpired() && (
        <div className={"my-8"}>
          <ExpiredAlert alleKravVersjoner={alleKravVersjoner} statusName={krav.status} />
        </div>
      )}

      <Box className={"p-8"}>
        <div className={"mb-6"}>
          <CustomLabel display={responsiveView} title="Ansvarlig" compact>
            {krav.underavdeling?.shortName}
          </CustomLabel>
        </div>

        <div className={"mb-6"}>
          <CustomLabel display={responsiveView} title="Regelverk" hide={!krav.regelverk.length} compact>
            <LovViewList regelverk={krav.regelverk} />
          </CustomLabel>
        </div>

        <div className={"mb-6"}>
          <CustomLabel display={responsiveView} title="Varslingsadresser" hide={!user.isKraveier()} compact>
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
          </CustomLabel>
        </div>

        {/* <Block marginBottom={labelMargin}>
          <Label title="Status" display={responsiveView} compact>
            {kravStatus(krav.status)}
          </Label>
        </Block> */}

        {/* {krav.periode?.start && <Label title='Gyldig fom'>{formatDate(krav.periode?.start)}</Label>}
      {krav.periode?.slutt && <Label title='Gyldig tom'>{formatDate(krav.periode?.slutt)}</Label>} */}
      </Box>

      <div>
        <BodyShort size={"small"}>
          Sist endret: {moment(krav.changeStamp.lastModifiedDate).format('ll')} {user.isAdmin() || user.isKraveier() ? 'av ' + krav.changeStamp.lastModifiedBy.split(' - ')[1] : ''}
        </BodyShort>
      </div>
    </>
  )
}

const BegrepView = ({ begrep }: { begrep: Begrep }) => (
  <div className={"max-w-2xl"}>
    <DotTag>
      <ExternalLink href={termUrl(begrep.id)} label={'Link begrepskatalogen'}>
        {begrep.navn}
      </ExternalLink>{' '}
      - {begrep.beskrivelse}
    </DotTag>
  </div>
)

const KravRelasjonView = ({ kravRelasjon }: { kravRelasjon: Partial<Krav> }) => (
  <div className={"max-w-2xl"}>
    <DotTag>
      <ExternalLink href={`/krav/${kravRelasjon.id}`} label={'Link til krav relasjon'}>
        {`K${kravRelasjon.kravNummer}.${kravRelasjon.kravVersjon}`}
      </ExternalLink>{' '}
      - {kravRelasjon.navn}
    </DotTag>
  </div>
)
