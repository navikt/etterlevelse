import { AdresseType, Begrep, Krav, KravQL, KravVersjon } from '../../constants'
import React from 'react'
import moment from 'moment'
import { DotTag, DotTags } from '../common/DotTag'
import { ListName } from '../../services/Codelist'
import { CustomLabel, LabelAboveContent } from '../common/PropertyLabel'
import { ExternalLink } from '../common/RouteLink'
import { slackLink, slackUserLink, termUrl } from '../../util/config'
import { user } from '../../services/User'
import { LovViewList } from '../Lov'
import { SuksesskriterieCard } from './Suksesskriterie'
import { Markdown } from '../common/Markdown'
import ExpiredAlert from './ExpiredAlert'
import SidePanel from './SidePanel'
import { BodyShort, Box, Label } from '@navikt/ds-react'

const LabelWrapper = ({ children }: { children: React.ReactNode }) => <div className="mb-4">{children}</div>

export const ViewKrav = ({ krav, alleKravVersjoner }: { krav: KravQL; alleKravVersjoner: KravVersjon[] }) => {
  return (
    <div>
      <div className="flex w-full">
        <div className="w-full">
          {krav.suksesskriterier.map((s, i) => (
            <SuksesskriterieCard key={s.id} suksesskriterie={s} num={i + 1} totalt={krav.suksesskriterier.length} />
          ))}
          {/* {<AllInfo krav={krav} alleKravVersjoner={alleKravVersjoner} />} */}
        </div>
        {
          //deactivate side panel, waiting for feedback from design
        }
        {/* <div className={"block fixed right-0"}>
        <SidePanel />
      </div> */}
      </div>
    </div>
  )
}

export const AllInfo = ({ krav, alleKravVersjoner }: { krav: KravQL; alleKravVersjoner: KravVersjon[] }) => {
  const hasKravExpired = () => {
    return krav && krav.kravVersjon < parseInt(alleKravVersjoner[0].kravVersjon.toString())
  }

  return (
    <div>
      <LabelWrapper>
        <LabelAboveContent header title="Kilder">
          <DotTags items={krav.dokumentasjon} markdown inColumn />
        </LabelAboveContent>
      </LabelWrapper>

      {user.isKraveier() && (
        <LabelWrapper>
          <LabelAboveContent header title="Etiketter">
            {krav.tagger.join(', ')}
          </LabelAboveContent>
        </LabelWrapper>
      )}

      <LabelWrapper>
        <LabelAboveContent header title="Relevante implementasjoner" markdown={krav.implementasjoner} />
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
              <div className="my-8">
                <Label size="medium">Dette er nytt fra forrige versjon</Label>
                <Markdown source={krav.versjonEndringer} />
              </div>
            )}
          </LabelAboveContent>
        </LabelWrapper>
      )}

      {hasKravExpired() && (
        <div className="my-8">
          <ExpiredAlert alleKravVersjoner={alleKravVersjoner} statusName={krav.status} />
        </div>
      )}

      <LabelWrapper>
        <LabelAboveContent header title="Ansvarlig">
          {krav.underavdeling?.shortName}
        </LabelAboveContent>
      </LabelWrapper>

      {krav.regelverk.length && (
        <LabelWrapper>
          <LabelAboveContent header title="Regelverk">
            <LovViewList regelverk={krav.regelverk} />
          </LabelAboveContent>
        </LabelWrapper>
      )}

      {user.isKraveier() && (
        <LabelWrapper>
          <LabelAboveContent header title="Varslingsadresser">
            {krav.varslingsadresser.map((va, i) => {
              if (va.type === AdresseType.SLACK)
                return (
                  <div className="flex mb-2" key={'kravVarsling_list_SLACK_' + i}>
                    <div className="mr-1">Slack:</div>
                    <ExternalLink href={slackLink(va.adresse)}>{`#${va.slackChannel?.name || va.adresse}`}</ExternalLink>
                  </div>
                )
              if (va.type === AdresseType.SLACK_USER)
                return (
                  <div className="flex mb-2" key={'kravVarsling_list_SLACK_USER_' + i}>
                    <div className="mr-1">Slack:</div>
                    <ExternalLink href={slackUserLink(va.adresse)}>{`${va.slackUser?.name || va.adresse}`}</ExternalLink>
                  </div>
                )
              return (
                <div className="flex mb-2" key={'kravVarsling_list_EMAIL_' + i}>
                  <div className="mr-1">Epost:</div>
                  <ExternalLink href={`mailto:${va.adresse}`} openOnSamePage>
                    {va.adresse}
                  </ExternalLink>
                </div>
              )
            })}
          </LabelAboveContent>
        </LabelWrapper>
      )}

      <div>
        <BodyShort size="small">
          Sist endret: {moment(krav.changeStamp.lastModifiedDate).format('ll')} {user.isAdmin() || user.isKraveier() ? 'av ' + krav.changeStamp.lastModifiedBy.split(' - ')[1] : ''}
        </BodyShort>
      </div>
    </div>
  )
}

const BegrepView = ({ begrep }: { begrep: Begrep }) => (
  <div className="max-w-2xl">
    <DotTag>
      <ExternalLink href={termUrl(begrep.id)} label={'Link begrepskatalogen'}>
        {begrep.navn}
      </ExternalLink>
      {/* {' '}
      - {begrep.beskrivelse} */}
    </DotTag>
  </div>
)

const KravRelasjonView = ({ kravRelasjon }: { kravRelasjon: Partial<Krav> }) => (
  <div className="max-w-2xl">
    <DotTag>
      <ExternalLink href={`/krav/${kravRelasjon.id}`} label={'Link til krav relasjon'}>
        {`K${kravRelasjon.kravNummer}.${kravRelasjon.kravVersjon}`}
      </ExternalLink>{' '}
      - {kravRelasjon.navn}
    </DotTag>
  </div>
)
