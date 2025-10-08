'use client'

import { getKravByKravNummer } from '@/api/krav/kravApi'
import { Markdown } from '@/components/common/markdown/markdown'
import { ContentLayout, MainPanelLayout } from '@/components/others/layout/content/content'
import { IPageResponse } from '@/constants/commonConstants'
import { EListName, TLovCode, TTemaCode } from '@/constants/kodeverk/kodeverkConstants'
import { EKravStatus, IKrav, IKravVersjon, TKravQL } from '@/constants/krav/kravConstants'
import { CodelistContext } from '@/provider/kodeverk/kodeverkProvider'
import { hasKravExpired } from '@/util/krav/kravUtil'
import { Heading } from '@navikt/ds-react'
import { Dispatch, FunctionComponent, SetStateAction, useContext, useEffect, useState } from 'react'
import ExpiredAlert from '../expiredAlert/expiredAlertComponent'
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
  const codelist = useContext(CodelistContext)

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
      const lovData: TLovCode = codelist.utils.getCode(
        EListName.LOV,
        krav.regelverk[0]?.lov?.code
      ) as TLovCode
      if (lovData?.data) {
        setKravTema(
          codelist.utils.getCode(EListName.TEMA, lovData.data.tema) as TTemaCode | undefined
        )
      }
    }
  }, [krav])

  useEffect(() => {
    if (krav && kravTema) {
      // const ampliInstance = ampli()
      // if (ampliInstance) {
      //   ampliInstance.logEvent('sidevisning', {
      //     side: 'Krav side',
      //     sidetittel: `${kravNummerView({
      //       kravNummer: krav?.kravNummer,
      //       kravVersjon: krav?.kravVersjon,
      //     })} ${krav.navn}`,
      //     section: kravTema?.shortName.toString(),
      //     ...userRoleEventProp,
      //   })
      // }
    }
  }, [krav, kravTema])

  return (
    <ContentLayout>
      <MainPanelLayout>
        {hasKravExpired(alleKravVersjoner, krav) && krav && (
          <ExpiredAlert
            alleKravVersjoner={alleKravVersjoner}
            statusName={krav.status}
            description={
              krav.status === EKravStatus.UTGAATT &&
              krav.beskrivelse && (
                <div className='py-3 mb-5'>
                  <Heading size='small' level='2'>
                    Begrunnelse for at kravet er utgått
                  </Heading>
                  <Markdown source={krav.beskrivelse} />
                </div>
              )
            }
          />
        )}
        <div className='bg-blue-50 px-5 py-3 mb-5'>
          <Heading size='small' level='2'>
            Hensikten med kravet
          </Heading>
          <Markdown source={krav.hensikt} />
        </div>

        <KravTabMeny krav={krav} kravLoading={kravLoading} alleKravVersjoner={alleKravVersjoner} />
      </MainPanelLayout>
      <KravRightSidePanel krav={krav} alleKravVersjoner={alleKravVersjoner} />
    </ContentLayout>
  )
}
