'use client'

import { EEtterlevelseStatus } from '@/constants/etterlevelseDokumentasjon/etterlevelse/etterlevelseConstants'
import { IKravNivaaStatusFilter } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { ChevronDownIcon } from '@navikt/aksel-icons'
import { ActionMenu, Button } from '@navikt/ds-react'
import { Dispatch, FunctionComponent, SetStateAction } from 'react'

interface IKravNivaaStatusFilterProps {
  kravCount: number
  kravNivaaStatusFilter: IKravNivaaStatusFilter
  setKravNivaaStatusFilter: Dispatch<SetStateAction<IKravNivaaStatusFilter>>
}

export const KravNivaaStatusFilter: FunctionComponent<IKravNivaaStatusFilterProps> = ({
  kravCount,
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
          Velg fullføringsgrad på kravnivå ({kravCount})
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
