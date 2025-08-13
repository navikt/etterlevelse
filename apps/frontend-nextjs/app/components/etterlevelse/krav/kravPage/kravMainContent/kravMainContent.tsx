'use client'

import { getKravByKravNummer } from '@/api/krav/kravApi'
import {
  ContentLayout,
  MainPanelLayout,
} from '@/components/others/layout/contentLayout/contentLayoutComponent'
import { IPageResponse } from '@/constants/commonConstants'
import { EListName, TLovCode } from '@/constants/kodeverk/kodeverkConstants'
import { EKravStatus, IKrav, IKravVersjon, TKravQL } from '@/constants/krav/kravConstants'
import { TTemaCode } from '@/constants/teamkatalogen/teamkatalogConstants'
import { ampli, userRoleEventProp } from '@/services/amplitude/amplitudeService'
import { codelist } from '@/services/kodeverk/kodeverkService'
import { kravNummerView } from '@/util/kravNummerView/kravNummerView'
import { Dispatch, FunctionComponent, SetStateAction, useEffect, useState } from 'react'
import { KravHasExpired } from './kravHasExpired/kravHasExpired'
import { KravHensikt } from './kravHensikt/kravHensikt'
import { KravRightSidePanel } from './kravRightSidePanel/kravRightSidePanel'
import { KravTabMeny } from './kravTabMeny/kravTabMeny'

type TProps = {
  krav: TKravQL
  kravLoading: boolean
  kravTema: TTemaCode | undefined
  setKravTema: Dispatch<SetStateAction<TTemaCode | undefined>>
}

export const KravMainContent: FunctionComponent<TProps> = ({
  krav,
  kravLoading,
  kravTema,
  setKravTema,
}) => {
  const [alleKravVersjoner, setAlleKravVersjoner] = useState<IKravVersjon[]>([
    { kravNummer: 0, kravVersjon: 0, kravStatus: 'Utkast' },
  ])

  useEffect(() => {
    if (krav) {
      getKravByKravNummer(krav.kravNummer).then((response: IPageResponse<IKrav>) => {
        if (response.content.length) {
          const alleVersjoner: IKravVersjon[] = response.content
            .map((krav: IKrav) => {
              return {
                kravNummer: krav.kravNummer,
                kravVersjon: krav.kravVersjon,
                kravStatus: krav.status,
              }
            })
            .sort((a, b) => (a.kravVersjon > b.kravVersjon ? -1 : 1))

          const filteredVersjoner: IKravVersjon[] = alleVersjoner.filter(
            (krav: IKravVersjon) => krav.kravStatus !== EKravStatus.UTKAST
          )

          if (filteredVersjoner.length) {
            setAlleKravVersjoner(filteredVersjoner)
          }
        }
      })
      const lovData: TLovCode = codelist.getCode(
        EListName.LOV,
        krav.regelverk[0]?.lov?.code
      ) as TLovCode
      if (lovData?.data) {
        setKravTema(codelist.getCode(EListName.TEMA, lovData.data.tema) as TTemaCode | undefined)
      }
    }
  }, [krav])

  useEffect(() => {
    if (krav && kravTema) {
      const ampliInstance = ampli()
      if (ampliInstance) {
        ampliInstance.logEvent('sidevisning', {
          side: 'Krav side',
          sidetittel: `${kravNummerView({
            kravNummer: krav?.kravNummer,
            kravVersjon: krav?.kravVersjon,
          })} ${krav.navn}`,
          section: kravTema?.shortName.toString(),
          ...userRoleEventProp,
        })
      }
    }
  }, [krav, kravTema])

  return (
    <ContentLayout>
      <MainPanelLayout>
        <KravHasExpired krav={krav} alleKravVersjoner={alleKravVersjoner} />
        <KravHensikt krav={krav} />

        <KravTabMeny krav={krav} kravLoading={kravLoading} alleKravVersjoner={alleKravVersjoner} />
      </MainPanelLayout>
      <KravRightSidePanel krav={krav} alleKravVersjoner={alleKravVersjoner} />
    </ContentLayout>
  )
}
