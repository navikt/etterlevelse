import { DotTags } from '@/components/common/dotTags/dotTags'
import { ExternalLink } from '@/components/common/externalLink/externalLink'
import { LabelAboveContent } from '@/components/common/labelAboveContent/labelAboveContent'
import { Markdown } from '@/components/common/markdown/markdown'
import { LovViewList } from '@/components/lov/lov'
import { IBegrep } from '@/constants/behandlingskatalogen/behandlingskatalogConstants'
import { EListName } from '@/constants/kodeverk/kodeverkConstants'
import { IKrav, IKravVersjon, TKravQL } from '@/constants/krav/kravConstants'
import { EAdresseType } from '@/constants/teamkatalogen/varslingsadresse/varslingsadresseConstants'
import { kravUrl } from '@/routes/krav/kravRoutes'
import { user } from '@/services/user/userService'
import { slackLink, slackUserLink, termUrl } from '@/util/config/config'
import { BodyShort, Label } from '@navikt/ds-react'
import moment from 'moment'
import { FunctionComponent, ReactNode } from 'react'

type TLabelWrapperProp = { children: ReactNode }

const LabelWrapper: FunctionComponent<TLabelWrapperProp> = ({ children }) => (
  <div className='mb-4'>{children}</div>
)

type TAllInfoProps = {
  krav: TKravQL
  alleKravVersjoner: IKravVersjon[]
  noLastModifiedDate?: boolean
  header?: boolean
}

export const AllInfo: FunctionComponent<TAllInfoProps> = ({
  krav,
  alleKravVersjoner,
  noLastModifiedDate,
  header,
}) => (
  <div>
    {krav.dokumentasjon.length > 0 && (
      <LabelWrapper>
        <LabelAboveContent header={header} title='Kilder'>
          <DotTags items={krav.dokumentasjon} markdown inColumn />
        </LabelAboveContent>
      </LabelWrapper>
    )}

    <LabelWrapper>
      <LabelAboveContent header={header} title='Begreper'>
        {krav.begreper &&
          krav.begreper.length !== 0 &&
          krav.begreper.map((begrep, index) => (
            <BegrepView key={'begrep_' + index} begrep={begrep} />
          ))}
      </LabelAboveContent>
    </LabelWrapper>

    <LabelWrapper>
      <LabelAboveContent header={header} title='Relasjoner til andre krav'>
        {krav.kravRelasjoner.map((kravRelasjon, index) => (
          <KravRelasjonView key={'kravRelasjon' + index} kravRelasjon={kravRelasjon} />
        ))}
      </LabelAboveContent>
    </LabelWrapper>

    <LabelWrapper>
      <LabelAboveContent header={header} title='Kravet er relevant for'>
        <DotTags list={EListName.RELEVANS} codes={krav.relevansFor} inColumn />
      </LabelAboveContent>
    </LabelWrapper>

    {alleKravVersjoner.length !== 0 && krav.kravVersjon > 1 && (
      <LabelWrapper>
        <LabelAboveContent title='Tidligere versjoner' header={header}>
          {alleKravVersjoner.map((kravRelasjon, index) => {
            if (
              kravRelasjon.kravVersjon &&
              parseInt(kravRelasjon.kravVersjon.toString()) < krav.kravVersjon
            ) {
              return (
                <BodyShort key={`kravVersjon_list_${index}`} className='break-words'>
                  <ExternalLink
                    href={`${kravUrl}/${kravRelasjon.kravNummer}/${kravRelasjon.kravVersjon}`}
                  >{`K${kravRelasjon.kravNummer}.${kravRelasjon.kravVersjon}`}</ExternalLink>
                </BodyShort>
              )
            }
            return null
          })}
          {krav.versjonEndringer && (
            <div className='my-8'>
              <Label size='medium'>Dette er nytt fra forrige versjon</Label>
              <Markdown source={krav.versjonEndringer} />
            </div>
          )}
        </LabelAboveContent>
      </LabelWrapper>
    )}

    {krav.regelverk.length && (
      <LabelWrapper>
        <LabelAboveContent header={header} title='Regelverk'>
          <LovViewList regelverkListe={krav.regelverk} />
        </LabelAboveContent>
      </LabelWrapper>
    )}

    <LabelWrapper>
      <LabelAboveContent header={header} title='Ansvarlig'>
        {krav.underavdeling?.shortName}
      </LabelAboveContent>
    </LabelWrapper>

    <LabelWrapper>
      <LabelAboveContent header={header} title='Varslingsadresser'>
        {krav.varslingsadresserQl.map((varslingsaddresse, index) => {
          if (varslingsaddresse.type === EAdresseType.SLACK)
            return (
              <div className='flex mb-2' key={'kravVarsling_list_SLACK_' + index}>
                <div className='mr-1'>Slack:</div>
                <ExternalLink href={slackLink(varslingsaddresse.adresse)}>{`#${
                  varslingsaddresse.slackChannel?.name || varslingsaddresse.adresse
                }`}</ExternalLink>
              </div>
            )
          if (varslingsaddresse.type === EAdresseType.SLACK_USER)
            return (
              <div className='flex mb-2' key={`kravVarsling_list_SLACK_USER_${index}`}>
                <div className='mr-1'>Slack:</div>
                <ExternalLink href={slackUserLink(varslingsaddresse.adresse)}>{`${
                  varslingsaddresse.slackUser?.name || varslingsaddresse.adresse
                }`}</ExternalLink>
              </div>
            )
          return (
            <div className='flex mb-2' key={`kravVarsling_list_EMAIL_${index}`}>
              <div className='mr-1'>Epost:</div>
              <ExternalLink href={`mailto:${varslingsaddresse.adresse}`} openOnSamePage>
                {varslingsaddresse.adresse}
              </ExternalLink>
            </div>
          )
        })}
      </LabelAboveContent>
    </LabelWrapper>

    {!noLastModifiedDate && (
      <div>
        <BodyShort size='small'>
          Sist endret: {moment(krav.changeStamp.lastModifiedDate).format('LL')}{' '}
          {user.isAdmin() || user.isKraveier()
            ? `av ${krav.changeStamp.lastModifiedBy.split(' - ')[1]}`
            : ''}
        </BodyShort>
      </div>
    )}
  </div>
)

type TBegrepViewProps = { begrep: IBegrep }

const BegrepView: FunctionComponent<TBegrepViewProps> = ({ begrep }) => (
  <div className='max-w-2xl'>
    <BodyShort className='break-words'>
      <ExternalLink href={termUrl(begrep.id)}>{begrep.navn}</ExternalLink>
      {/* {' '}
      - {begrep.beskrivelse} */}
    </BodyShort>
  </div>
)

type TKravRelasjonViewProps = { kravRelasjon: Partial<IKrav> }

const KravRelasjonView: FunctionComponent<TKravRelasjonViewProps> = ({ kravRelasjon }) => (
  <div className='max-w-2xl'>
    <BodyShort className='break-words'>
      <ExternalLink
        href={`${kravUrl}/${kravRelasjon.id}`}
      >{`K${kravRelasjon.kravNummer}.${kravRelasjon.kravVersjon}`}</ExternalLink>{' '}
      - {kravRelasjon.navn}
    </BodyShort>
  </div>
)
