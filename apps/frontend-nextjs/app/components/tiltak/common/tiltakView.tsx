'use client'

import { mapTiltakToFormValue, updateTiltak } from '@/api/tiltak/tiltakApi'
import { ExternalLink } from '@/components/common/externalLink/externalLink'
import ReadOnlyField, {
  ReadOnlyFieldBool,
  ReadOnlyFieldDescriptionOptional,
} from '@/components/common/readOnlyFields'
import { TextAreaField } from '@/components/common/textAreaField/textAreaField'
import { IRisikoscenario } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { ITiltak } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/tiltak/tiltakConstants'
import { risikoscenarioUrl } from '@/routes/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensvurderingRoutes'
import { risikoDokumentasjonTemaKravNummerVersjonUrl } from '@/routes/risikoscenario/risikoscenarioRoutes'
import { PencilIcon } from '@navikt/aksel-icons'
import { Button, Checkbox, CheckboxGroup, InlineMessage, List, Modal } from '@navikt/ds-react'
import { Field, FieldProps, Form, Formik } from 'formik'
import moment from 'moment'
import { FunctionComponent, useEffect, useState } from 'react'

interface IProps {
  tiltak: ITiltak
  risikoscenarioList: IRisikoscenario[]
  noIverksattKommentar?: boolean
  etterlevelseDokumentasjonId?: string
}

const getRisikoscenarioHref = (
  risikoscenario: IRisikoscenario,
  etterlevelseDokumentasjonId?: string
): string | undefined => {
  if (risikoscenario.generelScenario) {
    return risikoscenarioUrl(risikoscenario.id, '6')
  }

  const relevantKrav = risikoscenario.relevanteKravNummer[0]
  if (!etterlevelseDokumentasjonId || !relevantKrav) {
    return undefined
  }

  return (
    risikoDokumentasjonTemaKravNummerVersjonUrl(
      etterlevelseDokumentasjonId,
      relevantKrav.temaCode || 'PVK',
      relevantKrav.kravNummer,
      relevantKrav.kravVersjon
    ) +
    '?risikoscenario=' +
    risikoscenario.id
  )
}

export const TiltakView = (props: IProps) => {
  const { tiltak, risikoscenarioList, noIverksattKommentar, etterlevelseDokumentasjonId } = props
  const [ansvarligView, setAnsvarligView] = useState<string>('')
  const today = new Date()

  useEffect(() => {
    ;(async () => {
      let ansvarlige = ''
      if (tiltak.ansvarligTeam && tiltak.ansvarligTeam.name) {
        ansvarlige += tiltak.ansvarligTeam.name
      }
      if (
        tiltak.ansvarlig &&
        tiltak.ansvarlig.fullName &&
        tiltak.ansvarligTeam &&
        tiltak.ansvarligTeam.name
      ) {
        ansvarlige += ', '
      }
      if (tiltak.ansvarlig && tiltak.ansvarlig.fullName) {
        ansvarlige += tiltak.ansvarlig.fullName
      }
      setAnsvarligView(ansvarlige)
    })()
  }, [tiltak])

  return (
    <div className='mb-5 mt-3'>
      {tiltak.risikoscenarioIds.length > 0 && (
        <div className='mb-3'>
          <ReadOnlyFieldDescriptionOptional
            label='Tiltaket er brukt ved følgende scenarioer:'
            description=''
            isVisible={tiltak.risikoscenarioIds.length === 1}
          />

          {risikoscenarioList && (
            <List as='ul'>
              {risikoscenarioList
                .filter((risikoscenario: IRisikoscenario) =>
                  tiltak.risikoscenarioIds.includes(risikoscenario.id)
                )
                .map((risikoscenario: IRisikoscenario) => {
                  const href = getRisikoscenarioHref(risikoscenario, etterlevelseDokumentasjonId)

                  return (
                    <List.Item key={risikoscenario.id}>
                      {href ? (
                        <ExternalLink href={href}>{risikoscenario.navn}</ExternalLink>
                      ) : (
                        risikoscenario.navn
                      )}
                    </List.Item>
                  )
                })}
            </List>
          )}
        </div>
      )}

      <ReadOnlyField
        label='Tiltaksbeskrivelse:'
        description={tiltak.beskrivelse}
        className='mb-3 flex gap-2'
      />

      <ReadOnlyFieldBool
        label='Tiltaksansvarlig:'
        description={ansvarligView}
        className='flex gap-2'
        isFalse={
          (!tiltak.ansvarligTeam ||
            (tiltak.ansvarligTeam && ['', null].includes(tiltak.ansvarligTeam.id))) &&
          (!tiltak.ansvarlig || (tiltak.ansvarlig && tiltak.ansvarlig.navIdent === ''))
        }
        descriptionFalse='Det er ikke satt en ansvarlig for tiltaket'
      />

      {!tiltak.iverksatt && (
        <ReadOnlyFieldBool
          label='Tiltaksfrist:'
          description={moment(tiltak.frist).format('LL')}
          className='mt-3 flex gap-2'
          isFalse={!tiltak.frist}
          descriptionFalse='Det er ikke satt en frist for tiltaket'
        />
      )}

      <div className='mt-3 mb-5'>
        {tiltak.iverksatt && tiltak.iverksattDato !== null && (
          <InlineMessage status='success'>
            Tiltaket ble markert som iverksatt {moment(tiltak.iverksattDato).format('LL')}
          </InlineMessage>
        )}

        {tiltak.iverksatt && tiltak.iverksattDato === null && (
          <InlineMessage status='success'>
            Tiltaket blir markert som iverksatt {moment(today).format('LL')}
          </InlineMessage>
        )}
      </div>

      {!noIverksattKommentar && (
        <div className='mt-3 mb-5'>
          {tiltak.iverksatt && (
            <ReadOnlyField
              label='Hvordan er tiltaket iverksatt :'
              description={tiltak.iverksettingsKommentar || 'Ikke lagt til kommentar'}
              className='mb-3 flex gap-2'
            />
          )}
        </div>
      )}
    </div>
  )
}

interface ITiltakViewWithIverksetting extends IProps {
  tiltakList: ITiltak[]
  setTiltakList: (state: ITiltak[]) => void
}

export const TiltakViewWithIverksetting: FunctionComponent<ITiltakViewWithIverksetting> = ({
  tiltak,
  risikoscenarioList,
  tiltakList,
  setTiltakList,
  etterlevelseDokumentasjonId,
}) => {
  const [isTiltakEditModalOpen, setIsTiltakEditModalOpen] = useState<boolean>(false)

  const submit = async (submitedValues: ITiltak) => {
    await updateTiltak(submitedValues)
      .then((response) => {
        setTiltakList(
          tiltakList.map((tiltak) => {
            if (tiltak.id === response.id) {
              return { ...response }
            } else {
              return tiltak
            }
          })
        )
      })
      .finally(() => {
        setIsTiltakEditModalOpen(false)
      })
  }

  return (
    <div>
      <TiltakView
        risikoscenarioList={risikoscenarioList}
        tiltak={tiltak}
        etterlevelseDokumentasjonId={etterlevelseDokumentasjonId}
      />
      <div className='my-5'>
        <Button
          variant='tertiary'
          size='small'
          type='button'
          icon={<PencilIcon title='' aria-hidden />}
          onClick={() => setIsTiltakEditModalOpen(true)}
        >
          Endre iverksatt tilstand
        </Button>
        {isTiltakEditModalOpen && (
          <Modal
            open={isTiltakEditModalOpen}
            onClose={() => setIsTiltakEditModalOpen(false)}
            header={{ heading: 'Endre iverksatt tilstand' }}
          >
            <Formik
              onSubmit={submit}
              initialValues={mapTiltakToFormValue({
                ...tiltak,
                pvkDokumentId: tiltak.pvkDokumentId,
              })}
            >
              {({ values, resetForm, submitForm }) => (
                <Form>
                  <Modal.Body>
                    <ReadOnlyField
                      label='Tiltak:'
                      description={tiltak.navn}
                      className='my-3 flex gap-2'
                    />

                    <TiltakView
                      risikoscenarioList={risikoscenarioList}
                      tiltak={tiltak}
                      etterlevelseDokumentasjonId={etterlevelseDokumentasjonId}
                    />

                    <div className='mb-5'>
                      <Field name='iverksatt'>
                        {(fieldProps: FieldProps) => (
                          <CheckboxGroup
                            legend=''
                            hideLegend
                            value={fieldProps.field.value ? ['iverksatt'] : []}
                            onChange={(value) => {
                              const fieldValue: boolean = value.length > 0
                              fieldProps.form.setFieldValue('iverksatt', fieldValue)
                            }}
                          >
                            <Checkbox value='iverksatt'>Marker tiltaket som iverksatt</Checkbox>
                          </CheckboxGroup>
                        )}
                      </Field>
                    </div>

                    {values.iverksatt && (
                      <TextAreaField
                        label='Beskriv nærmere hvordan tiltaket er iverksatt (valgfritt)'
                        name='iverksettingsKommentar'
                        rows={3}
                        noPlaceholder
                        marginBottom
                      />
                    )}
                  </Modal.Body>
                  <Modal.Footer>
                    <Button
                      type='button'
                      onClick={async () => {
                        await submitForm()
                      }}
                    >
                      Lagre tiltak
                    </Button>
                    <Button
                      type='button'
                      variant='secondary'
                      onClick={() => {
                        resetForm()
                        setIsTiltakEditModalOpen(false)
                      }}
                    >
                      Avbryt
                    </Button>
                  </Modal.Footer>
                </Form>
              )}
            </Formik>
          </Modal>
        )}
      </div>
    </div>
  )
}
export default TiltakView
