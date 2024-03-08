import { BodyShort, Label } from '@navikt/ds-react'
import moment from 'moment'
import React from 'react'
import { EAdresseType, IBegrep, IKrav, IKravVersjon, TKravQL } from '../../constants'
import { EListName } from '../../services/Codelist'
import { user } from '../../services/User'
import { slackLink, slackUserLink, termUrl } from '../../util/config'
import { LovViewList } from '../Lov'
import { DotTags } from '../common/DotTag'
import { Markdown } from '../common/Markdown'
import { LabelAboveContent } from '../common/PropertyLabel'
import { ExternalLink } from '../common/RouteLink'
import { SuksesskriterieCard } from './Suksesskriterie'

const LabelWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-4">{children}</div>
)

export const ViewKrav = ({ krav }: { krav: TKravQL }) => {
  return (
    <div>
      <div className="w-full">
        {krav.suksesskriterier.map((suksesskriterium, index) => (
          <SuksesskriterieCard
            key={suksesskriterium.id}
            suksesskriterie={suksesskriterium}
            num={index + 1}
            totalt={krav.suksesskriterier.length}
          />
        ))}
        {/* {<AllInfo krav={krav} alleKravVersjoner={alleKravVersjoner} />} */}

        <BodyShort size="small" className="mt-6">
          Sist endret: {moment(krav.changeStamp.lastModifiedDate).format('ll')}{' '}
          {user.isAdmin() || user.isKraveier()
            ? 'av ' + krav.changeStamp.lastModifiedBy.split(' - ')[1]
            : ''}
        </BodyShort>
      </div>
    </div>
  )
}

export const AllInfo = ({
  krav,
  alleKravVersjoner,
  noLastModifiedDate,
  header,
}: {
  krav: TKravQL
  alleKravVersjoner: IKravVersjon[]
  noLastModifiedDate?: boolean
  header?: boolean
}) => {
  return (
    <div>
      {krav.dokumentasjon.length > 0 && (
        <LabelWrapper>
          <LabelAboveContent header={header} title="Kilder">
            <DotTags items={krav.dokumentasjon} markdown inColumn />
          </LabelAboveContent>
        </LabelWrapper>
      )}

      <LabelWrapper>
        <LabelAboveContent header={header} title="Begreper">
          {krav.begreper.map((begrep, index) => (
            <BegrepView key={'begrep_' + index} begrep={begrep} />
          ))}
        </LabelAboveContent>
      </LabelWrapper>

      <LabelWrapper>
        <LabelAboveContent header={header} title="Relasjoner til andre krav">
          {krav.kravRelasjoner.map((kravRelasjon, index) => (
            <KravRelasjonView key={'kravRelasjon' + index} kravRelasjon={kravRelasjon} />
          ))}
        </LabelAboveContent>
      </LabelWrapper>

      <LabelWrapper>
        <LabelAboveContent header={header} title="Kravet er relevant for">
          <DotTags list={EListName.RELEVANS} codes={krav.relevansFor} inColumn />
        </LabelAboveContent>
      </LabelWrapper>

      {alleKravVersjoner.length !== 0 && krav.kravVersjon > 1 && (
        <LabelWrapper>
          <LabelAboveContent title={'Tidligere versjoner'} header={header}>
            {alleKravVersjoner.map((kravRelasjon, index) => {
              if (
                kravRelasjon.kravVersjon &&
                parseInt(kravRelasjon.kravVersjon.toString()) < krav.kravVersjon
              ) {
                return (
                  <BodyShort key={'kravVersjon_list_' + index} className={'break-words'}>
                    <ExternalLink
                      href={'/krav/' + kravRelasjon.kravNummer + '/' + kravRelasjon.kravVersjon}
                    >{`K${kravRelasjon.kravNummer}.${kravRelasjon.kravVersjon}`}</ExternalLink>
                  </BodyShort>
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

      {krav.regelverk.length && (
        <LabelWrapper>
          <LabelAboveContent header={header} title="Regelverk">
            <LovViewList regelverkListe={krav.regelverk} />
          </LabelAboveContent>
        </LabelWrapper>
      )}

      <LabelWrapper>
        <LabelAboveContent header={header} title="Ansvarlig">
          {krav.underavdeling?.shortName}
        </LabelAboveContent>
      </LabelWrapper>

      {user.isKraveier() && (
        <LabelWrapper>
          <LabelAboveContent header={header} title="Varslingsadresser">
            {krav.varslingsadresser.map((varslingsaddresse, index) => {
              if (varslingsaddresse.type === EAdresseType.SLACK)
                return (
                  <div className="flex mb-2" key={'kravVarsling_list_SLACK_' + index}>
                    <div className="mr-1">Slack:</div>
                    <ExternalLink href={slackLink(varslingsaddresse.adresse)}>{`#${
                      varslingsaddresse.slackChannel?.name || varslingsaddresse.adresse
                    }`}</ExternalLink>
                  </div>
                )
              if (varslingsaddresse.type === EAdresseType.SLACK_USER)
                return (
                  <div className="flex mb-2" key={'kravVarsling_list_SLACK_USER_' + index}>
                    <div className="mr-1">Slack:</div>
                    <ExternalLink href={slackUserLink(varslingsaddresse.adresse)}>{`${
                      varslingsaddresse.slackUser?.name || varslingsaddresse.adresse
                    }`}</ExternalLink>
                  </div>
                )
              return (
                <div className="flex mb-2" key={'kravVarsling_list_EMAIL_' + index}>
                  <div className="mr-1">Epost:</div>
                  <ExternalLink href={`mailto:${varslingsaddresse.adresse}`} openOnSamePage>
                    {varslingsaddresse.adresse}
                  </ExternalLink>
                </div>
              )
            })}
          </LabelAboveContent>
        </LabelWrapper>
      )}

      {!noLastModifiedDate && (
        <div>
          <BodyShort size="small">
            Sist endret: {moment(krav.changeStamp.lastModifiedDate).format('ll')}{' '}
            {user.isAdmin() || user.isKraveier()
              ? 'av ' + krav.changeStamp.lastModifiedBy.split(' - ')[1]
              : ''}
          </BodyShort>
        </div>
      )}
    </div>
  )
}

const BegrepView = ({ begrep }: { begrep: IBegrep }) => (
  <div className="max-w-2xl">
    <BodyShort className="break-words">
      <ExternalLink href={termUrl(begrep.id)}>{begrep.navn}</ExternalLink>
      {/* {' '}
      - {begrep.beskrivelse} */}
    </BodyShort>
  </div>
)

const KravRelasjonView = ({ kravRelasjon }: { kravRelasjon: Partial<IKrav> }) => (
  <div className="max-w-2xl">
    <BodyShort className="break-words">
      <ExternalLink
        href={`/krav/${kravRelasjon.id}`}
      >{`K${kravRelasjon.kravNummer}.${kravRelasjon.kravVersjon}`}</ExternalLink>{' '}
      - {kravRelasjon.navn}
    </BodyShort>
  </div>
)
