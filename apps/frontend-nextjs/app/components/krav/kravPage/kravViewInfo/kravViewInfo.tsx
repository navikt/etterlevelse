'use client'

import { DotTags } from '@/components/common/dotTags/dotTags'
import { ExternalLink } from '@/components/common/externalLink/externalLink'
import { LabelAboveContent } from '@/components/common/labelAboveContent/labelAboveContent'
import { LabelWrapper } from '@/components/common/labelWrapper/labelWrapper'
import { Markdown } from '@/components/common/markdown/markdown'
import { LovViewList } from '@/components/lov/lov'
import { VarslingsadresserView } from '@/components/varslingsadresse/varslingsAddresseView'
import { EListName } from '@/constants/kodeverk/kodeverkConstants'
import { IKrav, IKravVersjon, TKravViewInfoProps } from '@/constants/krav/kravConstants'
import { UserContext } from '@/provider/user/userProvider'
import { kravUrl } from '@/routes/krav/kravRoutes'
import { termUrl } from '@/util/config/config'
import { BodyShort, Label } from '@navikt/ds-react'
import moment from 'moment'
import { FunctionComponent, useContext } from 'react'

interface IProps extends TKravViewInfoProps {
  alleKravVersjoner: IKravVersjon[]
  noLastModifiedDate?: boolean
}

export const KravViewInfo: FunctionComponent<IProps> = ({
  krav,
  alleKravVersjoner,
  noLastModifiedDate,
}) => {
  const user = useContext(UserContext)

  return (
    <div>
      {krav.dokumentasjon.length > 0 && (
        <LabelWrapper>
          <LabelAboveContent header title='Kilder'>
            <DotTags items={krav.dokumentasjon} markdown inColumn />
          </LabelAboveContent>
        </LabelWrapper>
      )}

      <LabelWrapper>
        <LabelAboveContent header title='Begreper'>
          {krav.begreper &&
            krav.begreper.length !== 0 &&
            krav.begreper.map((begrep, index) => (
              <div className='max-w-2xl' key={`begrep_${index}`}>
                <BodyShort className='break-words'>
                  <ExternalLink href={termUrl(begrep.id)}>{begrep.navn}</ExternalLink>
                </BodyShort>
              </div>
            ))}
        </LabelAboveContent>
      </LabelWrapper>

      <LabelWrapper>
        <LabelAboveContent header title='Relasjoner til andre krav'>
          {krav.kravRelasjoner.map((kravRelasjon: IKrav, index: number) => (
            <div className='max-w-2xl' key={`kravRelasjon${index}`}>
              <BodyShort className='break-words'>
                <ExternalLink
                  href={`${kravUrl}/${kravRelasjon.id}`}
                >{`K${kravRelasjon.kravNummer}.${kravRelasjon.kravVersjon}`}</ExternalLink>{' '}
                - {kravRelasjon.navn}
              </BodyShort>
            </div>
          ))}
        </LabelAboveContent>
      </LabelWrapper>

      <LabelWrapper>
        <LabelAboveContent header title='Kravet er relevant for'>
          <DotTags list={EListName.RELEVANS} codes={krav.relevansFor} inColumn />
        </LabelAboveContent>
      </LabelWrapper>

      {alleKravVersjoner.length !== 0 && krav.kravVersjon > 1 && (
        <LabelWrapper>
          <LabelAboveContent title='Tidligere versjoner' header>
            {alleKravVersjoner.map((kravRelasjon: IKravVersjon, index: number) => (
              <div key={`${kravRelasjon.kravStatus}_${index}`}>
                {kravRelasjon.kravVersjon &&
                  parseInt(kravRelasjon.kravVersjon.toString()) < krav.kravVersjon && (
                    <BodyShort key={`kravVersjon_list_${index}`} className='break-words'>
                      <ExternalLink
                        href={`${kravUrl}/${kravRelasjon.kravNummer}/${kravRelasjon.kravVersjon}`}
                      >{`K${kravRelasjon.kravNummer}.${kravRelasjon.kravVersjon}`}</ExternalLink>
                    </BodyShort>
                  )}
              </div>
            ))}
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
          <LabelAboveContent header title='Regelverk'>
            <LovViewList regelverkListe={krav.regelverk} />
          </LabelAboveContent>
        </LabelWrapper>
      )}

      <LabelWrapper>
        <LabelAboveContent header title='Ansvarlig'>
          {krav.underavdeling?.shortName}
        </LabelAboveContent>
      </LabelWrapper>

      <LabelWrapper>
        <LabelAboveContent header title='Varslingsadresser'>
          <VarslingsadresserView varslingsadresser={krav.varslingsadresserQl} />
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
}
