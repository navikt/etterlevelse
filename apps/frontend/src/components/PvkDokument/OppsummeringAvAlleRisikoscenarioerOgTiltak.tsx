import {
  Alert,
  BodyLong,
  BodyShort,
  Heading,
  Link,
  List,
  Tabs,
  ToggleGroup,
} from '@navikt/ds-react'
import { RefObject, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRisikoscenarioByPvkDokumentId } from '../../api/RisikoscenarioApi'
import { ERisikoscenarioType, IPvkDokument, IRisikoscenario } from '../../constants'
import AccordianAlertModal from '../risikoscenario/AccordianAlertModal'
import OppsumeringAccordianList from '../risikoscenario/OppsummeringAccordian/OppsumeringAccordianList'
import FormButtons from './edit/FormButtons'

interface IProps {
  etterlevelseDokumentasjonId: string
  pvkDokument: IPvkDokument
  activeStep: number
  setActiveStep: (step: number) => void
  setSelectedStep: (step: number) => void
  formRef: RefObject<any>
}

export const tabValues = { risikoscenarioer: 'risikoscenarioer', tiltak: 'tiltak' }
export const filterValues = {
  alleRisikoscenarioer: 'alle',
  effektIkkeVurdert: 'ikke-vurdert',
  hoyRisiko: 'hoy-risiko',
  tiltakIkkeAktuelt: 'ingen-tiltak',
}

export const OppsummeringAvAlleRisikoscenarioerOgTiltak = (props: IProps) => {
  const {
    etterlevelseDokumentasjonId,
    pvkDokument,
    activeStep,
    setActiveStep,
    setSelectedStep,
    formRef,
  } = props
  const [risikoscenarioList, setRisikoscenarioList] = useState<IRisikoscenario[]>([])
  const [filteredRisikoscenarioList, setFilteredRisikosenarioList] = useState<IRisikoscenario[]>([])
  const [isUnsaved, setIsUnsaved] = useState<boolean>(false)
  const [navigateUrl, setNavigateUrl] = useState<string>('')
  const url = new URL(window.location.href)
  const tabQuery = url.searchParams.get('tab')
  const filterQuery = url.searchParams.get('filter')
  const navigate = useNavigate()

  useEffect(() => {
    if (pvkDokument) {
      ;(async () => {
        await getRisikoscenarioByPvkDokumentId(pvkDokument.id, ERisikoscenarioType.ALL).then(
          (risikoscenarioer) => {
            setRisikoscenarioList(risikoscenarioer.content)
            setFilteredRisikosenarioList(risikoscenarioer.content)
          }
        )
      })()
    }
  }, [pvkDokument])

  const onTabChange = (tab: string) => {
    const filter = filterQuery ? filterQuery : filterValues.alleRisikoscenarioer
    const paramQuery = tab === tabValues.risikoscenarioer ? '&filter=' + filter : ''
    setNavigateUrl(`${window.location.pathname}?tab=${tab}${paramQuery}`)

    if (formRef.current?.dirty) {
      setIsUnsaved(true)
    } else {
      navigate(`${window.location.pathname}?tab=${tab}${paramQuery}`)
    }
  }

  const onFilterChange = (filter: string) => {
    const tab = tabQuery ? tabQuery : tabValues.risikoscenarioer

    switch (filter) {
      case filterValues.alleRisikoscenarioer:
        setFilteredRisikosenarioList(risikoscenarioList)
        break
      case filterValues.tiltakIkkeAktuelt:
        setFilteredRisikosenarioList(
          risikoscenarioList.filter((risikoscenario) => risikoscenario.ingenTiltak)
        )
        break
      case filterValues.hoyRisiko:
        setFilteredRisikosenarioList([])
        break
      default:
        setFilteredRisikosenarioList(risikoscenarioList)
        break
    }

    setNavigateUrl(`${window.location.pathname}?tab=${tab}&filter=${filter}`)
    if (formRef.current?.dirty) {
      setIsUnsaved(true)
    } else {
      navigate(`${window.location.pathname}?tab=${tab}&filter=${filter}`)
    }
  }

  return (
    <div className="flex justify-center w-full">
      <div className="w-full">
        <Heading level="1" size="medium" className="mb-5">
          Oppsummering av alle risikoscenarioer og tiltak
        </Heading>

        <BodyShort className="mt-5">
          Her får dere oversikt over alle risikoscenarioer og tiltak som er lagt inn. Dere kan velge
          å se på:
        </BodyShort>

        <List>
          <List.Item>
            Etterlevelseskrav, og hvilke risikoscenarioer og tiltak som finnes ved hvert krav
          </List.Item>
          <List.Item>
            Etterlevelseskrav, og hvilke risikoscenarioer og tiltak som finnes ved hvert krav
          </List.Item>
          <List.Item>Tiltak, inkludert hvilke tiltak som savner ansvarlig eller frist.</List.Item>
        </List>

        <Tabs value={tabQuery ? tabQuery : tabValues.risikoscenarioer} onChange={onTabChange} fill>
          <Tabs.List>
            <Tabs.Tab value={tabValues.risikoscenarioer} label="Vis risikoscenarioer" />
            <Tabs.Tab value={tabValues.tiltak} label=" Vis tiltak " />
          </Tabs.List>
          <Tabs.Panel value={tabValues.risikoscenarioer} className="w-full">
            <ToggleGroup value={filterQuery ? filterQuery : 'alle'} onChange={onFilterChange} fill>
              <ToggleGroup.Item
                value={filterValues.alleRisikoscenarioer}
                label="Alle risikoscenarioer"
              />
              <ToggleGroup.Item
                value={filterValues.effektIkkeVurdert}
                label="Effekt ikke vurdert"
              />
              <ToggleGroup.Item value={filterValues.hoyRisiko} label="Høy risiko" />
              <ToggleGroup.Item
                value={filterValues.tiltakIkkeAktuelt}
                label="Tiltak ikke aktuelt"
              />
            </ToggleGroup>

            {risikoscenarioList.length === 0 && (
              <div className="my-5">
                <Alert variant="info">
                  <Heading spacing size="small" level="3">
                    Dere har foreløpig ingen risikoscenarioer
                  </Heading>
                  Risikoscenarioer legges inn under{' '}
                  <Link href={`/dokumentasjon/${etterlevelseDokumentasjonId}`}>
                    PVK-relaterte krav
                  </Link>{' '}
                  (åpnes i ny fane) eller eventuelt under øvrige risikoscenarioer (åpnes i ny fane).
                </Alert>
              </div>
            )}

            {filteredRisikoscenarioList.length === 0 && (
              <BodyLong>Ingen risikoscenario med {filterQuery}</BodyLong>
            )}

            {filteredRisikoscenarioList.length !== 0 && (
              <div className="my-5">
                <OppsumeringAccordianList
                  risikoscenarioList={filteredRisikoscenarioList}
                  formRef={formRef}
                  isUnsaved={isUnsaved}
                  setIsUnsaved={setIsUnsaved}
                />
              </div>
            )}
          </Tabs.Panel>
          <Tabs.Panel value={tabValues.tiltak} className="h-24 w-full">
            Her skal tiltak vises
          </Tabs.Panel>
        </Tabs>

        <AccordianAlertModal
          isOpen={isUnsaved}
          setIsOpen={setIsUnsaved}
          navigateUrl={navigateUrl}
          formRef={formRef}
          reloadOnSubmit={true}
        />

        <div className="mt-5">
          <FormButtons
            etterlevelseDokumentasjonId={etterlevelseDokumentasjonId}
            activeStep={activeStep}
            setActiveStep={setActiveStep}
            setSelectedStep={setSelectedStep}
          />
        </div>
      </div>
    </div>
  )
}

export default OppsummeringAvAlleRisikoscenarioerOgTiltak
