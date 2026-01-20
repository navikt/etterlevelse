import { useSearchKravToOptionsPvk } from '@/api/krav/kravApi'
import { DropdownIndicator } from '@/components/common/dropdownIndicator/dropdownIndicator'
import { RenderTagList } from '@/components/common/renderTagList/renderTagList'
import { IKravReference } from '@/constants/krav/kravConstants'
import { kravNummerView } from '@/util/krav/kravUtil'
import { noOptionMessage, selectOverrides } from '@/util/search/searchUtil'
import { Alert, BodyLong, Checkbox, CheckboxGroup, Label, List } from '@navikt/ds-react'
import { Field, FieldArray, FieldArrayRenderProps, FieldProps } from 'formik'
import { FunctionComponent, useEffect, useRef, useState } from 'react'
import AsyncSelect from 'react-select/async'

type TProps = {
  generelScenarioFormValue: boolean
  relevanteKravNummerFormValue: IKravReference[]
  isOvrigScenario: boolean
}

export const OvrigToKravSpesifikkRisikoscenarioField: FunctionComponent<TProps> = ({
  generelScenarioFormValue,
  relevanteKravNummerFormValue,
  isOvrigScenario,
}) => {
  const [removedAllAlert, setRemovedAllAlert] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const [menuPortalTarget, setMenuPortalTarget] = useState<HTMLElement | undefined>(undefined)

  const removedAllAlertRef = useRef<HTMLDivElement>(null)
  const decoupledAlertRef = useRef<HTMLDivElement>(null)
  const ovrigScenarioLinkedAlertRef = useRef<HTMLDivElement>(null)
  const multiKravAlertRef = useRef<HTMLDivElement>(null)
  const kravSelectSectionRef = useRef<HTMLDivElement>(null)

  const prevGenerelScenarioRef = useRef<boolean | undefined>(undefined)
  const prevRemovedAllAlertShownRef = useRef<boolean | undefined>(undefined)
  const prevDecoupledAlertShownRef = useRef<boolean | undefined>(undefined)
  const prevOvrigScenarioLinkedAlertShownRef = useRef<boolean | undefined>(undefined)
  const prevMultiKravAlertShownRef = useRef<boolean | undefined>(undefined)

  const getDialogEl = (rootEl: HTMLElement): HTMLElement | null => {
    return (
      (rootEl.closest('dialog') as HTMLElement | null) ||
      (rootEl.closest('[role="dialog"]') as HTMLElement | null)
    )
  }

  const deferScroll = () => {
    if (typeof window === 'undefined') return
    // Give React + layout a moment to settle (e.g. tags rendered, dropdown menu measured)
    requestAnimationFrame(() => requestAnimationFrame(() => scrollSaveButtonIntoView()))
  }

  const scrollKravSelectIntoView = () => {
    if (typeof window === 'undefined') return
    kravSelectSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const deferScrollKravSelect = () => {
    if (typeof window === 'undefined') return
    requestAnimationFrame(() => requestAnimationFrame(() => scrollKravSelectIntoView()))
  }

  const scrollToBottomOfModal = () => {
    if (typeof window === 'undefined') return
    const rootEl = rootRef.current
    if (!rootEl) return

    const dialog = getDialogEl(rootEl)
    const scrollEl =
      (dialog?.querySelector('.navds-modal__body') as HTMLElement | null) ||
      (dialog?.querySelector('.navds-modal__content') as HTMLElement | null) ||
      dialog

    const target =
      (scrollEl as any) || (document.scrollingElement as any) || (document.documentElement as any)
    if (!target) return
    const top = target.scrollHeight ?? document.body.scrollHeight
    if (typeof target.scrollTo === 'function') {
      target.scrollTo({ top, behavior: 'smooth' })
    } else {
      target.scrollTop = top
    }
  }

  const scrollSaveButtonIntoView = () => {
    if (typeof window === 'undefined') return
    const rootEl = rootRef.current
    if (!rootEl) return

    const dialog = getDialogEl(rootEl)
    const searchScope: HTMLElement | Document = dialog ?? document

    const buttons = Array.from(searchScope.querySelectorAll('button')) as HTMLElement[]
    const saveButton =
      buttons.find((btn) =>
        (btn.textContent || '').trim().toLowerCase().includes('lagre risikoscenario')
      ) ||
      buttons.find((btn) => (btn.textContent || '').trim().toLowerCase().includes('lagre')) ||
      (searchScope.querySelector('button[type="submit"]') as HTMLElement | null) ||
      (searchScope.querySelector('[data-testid*="lagre" i]') as HTMLElement | null) ||
      (searchScope.querySelector('[data-testid*="save" i]') as HTMLElement | null)

    if (saveButton) {
      const rect = saveButton.getBoundingClientRect()
      const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight
      if (!isVisible) {
        // Use 'nearest' to avoid scrolling away other important content (like alerts)
        saveButton.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    } else {
      // Fallback to bottom of modal if specific button isn't found
      scrollToBottomOfModal()
    }
  }

  const isRemovedAllAlertShown = removedAllAlert
  const isDecoupledAlertShown =
    generelScenarioFormValue && relevanteKravNummerFormValue.length !== 0
  const isOvrigScenarioLinkedAlertShown =
    isOvrigScenario && !generelScenarioFormValue && relevanteKravNummerFormValue.length !== 0
  const isMultiKravAlertShown = !generelScenarioFormValue && relevanteKravNummerFormValue.length > 1

  useEffect(() => {
    // Avoid scrolling on initial mount; only when it becomes visible due to user action
    if (prevRemovedAllAlertShownRef.current === undefined) {
      prevRemovedAllAlertShownRef.current = isRemovedAllAlertShown
      return
    }

    const prevShown = prevRemovedAllAlertShownRef.current
    prevRemovedAllAlertShownRef.current = isRemovedAllAlertShown

    if (!prevShown && isRemovedAllAlertShown) {
      removedAllAlertRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [isRemovedAllAlertShown])

  useEffect(() => {
    // Avoid scrolling on initial mount; only when it becomes visible
    if (prevDecoupledAlertShownRef.current === undefined) {
      prevDecoupledAlertShownRef.current = isDecoupledAlertShown
      return
    }

    const prevShown = prevDecoupledAlertShownRef.current
    prevDecoupledAlertShownRef.current = isDecoupledAlertShown

    if (!prevShown && isDecoupledAlertShown) {
      decoupledAlertRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [isDecoupledAlertShown])

  useEffect(() => {
    // Avoid scrolling on initial mount; only when it becomes visible
    if (prevOvrigScenarioLinkedAlertShownRef.current === undefined) {
      prevOvrigScenarioLinkedAlertShownRef.current = isOvrigScenarioLinkedAlertShown
      return
    }

    const prevShown = prevOvrigScenarioLinkedAlertShownRef.current
    prevOvrigScenarioLinkedAlertShownRef.current = isOvrigScenarioLinkedAlertShown

    if (!prevShown && isOvrigScenarioLinkedAlertShown) {
      ovrigScenarioLinkedAlertRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [isOvrigScenarioLinkedAlertShown])

  useEffect(() => {
    // Avoid scrolling on initial mount; only when it becomes visible
    if (prevMultiKravAlertShownRef.current === undefined) {
      prevMultiKravAlertShownRef.current = isMultiKravAlertShown
      return
    }

    const prevShown = prevMultiKravAlertShownRef.current
    prevMultiKravAlertShownRef.current = isMultiKravAlertShown

    if (!prevShown && isMultiKravAlertShown) {
      multiKravAlertRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [isMultiKravAlertShown])

  useEffect(() => {
    // Avoid scrolling on initial mount; only when toggling from general -> krav-specific
    if (prevGenerelScenarioRef.current === undefined) {
      prevGenerelScenarioRef.current = generelScenarioFormValue
      return
    }

    const prev = prevGenerelScenarioRef.current
    prevGenerelScenarioRef.current = generelScenarioFormValue

    if (prev && !generelScenarioFormValue) {
      scrollKravSelectIntoView()
      deferScrollKravSelect()
    }
  }, [generelScenarioFormValue])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const rootEl = rootRef.current
    if (!rootEl) return

    const dialog = getDialogEl(rootEl)

    setMenuPortalTarget(dialog ?? document.body)
  }, [])

  return (
    <div ref={rootRef} className='my-5'>
      <Field name='generelScenario'>
        {(fieldProps: FieldProps) => (
          <CheckboxGroup
            legend='Koble dette risikoscenarioet til PVK-relatert(e) etterlevelseskrav'
            hideLegend
            value={fieldProps.form.values.generelScenario ? [] : ['krav_spesifikk']}
            onChange={async (value: string[]) => {
              if (value.length !== 0) {
                await fieldProps.form.setFieldValue('generelScenario', false)
                setRemovedAllAlert(false)
                // Scroll down to the search field/results when enabling
                scrollKravSelectIntoView()
                deferScrollKravSelect()
              } else {
                await fieldProps.form.setFieldValue('generelScenario', true)
              }
            }}
          >
            <Checkbox value='krav_spesifikk'>
              Koble dette risikoscenarioet til PVK-relatert(e) etterlevelseskrav
            </Checkbox>
          </CheckboxGroup>
        )}
      </Field>

      {removedAllAlert && (
        <div ref={removedAllAlertRef}>
          <Alert
            variant='info'
            className='mt-3'
            aria-live='polite'
            aria-label='Fordi du har fjernet alle etterlevelseskrav, vil dette risikoscenarioet vises i listen over alle øvrige krav, på siden Identifisering av risikoscenarioer og tiltak.'
          >
            <BodyLong>
              Fordi du har fjernet alle etterlevelseskrav, vil dette risikoscenarioet vises i listen
              over alle øvrige krav, på siden Identifisering av risikoscenarioer og tiltak.
            </BodyLong>
          </Alert>
        </div>
      )}

      {!generelScenarioFormValue && (
        <div ref={kravSelectSectionRef} className='mt-5'>
          <FieldArray name='relevanteKravNummer'>
            {(fieldArrayRenderProps: FieldArrayRenderProps) => (
              <div className='my-3'>
                <Label>
                  Velg 1 eller flere etterlevelseskrav hvor dette risikoscenarioet inntreffer
                </Label>
                <div className='w-full'>
                  <AsyncSelect
                    aria-label='Søk etter etterlevelseskrav'
                    placeholder=''
                    components={{ DropdownIndicator }}
                    noOptionsMessage={({ inputValue }) => noOptionMessage(inputValue)}
                    controlShouldRenderValue={false}
                    loadingMessage={() => 'Søker...'}
                    isClearable={false}
                    menuShouldBlockScroll={false}
                    captureMenuScroll={false}
                    menuPosition='fixed'
                    menuPortalTarget={menuPortalTarget}
                    menuShouldScrollIntoView={false}
                    loadOptions={useSearchKravToOptionsPvk}
                    onMenuOpen={() => {
                      scrollSaveButtonIntoView()
                    }}
                    onChange={(value: any) => {
                      if (value) {
                        const exists = fieldArrayRenderProps.form.values.relevanteKravNummer?.some(
                          (krav: IKravReference) =>
                            krav.kravNummer === value.kravNummer &&
                            krav.kravVersjon === value.kravVersjon
                        )
                        if (!exists) {
                          fieldArrayRenderProps.push(value)
                        }
                        // Ensure save button is visible after selecting a krav
                        scrollSaveButtonIntoView()
                        deferScroll()
                      }
                    }}
                    styles={selectOverrides}
                  />
                </div>
                <RenderTagList
                  list={fieldArrayRenderProps.form.values.relevanteKravNummer.map(
                    (kravReference: IKravReference) =>
                      `${kravNummerView(kravReference.kravVersjon, kravReference.kravNummer)} ${kravReference.navn}`
                  )}
                  onRemove={async (removeIndex: number) => {
                    const current = fieldArrayRenderProps.form.values.relevanteKravNummer || []
                    const willBeEmpty = current.length === 1

                    fieldArrayRenderProps.remove(removeIndex)

                    if (willBeEmpty) {
                      await fieldArrayRenderProps.form.setFieldValue('generelScenario', true)
                      setRemovedAllAlert(true)
                    }
                  }}
                />
              </div>
            )}
          </FieldArray>
        </div>
      )}

      {generelScenarioFormValue && relevanteKravNummerFormValue.length !== 0 && (
        <div ref={decoupledAlertRef}>
          <Alert variant='info' className='mt-5'>
            <BodyLong>
              Dere har valgt å avkoble dette risikoscenarioet fra følgende etterlevelseskrav:
            </BodyLong>{' '}
            <List>
              {relevanteKravNummerFormValue.map((relevanteKrav, index) => (
                <List.Item key={`${index}_${relevanteKrav.navn}`}>
                  {kravNummerView(relevanteKrav.kravVersjon, relevanteKrav.kravNummer)}{' '}
                  {relevanteKrav.navn}
                </List.Item>
              ))}
            </List>
            <BodyLong>
              Fordi risikoscenarioet ikke er koblet til andre krav, vil det nå synes som “øvrig”
              scenario på Identifisering av risikoscenarioer og tiltak.
            </BodyLong>
          </Alert>
        </div>
      )}

      {isOvrigScenario &&
        !generelScenarioFormValue &&
        relevanteKravNummerFormValue.length !== 0 && (
          <div ref={ovrigScenarioLinkedAlertRef}>
            <Alert variant='info' className='mt-5'>
              Dere har valgt å koble dette risikoscenarioet til etterlevelseskrav. Når dere lagrer
              denne endringen, vil risikoscenarioet forsvinne fra listen over “øvrige” krav.
              Scenarioet finner dere på de kravsidene som dere velger her. Husk at det også er mulig
              å legge til aktuelle risikoscenarioer fra selve kravsiden.
            </Alert>
          </div>
        )}

      {!generelScenarioFormValue && relevanteKravNummerFormValue.length > 1 && (
        <div ref={multiKravAlertRef}>
          <Alert variant='info' className='mt-5'>
            Fordi dere har valgt at dette risikoscenarioet skal høre til flere krav, vil scenarioet
            nå også finnes under gjeldende krav.
          </Alert>
        </div>
      )}
    </div>
  )
}
