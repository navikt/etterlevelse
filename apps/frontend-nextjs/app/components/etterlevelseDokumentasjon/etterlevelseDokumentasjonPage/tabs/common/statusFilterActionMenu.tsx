'use client'

import {
  EEtterlevelseStatus,
  ESuksesskriterieStatus,
} from '@/constants/etterlevelseDokumentasjon/etterlevelse/etterlevelseConstants'
import {
  IKravNivaaStatusFilter,
  ISuksesskriterieStatusFilter,
} from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { ChevronDownIcon } from '@navikt/aksel-icons'
import { ActionMenu, Button } from '@navikt/ds-react'
import { Dispatch, FunctionComponent, SetStateAction } from 'react'

interface IKravNivaaStatusFilterProps {
  kravNivaaStatusFilter: IKravNivaaStatusFilter
  setKravNivaaStatusFilter: Dispatch<SetStateAction<IKravNivaaStatusFilter>>
}

interface ISuksesskriterieStatusFilterProps {
  suksesskriterieStatusFilter: ISuksesskriterieStatusFilter
  setSuksesskriterieStatusFilter: Dispatch<SetStateAction<ISuksesskriterieStatusFilter>>
}

export const KravNivaaStatusFilter: FunctionComponent<IKravNivaaStatusFilterProps> = ({
  kravNivaaStatusFilter,
  setKravNivaaStatusFilter,
}) => {
  const handleCheckboxChange = (checkboxId: string) => {
    setKravNivaaStatusFilter((prevState: any) => ({
      ...prevState,
      [checkboxId]: !prevState[checkboxId],
    }))
  }

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
          Ikke påbegynt
        </ActionMenu.CheckboxItem>
        <ActionMenu.CheckboxItem
          checked={kravNivaaStatusFilter.UNDER_REDIGERING}
          onCheckedChange={() => handleCheckboxChange(EEtterlevelseStatus.UNDER_REDIGERING)}
        >
          Under arbeid
        </ActionMenu.CheckboxItem>
        <ActionMenu.CheckboxItem
          checked={kravNivaaStatusFilter.FERDIG_DOKUMENTERT}
          onCheckedChange={() => handleCheckboxChange(EEtterlevelseStatus.FERDIG_DOKUMENTERT)}
        >
          Ferdig utfylt
        </ActionMenu.CheckboxItem>
        <ActionMenu.CheckboxItem
          checked={kravNivaaStatusFilter.OPPFYLLES_SENERE}
          onCheckedChange={() => handleCheckboxChange(EEtterlevelseStatus.OPPFYLLES_SENERE)}
        >
          Oppfylles senere
        </ActionMenu.CheckboxItem>
      </ActionMenu.Content>
    </ActionMenu>
  )
}

export const SuksesskriterieStatusFilter: FunctionComponent<ISuksesskriterieStatusFilterProps> = ({
  suksesskriterieStatusFilter,
  setSuksesskriterieStatusFilter,
}) => {
  const handleCheckboxChange = (checkboxId: string) => {
    setSuksesskriterieStatusFilter((prevState: any) => ({
      ...prevState,
      [checkboxId]: !prevState[checkboxId],
    }))
  }

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
          Ikke påbegynt
        </ActionMenu.CheckboxItem>
        <ActionMenu.CheckboxItem
          checked={suksesskriterieStatusFilter.UNDER_ARBEID}
          onCheckedChange={() => handleCheckboxChange(ESuksesskriterieStatus.UNDER_ARBEID)}
        >
          Under arbeid
        </ActionMenu.CheckboxItem>
        <ActionMenu.CheckboxItem
          checked={suksesskriterieStatusFilter.OPPFYLT}
          onCheckedChange={() => handleCheckboxChange(ESuksesskriterieStatus.OPPFYLT)}
        >
          Oppfylt
        </ActionMenu.CheckboxItem>
        <ActionMenu.CheckboxItem
          checked={suksesskriterieStatusFilter.IKKE_OPPFYLT}
          onCheckedChange={() => handleCheckboxChange(ESuksesskriterieStatus.IKKE_OPPFYLT)}
        >
          Ikke oppfylt
        </ActionMenu.CheckboxItem>

        <ActionMenu.CheckboxItem
          checked={suksesskriterieStatusFilter.IKKE_RELEVANT}
          onCheckedChange={() => handleCheckboxChange(ESuksesskriterieStatus.IKKE_RELEVANT)}
        >
          Ikke relevant
        </ActionMenu.CheckboxItem>
      </ActionMenu.Content>
    </ActionMenu>
  )
}
