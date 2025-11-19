'use client'

import { getPvkDokument } from '@/api/pvkDokument/pvkDokumentApi'
import {
  createPvoTilbakemelding,
  getPvoTilbakemeldingByPvkDokumentId,
  mapPvoTilbakemeldingToFormValue,
  updatePvoTilbakemelding,
} from '@/api/pvoTilbakemelding/pvoTilbakemeldingApi'
import { searchResourceByNameOptions } from '@/api/teamkatalogen/teamkatalogenApi'
import { DropdownIndicator } from '@/components/common/dropdownIndicator/dropdownIndicator'
import LabelWithTooltip from '@/components/common/labelWithoTootip.tsx/LabelWithTooltip'
import { RenderTagList } from '@/components/common/renderTagList/renderTagList'
import {
  EPvkDokumentStatus,
  IPvkDokument,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import {
  EPvoTilbakemeldingStatus,
  IPvoTilbakemelding,
  IVurdering,
} from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { ITeamResource } from '@/constants/teamkatalogen/teamkatalogConstants'
import { UserContext } from '@/provider/user/userProvider'
import { env } from '@/util/env/env'
import { createNewPvoVurderning } from '@/util/pvoTilbakemelding/pvoTilbakemeldingUtils'
import { noOptionMessage, selectOverrides } from '@/util/search/searchUtil'
import { Button, Heading, ReadMore, Select, TextField } from '@navikt/ds-react'
import { AxiosError } from 'axios'
import { FieldArray, FieldArrayRenderProps, Form, Formik } from 'formik'
import { ChangeEvent, FunctionComponent, RefObject, useContext, useState } from 'react'
import AsyncSelect from 'react-select/async'
import AlertPvoModal from '../common/alertPvoModal'

type TProps = {
  pvkDokument: IPvkDokument
  pvoTilbakemelding: IPvoTilbakemelding
  initialValue: IVurdering
  formRef: RefObject<any>
}

export const PvoTilbakemeldingAnsvarligForm: FunctionComponent<TProps> = ({
  pvkDokument,
  pvoTilbakemelding,
  initialValue,
  formRef,
}) => {
  const [customPersonForDev, setCustomPersonForDev] = useState<string>('')
  const [isAlertModalOpen, setIsAlertModalOpen] = useState<boolean>(false)
  const [selectedStatus, setSelectedStatus] = useState<EPvoTilbakemeldingStatus>(
    pvoTilbakemelding.status
  )
  const user = useContext(UserContext)

  const submit = async (submitedVurderingValues: IVurdering): Promise<void> => {
    let pvkStatus = ''

    await getPvkDokument(pvkDokument.id).then((response) => {
      pvkStatus = response.status
    })

    if (
      ![
        EPvkDokumentStatus.SENDT_TIL_PVO,
        EPvkDokumentStatus.PVO_UNDERARBEID,
        EPvkDokumentStatus.SENDT_TIL_PVO_FOR_REVURDERING,
      ].includes(pvkStatus as EPvkDokumentStatus)
    ) {
      setIsAlertModalOpen(true)
    } else {
      await getPvoTilbakemeldingByPvkDokumentId(pvkDokument.id)
        .then(async (response: IPvoTilbakemelding) => {
          if (response) {
            if (response.status === EPvoTilbakemeldingStatus.FERDIG) {
              setIsAlertModalOpen(true)
            } else {
              if (
                !response.vurderinger.find(
                  (vurdering) => vurdering.innsendingId === pvkDokument.antallInnsendingTilPvo
                )
              ) {
                response.vurderinger.push(
                  createNewPvoVurderning(pvkDokument.antallInnsendingTilPvo)
                )
              }

              const updatedValues: IPvoTilbakemelding = {
                ...response,
                vurderinger: response.vurderinger.map((vurdering) => {
                  if (vurdering.innsendingId === submitedVurderingValues.innsendingId) {
                    return {
                      ...vurdering,
                      ansvarligData: submitedVurderingValues.ansvarligData,
                    }
                  } else {
                    return vurdering
                  }
                }),
                status:
                  pvkDokument.antallInnsendingTilPvo > 1 &&
                  selectedStatus === EPvoTilbakemeldingStatus.IKKE_PABEGYNT
                    ? EPvoTilbakemeldingStatus.TRENGER_REVURDERING
                    : selectedStatus,
              }
              await updatePvoTilbakemelding(updatedValues).then(() => window.location.reload())
            }
          }
        })
        .catch(async (error: AxiosError) => {
          if (error.status === 404) {
            const newVurdering = createNewPvoVurderning(1)
            const createValue = mapPvoTilbakemeldingToFormValue({
              pvkDokumentId: pvkDokument.id,
              vurderinger: [
                {
                  ...newVurdering,
                  ansvarligData: submitedVurderingValues.ansvarligData,
                },
              ],
              status: pvoTilbakemelding.status,
            })
            await createPvoTilbakemelding(createValue).then(() => window.location.reload())
          } else {
            console.debug(error)
          }
        })
    }
  }

  return (
    <Formik
      validateOnChange={false}
      validateOnBlur={false}
      onSubmit={(values: IVurdering) => {
        submit(values)
      }}
      initialValues={initialValue}
      innerRef={formRef}
    >
      {({ submitForm }) => (
        <Form>
          <div className='flex flex-col gap-2'>
            <Heading level='2' size='medium'>
              Legg til ansvarlig
            </Heading>
            <div id='ansvarligData' className='flex flex-col lg:flex-row gap-5 mb-5'>
              <FieldArray name='ansvarligData'>
                {(fieldArrayRenderProps: FieldArrayRenderProps) => (
                  <div className='flex-1'>
                    <LabelWithTooltip label='Søk etter person' tooltip='' />
                    <div className='w-full'>
                      <AsyncSelect
                        aria-label='Søk etter person'
                        placeholder=''
                        components={{ DropdownIndicator }}
                        noOptionsMessage={({ inputValue }) => {
                          return noOptionMessage(inputValue)
                        }}
                        controlShouldRenderValue={false}
                        loadingMessage={() => 'Søker...'}
                        isClearable={false}
                        loadOptions={searchResourceByNameOptions}
                        onChange={(value: any) => {
                          if (
                            value &&
                            fieldArrayRenderProps.form.values.ansvarligData.filter(
                              (team: ITeamResource) => team.navIdent === value.navIdent
                            ).length === 0
                          ) {
                            fieldArrayRenderProps.push(value)
                          }
                        }}
                        styles={selectOverrides}
                      />
                      <RenderTagList
                        list={fieldArrayRenderProps.form.values.ansvarligData.map(
                          (resource: ITeamResource) => resource.fullName
                        )}
                        onRemove={fieldArrayRenderProps.remove}
                      />
                    </div>

                    {env.isDev && (
                      <ReadMore header='Hva hvis jeg ikke finner person'>
                        <div className='flex gap-2 items-end my-2'>
                          <TextField
                            label='Skriv inn Nav ident dersom du ikke finner person over'
                            value={customPersonForDev}
                            onChange={(event: ChangeEvent<HTMLInputElement>) =>
                              setCustomPersonForDev(event.target.value)
                            }
                          />
                          <div>
                            <Button
                              type='button'
                              onClick={() => {
                                fieldArrayRenderProps.push({
                                  navIdent: customPersonForDev,
                                  givenName: customPersonForDev,
                                  familyName: customPersonForDev,
                                  fullName: customPersonForDev,
                                  email: customPersonForDev,
                                  resourceType: customPersonForDev,
                                })
                              }}
                            >
                              Legg til
                            </Button>
                          </div>
                        </div>
                        <RenderTagList
                          list={fieldArrayRenderProps.form.values.ansvarligData.map(
                            (resource: ITeamResource) => resource.fullName
                          )}
                          onRemove={fieldArrayRenderProps.remove}
                        />
                      </ReadMore>
                    )}
                  </div>
                )}
              </FieldArray>
              <div className='flex-1' />
            </div>

            <AlertPvoModal
              isOpen={isAlertModalOpen}
              onClose={() => setIsAlertModalOpen(false)}
              pvkDokumentId={pvkDokument.id}
            />

            <div id='status' className='mb-5'>
              <Select
                label='Velg status'
                value={selectedStatus}
                onChange={(event: ChangeEvent<HTMLSelectElement>) => {
                  setSelectedStatus(event.target.value as EPvoTilbakemeldingStatus)
                }}
              >
                <option value={EPvoTilbakemeldingStatus.IKKE_PABEGYNT}>Ikke påbegynt</option>
                <option value={EPvoTilbakemeldingStatus.UNDERARBEID}>Påbegynt</option>
                <option value={EPvoTilbakemeldingStatus.AVVENTER}>Aventer</option>
                <option value={EPvoTilbakemeldingStatus.SNART_FERDIG}>Snart Ferdig</option>
                <option value={EPvoTilbakemeldingStatus.TIL_KONTROL}>PVO øvrig beslutning</option>
                <option value={EPvoTilbakemeldingStatus.UTGAAR}>Utgår</option>
                {user.isAdmin() && (
                  <option value={EPvoTilbakemeldingStatus.TRENGER_REVURDERING}>
                    Trenger redvurdering
                  </option>
                )}
              </Select>
            </div>

            <div className='flex gap-2'>
              <div>
                <Button size='small' type='button' onClick={submitForm}>
                  Lagre
                </Button>
              </div>
              <div>
                <Button
                  size='small'
                  type='button'
                  variant='secondary'
                  onClick={() => {
                    window.location.reload()
                  }}
                >
                  Forkast endringer
                </Button>
              </div>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  )
}
