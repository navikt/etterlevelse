'use client'

import { Heading } from '@navikt/ds-react'
import { useRouter } from 'next/navigation'
import {
  Dispatch,
  FunctionComponent,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { getAllKrav, getKravByKravNummer } from '@/api/krav/kravApi'
import { getAllKravPriorityList } from '@/api/kravPriorityList/kravPriorityListApi'
import { Markdown } from '@/components/common/markdown/markdown'
import KravNavigationButtons from '@/components/etterlevelse/etterlevelsePage/etterlevelseKravView/kravNavigationButtons'
import { ContentLayout, MainPanelLayout } from '@/components/others/layout/content/content'
import { IPageResponse } from '@/constants/commonConstants'
import { EListName, TLovCode, TTemaCode } from '@/constants/kodeverk/kodeverkConstants'
import { EKravStatus, IKrav, IKravVersjon, TKravQL } from '@/constants/krav/kravConstants'
import { IKravPriorityList } from '@/constants/krav/kravPriorityList/kravPriorityListConstants'
import { CodelistContext } from '@/provider/kodeverk/kodeverkProvider'
import { kravNummerVersjonUrl } from '@/routes/krav/kravRoutes'
import {
  TKravNavigationEntry,
  TKravNavigationGroup,
  getGroupedKravByTema,
} from '@/util/etterlevelseDokumentasjon/etterlevelseDokumentasjonUtil'
import { hasKravExpired } from '@/util/krav/kravUtil'
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
  const [allKrav, setAllKrav] = useState<IKrav[]>([])
  const [allKravPriority, setAllKravPriority] = useState<IKravPriorityList[]>([])
  const codelist = useContext(CodelistContext)
  const router = useRouter()

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
    ;(async () => {
      const [kraver, prioritylist] = await Promise.all([getAllKrav(), getAllKravPriorityList()])
      setAllKrav(kraver.filter((aktivtKrav: IKrav) => aktivtKrav.status === EKravStatus.AKTIV))
      setAllKravPriority(prioritylist)
    })()
  }, [])

  const kravGrupper = useMemo<TKravNavigationGroup[]>(() => {
    if (!allKrav.length) {
      return []
    }
    return getGroupedKravByTema({
      temaListe: codelist.utils.getCodes(EListName.TEMA) as TTemaCode[],
      kravliste: allKrav,
      allKravPriority,
      codelist,
    })
  }, [allKrav, allKravPriority, codelist])

  const [forrigeKravUrl, nesteKravUrl] = useMemo<[string, string]>(() => {
    const orderedKrav: TKravNavigationEntry[] = kravGrupper.flatMap(
      (group: TKravNavigationGroup) => group.krav
    )
    const currentIndex: number = orderedKrav.findIndex(
      (entry: TKravNavigationEntry) =>
        entry.kravNummer === krav.kravNummer && entry.kravVersjon === krav.kravVersjon
    )

    if (currentIndex === -1) {
      return ['', '']
    }

    const toUrl = (entry: TKravNavigationEntry | undefined): string =>
      entry ? kravNummerVersjonUrl(entry.kravNummer, entry.kravVersjon) : ''

    return [toUrl(orderedKrav[currentIndex - 1]), toUrl(orderedKrav[currentIndex + 1])]
  }, [kravGrupper, krav.kravNummer, krav.kravVersjon])

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

        <KravNavigationButtons
          forrigeKravUrl={forrigeKravUrl}
          nesteKravUrl={nesteKravUrl}
          onNavigate={(url: string) => router.push(url)}
          kravGrupper={kravGrupper}
          currentKravNummer={krav.kravNummer}
          currentKravVersjon={krav.kravVersjon}
          buildKravUrl={(entry: TKravNavigationEntry) =>
            kravNummerVersjonUrl(entry.kravNummer, entry.kravVersjon)
          }
        />
      </MainPanelLayout>
      <KravRightSidePanel krav={krav} alleKravVersjoner={alleKravVersjoner} />
    </ContentLayout>
  )
}
