'use client'

import { mapTiltakToFormValue, updateTiltak } from '@/api/tiltak/tiltakApi'
import ReadOnlyField, {
  ReadOnlyFieldBool,
  ReadOnlyFieldDescriptionOptional,
} from '@/components/common/readOnlyFields'
import { IRisikoscenario } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { ITiltak } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/tiltak/tiltakConstants'
import { PencilIcon } from '@navikt/aksel-icons'
import { Alert, Button, Checkbox, CheckboxGroup, List, Modal } from '@navikt/ds-react'
import { Field, FieldProps, Form, Formik } from 'formik'
import moment from 'moment'
import { FunctionComponent, useEffect, useState } from 'react'

interface IProps {
  tiltak: ITiltak
  risikoscenarioList: IRisikoscenario[]
}

export const TiltakView = (props: IProps) => {
  const { tiltak, risikoscenarioList } = props
  const [ansvarligView, setAnsvarligView] = useState<string>('')

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
    <div className='mb-5'>
      <ReadOnlyField
        label='Tiltaksbeskrivelse:'
        description={tiltak.beskrivelse}
        className='my-3 flex gap-2'
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

      {tiltak.risikoscenarioIds.length > 1 && (
        <div className='mt-3'>
          <ReadOnlyFieldDescriptionOptional
            label='Tiltaket er gjenbrukt ved følgende scenarioer:'
            description='Tiltaket er ikke gjenbrukt ved andre risikoscenarioer'
            isVisible={tiltak.risikoscenarioIds.length === 1}
          />

          {tiltak.risikoscenarioIds.length > 1 && risikoscenarioList && (
            <List as='ul'>
              {risikoscenarioList
                .filter((risikoscenario) => tiltak.risikoscenarioIds.includes(risikoscenario.id))
                .map((risikoscenario) => (
                  <List.Item key={risikoscenario.id}>{risikoscenario.navn}</List.Item>
                ))}
            </List>
          )}
        </div>
      )}
      <div className='mt-3 mb-5'>
        {tiltak.iverksatt && (
          <Alert variant='success' inline>
            Tiltaket ble markert som iverksatt {moment(tiltak.iverksattDato).format('LL')}
          </Alert>
        )}
      </div>
    </div>
  )
}

interface tilakViewWithIverksetting extends IProps {
  tiltakList: ITiltak[]
  setTiltakList: (state: ITiltak[]) => void
}

export const TiltakViewWithIverksetting: FunctionComponent<tilakViewWithIverksetting> = ({
  tiltak,
  risikoscenarioList,
  tiltakList,
  setTiltakList,
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
      <TiltakView risikoscenarioList={risikoscenarioList} tiltak={tiltak} />
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
              {({ resetForm, submitForm }) => (
                <Form>
                  <Modal.Body>
                    <ReadOnlyField
                      label='Tiltak:'
                      description={tiltak.navn}
                      className='my-3 flex gap-2'
                    />

                    <TiltakView risikoscenarioList={risikoscenarioList} tiltak={tiltak} />

                    <div className='mb-5'>
                      <Field name='iverksatt'>
                        {(fieldProps: FieldProps) => (
                          <CheckboxGroup
                            legend=''
                            hideLegend
                            value={fieldProps.field.value ? ['iverksatt'] : []}
                            onChange={(value) => {
                              const fieldValue: boolean = value.length > 0 ? true : false
                              fieldProps.form.setFieldValue('iverksatt', fieldValue)
                            }}
                          >
                            <Checkbox value='iverksatt'>Marker tiltaket som iverksatt</Checkbox>
                          </CheckboxGroup>
                        )}
                      </Field>
                    </div>
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
