'use client'

import { ChevronDownIcon } from '@navikt/aksel-icons'
import { ActionMenu, Button } from '@navikt/ds-react'
import { Dispatch, FunctionComponent, SetStateAction, useMemo } from 'react'
import {
  EEtterlevelseStatus,
  ESuksesskriterieStatus,
} from '@/constants/etterlevelseDokumentasjon/etterlevelse/etterlevelseConstants'
import {
  IKravNivaaStatusFilter,
  ISuksesskriterieStatusFilter,
} from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { TKravQL } from '@/constants/krav/kravConstants'
import {
  filterKravEtterlevelseStatus,
  filterSuksesskriterieStatus,
} from '@/util/etterlevelseDokumentasjon/etterlevelseDokumentasjonUtil'

interface IKravNivaaStatusFilterProps {
  kravNivaaStatusFilter: IKravNivaaStatusFilter
  setKravNivaaStatusFilter: Dispatch<SetStateAction<IKravNivaaStatusFilter>>
  relevanteStats: TKravQL[]
  searchKrav: string
}

interface ISuksesskriterieStatusFilterProps {
  suksesskriterieStatusFilter: ISuksesskriterieStatusFilter
  setSuksesskriterieStatusFilter: Dispatch<SetStateAction<ISuksesskriterieStatusFilter>>
  relevanteStats: TKravQL[]
  searchKrav: string
}

const getSearchedKrav = (relevanteStats: TKravQL[], searchKrav: string): TKravQL[] => {
  const kravListe: TKravQL[] = [...relevanteStats]

  if (searchKrav === '') {
    return kravListe
  }

  return kravListe.filter((krav) =>
    ('K' + krav.kravNummer + '.' + krav.kravVersjon + ' ' + krav.navn)
      .toLowerCase()
      .includes(searchKrav.toLowerCase())
  )
}

export const KravNivaaStatusFilter: FunctionComponent<IKravNivaaStatusFilterProps> = ({
  kravNivaaStatusFilter,
  setKravNivaaStatusFilter,
  relevanteStats,
  searchKrav,
}) => {
  const handleCheckboxChange = (checkboxId: string) => {
    setKravNivaaStatusFilter((prevState: any) => ({
      ...prevState,
      [checkboxId]: !prevState[checkboxId],
    }))
  }

  const antall = useMemo(() => {
    const kravListe = getSearchedKrav(relevanteStats, searchKrav)
    const antallForStatus = (status: keyof IKravNivaaStatusFilter): number =>
      filterKravEtterlevelseStatus(
        {
          IKKE_PAABEGYNT: false,
          UNDER_REDIGERING: false,
          FERDIG_DOKUMENTERT: false,
          OPPFYLLES_SENERE: false,
          IKKE_BEHOV_FOR_REVURDERING: false,
          [status]: true,
        },
        kravListe
      ).length

    return {
      IKKE_PAABEGYNT: antallForStatus('IKKE_PAABEGYNT'),
      UNDER_REDIGERING: antallForStatus('UNDER_REDIGERING'),
      FERDIG_DOKUMENTERT: antallForStatus('FERDIG_DOKUMENTERT'),
      OPPFYLLES_SENERE: antallForStatus('OPPFYLLES_SENERE'),
      IKKE_BEHOV_FOR_REVURDERING: antallForStatus('IKKE_BEHOV_FOR_REVURDERING'),
    }
  }, [relevanteStats, searchKrav])

  return (
    <ActionMenu>
      <ActionMenu.Trigger>
        <Button
          data-color='neutral'
          variant='secondary'
          icon={<ChevronDownIcon aria-hidden />}
          iconPosition='right'
        >
          Velg fullføringsgrad på kravnivå (
          {
            (Object.keys(kravNivaaStatusFilter) as (keyof IKravNivaaStatusFilter)[]).filter(
              (key) => kravNivaaStatusFilter[key]
            ).length
          }
          )
        </Button>
      </ActionMenu.Trigger>
      <ActionMenu.Content>
        <ActionMenu.CheckboxItem
          checked={
            Object.values(kravNivaaStatusFilter).every(Boolean)
              ? true
              : Object.values(kravNivaaStatusFilter).some(Boolean)
                ? 'indeterminate'
                : false
          }
          onCheckedChange={() => {
            const allChecked = Object.values(kravNivaaStatusFilter).every(Boolean)
            setKravNivaaStatusFilter((prevState) =>
              Object.keys(prevState).reduce(
                (acc: any, key) => {
                  acc[key] = !allChecked
                  return acc
                },
                {} as typeof kravNivaaStatusFilter
              )
            )
          }}
        >
          Velg alle
        </ActionMenu.CheckboxItem>
        <ActionMenu.CheckboxItem
          checked={kravNivaaStatusFilter.IKKE_PAABEGYNT}
          onCheckedChange={() => handleCheckboxChange(EEtterlevelseStatus.IKKE_PAABEGYNT)}
        >
          Ikke påbegynt ({antall.IKKE_PAABEGYNT})
        </ActionMenu.CheckboxItem>
        <ActionMenu.CheckboxItem
          checked={kravNivaaStatusFilter.UNDER_REDIGERING}
          onCheckedChange={() => handleCheckboxChange(EEtterlevelseStatus.UNDER_REDIGERING)}
        >
          Under arbeid ({antall.UNDER_REDIGERING})
        </ActionMenu.CheckboxItem>
        <ActionMenu.CheckboxItem
          checked={kravNivaaStatusFilter.FERDIG_DOKUMENTERT}
          onCheckedChange={() => handleCheckboxChange(EEtterlevelseStatus.FERDIG_DOKUMENTERT)}
        >
          Ferdig utfylt ({antall.FERDIG_DOKUMENTERT})
        </ActionMenu.CheckboxItem>
        <ActionMenu.CheckboxItem
          checked={kravNivaaStatusFilter.OPPFYLLES_SENERE}
          onCheckedChange={() => handleCheckboxChange(EEtterlevelseStatus.OPPFYLLES_SENERE)}
        >
          Oppfylles senere ({antall.OPPFYLLES_SENERE})
        </ActionMenu.CheckboxItem>
        <ActionMenu.CheckboxItem
          checked={kravNivaaStatusFilter.IKKE_BEHOV_FOR_REVURDERING}
          onCheckedChange={() => handleCheckboxChange('IKKE_BEHOV_FOR_REVURDERING')}
        >
          Ikke behov for revurdering ({antall.IKKE_BEHOV_FOR_REVURDERING})
        </ActionMenu.CheckboxItem>
      </ActionMenu.Content>
    </ActionMenu>
  )
}

export const SuksesskriterieStatusFilter: FunctionComponent<ISuksesskriterieStatusFilterProps> = ({
  suksesskriterieStatusFilter,
  setSuksesskriterieStatusFilter,
  relevanteStats,
  searchKrav,
}) => {
  const handleCheckboxChange = (checkboxId: string) => {
    setSuksesskriterieStatusFilter((prevState: any) => ({
      ...prevState,
      [checkboxId]: !prevState[checkboxId],
    }))
  }

  const antall = useMemo(() => {
    const kravListe = getSearchedKrav(relevanteStats, searchKrav)
    const antallForStatus = (status: keyof ISuksesskriterieStatusFilter): number =>
      filterSuksesskriterieStatus(
        {
          UNDER_ARBEID: false,
          OPPFYLT: false,
          IKKE_RELEVANT: false,
          IKKE_OPPFYLT: false,
          IKKE_PAABEGYNT: false,
          [status]: true,
        },
        kravListe
      ).length

    return {
      IKKE_PAABEGYNT: antallForStatus('IKKE_PAABEGYNT'),
      UNDER_ARBEID: antallForStatus('UNDER_ARBEID'),
      OPPFYLT: antallForStatus('OPPFYLT'),
      IKKE_OPPFYLT: antallForStatus('IKKE_OPPFYLT'),
      IKKE_RELEVANT: antallForStatus('IKKE_RELEVANT'),
    }
  }, [relevanteStats, searchKrav])

  return (
    <ActionMenu>
      <ActionMenu.Trigger>
        <Button
          data-color='neutral'
          variant='secondary'
          icon={<ChevronDownIcon aria-hidden />}
          iconPosition='right'
        >
          Velg suksesskriterie-status (
          {
            (
              Object.keys(suksesskriterieStatusFilter) as (keyof ISuksesskriterieStatusFilter)[]
            ).filter((key) => suksesskriterieStatusFilter[key]).length
          }
          )
        </Button>
      </ActionMenu.Trigger>
      <ActionMenu.Content>
        <ActionMenu.CheckboxItem
          checked={
            Object.values(suksesskriterieStatusFilter).every(Boolean)
              ? true
              : Object.values(suksesskriterieStatusFilter).some(Boolean)
                ? 'indeterminate'
                : false
          }
          onCheckedChange={() => {
            const allChecked = Object.values(suksesskriterieStatusFilter).every(Boolean)
            setSuksesskriterieStatusFilter((prevState) =>
              Object.keys(prevState).reduce(
                (acc: any, key) => {
                  acc[key] = !allChecked
                  return acc
                },
                {} as typeof suksesskriterieStatusFilter
              )
            )
          }}
        >
          Velg alle
        </ActionMenu.CheckboxItem>
        <ActionMenu.CheckboxItem
          checked={suksesskriterieStatusFilter.IKKE_PAABEGYNT}
          onCheckedChange={() => handleCheckboxChange(ESuksesskriterieStatus.IKKE_PAABEGYNT)}
        >
          Ikke påbegynt ({antall.IKKE_PAABEGYNT})
        </ActionMenu.CheckboxItem>
        <ActionMenu.CheckboxItem
          checked={suksesskriterieStatusFilter.UNDER_ARBEID}
          onCheckedChange={() => handleCheckboxChange(ESuksesskriterieStatus.UNDER_ARBEID)}
        >
          Under arbeid ({antall.UNDER_ARBEID})
        </ActionMenu.CheckboxItem>
        <ActionMenu.CheckboxItem
          checked={suksesskriterieStatusFilter.OPPFYLT}
          onCheckedChange={() => handleCheckboxChange(ESuksesskriterieStatus.OPPFYLT)}
        >
          Oppfylt ({antall.OPPFYLT})
        </ActionMenu.CheckboxItem>
        <ActionMenu.CheckboxItem
          checked={suksesskriterieStatusFilter.IKKE_OPPFYLT}
          onCheckedChange={() => handleCheckboxChange(ESuksesskriterieStatus.IKKE_OPPFYLT)}
        >
          Ikke oppfylt ({antall.IKKE_OPPFYLT})
        </ActionMenu.CheckboxItem>

        <ActionMenu.CheckboxItem
          checked={suksesskriterieStatusFilter.IKKE_RELEVANT}
          onCheckedChange={() => handleCheckboxChange(ESuksesskriterieStatus.IKKE_RELEVANT)}
        >
          Ikke relevant ({antall.IKKE_RELEVANT})
        </ActionMenu.CheckboxItem>
      </ActionMenu.Content>
    </ActionMenu>
  )
}
