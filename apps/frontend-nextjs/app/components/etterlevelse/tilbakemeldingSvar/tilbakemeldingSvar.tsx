'use client'

import {
  tilbakemeldingNewMelding,
  tilbakemeldingSlettMelding,
  updateTilbakemeldingStatusOgEndretKrav,
} from '@/api/krav/tilbakemelding/tilbakemeldingApi'
import PersonNavn from '@/components/common/personNavn/personNavn'
import {
  ETilbakemeldingMeldingStatus,
  ITilbakemelding,
  ITilbakemeldingNewMeldingRequest,
} from '@/constants/krav/tilbakemelding/tilbakemeldingConstants'
import { UserContext } from '@/provider/user/userProvider'
import { getMelderInfo } from '@/util/krav/tilbakemelding/kravTilbakemeldingUtils'
import {
  getParsedOptionsforTilbakeMelding,
  getTilbakeMeldingStatusToOption,
} from '@/util/tilbakemelding/tilbakemeldingUtils'
import { TrashIcon } from '@navikt/aksel-icons'
import {
  Alert,
  BodyLong,
  BodyShort,
  Button,
  Checkbox,
  Heading,
  Label,
  Loader,
  Modal,
  Select,
  Textarea,
} from '@navikt/ds-react'
import moment from 'moment'
import { useContext, useState } from 'react'

type TTilbakemeldingSvarProps = {
  tilbakemelding: ITilbakemelding
  setFokusNummer: (fokusNummer: string | undefined) => void
  close: (tilbakemelding: ITilbakemelding) => void
  ubesvartOgKraveier: boolean
  remove: (tilbakemelding: ITilbakemelding) => void
  replace: (tilbakemelding: ITilbakemelding) => void
}
const TilbakemeldingSvar = ({
  tilbakemelding,
  setFokusNummer,
  close,
  ubesvartOgKraveier,
  remove,
  replace,
}: TTilbakemeldingSvarProps) => {
  const user = useContext(UserContext)
  const [response, setResponse] = useState('')
  const [error, setError] = useState()
  const [loading, setLoading] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [tilbakeMeldingStatus, setTilbakemeldingStatus] = useState<ETilbakemeldingMeldingStatus>(
    tilbakemelding.status || ETilbakemeldingMeldingStatus.UBESVART
  )
  const [isEndretKrav, setIsEndretKrav] = useState<boolean>(tilbakemelding.endretKrav || false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false)
  const melderInfo = getMelderInfo(tilbakemelding, user.getIdent(), user.isKraveier())
  const [replyRole] = useState(melderInfo.rolle)

  const submit = () => {
    if (response) {
      setFokusNummer(tilbakemelding.id)

      const request: ITilbakemeldingNewMeldingRequest = {
        tilbakemeldingId: tilbakemelding.id,
        rolle: replyRole,
        melding: response,
        status: tilbakeMeldingStatus,
        endretKrav: isEndretKrav,
      }

      setLoading(true)

      tilbakemeldingNewMelding(request)
        .then((tilbakemelding: ITilbakemelding) => {
          close(tilbakemelding)
          setLoading(false)
          setResponse('')
        })
        .catch((error: any) => {
          setError(error.error)
          setLoading(false)
        })
    }
  }

  return (
    <div className='w-full'>
      {(melderInfo.kanSkrive || user.isKraveier()) && (
        <Heading size='medium' className='mb-2 mt-8'>
          {ubesvartOgKraveier ? 'Besvar' : 'Ny melding'}
        </Heading>
      )}

      {user.isKraveier() && (
        <div>
          <div className='w-fit mb-2'>
            <Checkbox value={isEndretKrav} onChange={() => setIsEndretKrav(!isEndretKrav)}>
              Tilbakemelding har ført til kravendring
            </Checkbox>
          </div>
          <div className='flex items-center mb-2'>
            <Label className='mr-2 w-fit'>Velg spørsmål status:</Label>
            <Select
              label='Velg spørsmål status'
              hideLabel
              value={getTilbakeMeldingStatusToOption(tilbakeMeldingStatus)[0].id}
              onChange={(e) => {
                setTilbakemeldingStatus(e.target.value as ETilbakemeldingMeldingStatus)
              }}
            >
              {getParsedOptionsforTilbakeMelding().map(
                (
                  option: {
                    id: ETilbakemeldingMeldingStatus
                    label: string
                  },
                  index: number
                ) => (
                  <option key={`${index}_${option.label}`} value={option.id}>
                    {option.label}
                  </option>
                )
              )}
            </Select>
          </div>
        </div>
      )}
      <div className='flex w-full items-end justify-center'>
        {(melderInfo.kanSkrive || user.isKraveier()) && (
          <Textarea
            className='w-full'
            label='Ny tilbakemelding'
            hideLabel
            minRows={6}
            onChange={(e) => setResponse((e.target as HTMLTextAreaElement).value)}
            value={response}
            disabled={loading}
          />
        )}
        {deleteModal && (
          <Modal
            open={deleteModal}
            onClose={() => setDeleteModal(false)}
            header={{
              heading: 'Er du sikker på at du vil slette hele meldingen?',
              closeButton: false,
            }}
          >
            <Modal.Body>
              <BodyShort className='flex'>
                {moment(tilbakemelding.meldinger[0].tid).format('LL')}
                <div className='ml-1'>
                  <PersonNavn ident={tilbakemelding.meldinger[0].fraIdent} />
                </div>
              </BodyShort>
              <BodyLong>{tilbakemelding.meldinger[0].innhold}</BodyLong>
            </Modal.Body>
            <Modal.Footer>
              <Button variant='secondary' onClick={() => setDeleteModal(false)}>
                Avbryt
              </Button>
              <Button
                className='ml-2.5'
                onClick={() =>
                  tilbakemeldingSlettMelding({
                    tilbakemeldingId: tilbakemelding.id,
                    meldingNr: 1,
                  }).then((tilbakemelding: ITilbakemelding) => {
                    remove({ ...tilbakemelding, meldinger: [] })
                    setDeleteModal(false)
                  })
                }
              >
                Slett
              </Button>
            </Modal.Footer>
          </Modal>
        )}
      </div>
      <div className='flex mt-2 w-full'>
        {user.isAdmin() && (
          <Button
            icon={<TrashIcon aria-label='' aria-hidden />}
            variant='secondary'
            onClick={() => setDeleteModal(true)}
          >
            Slett hele samtalen
          </Button>
        )}
        {/* {user.isKraveier() && !loading && melderInfo.melder && (
              <Block marginBottom={theme.sizing.scale400} display="flex" flexDirection="column">
                <Button
                  size="compact"
                  icon={faSync}
                  kind={'secondary'}
                  onClick={() => setReplyRole(replyRole === TilbakemeldingRolle.MELDER ? TilbakemeldingRolle.KRAVEIER : TilbakemeldingRolle.MELDER)}
                >
                  Jeg er {rolleText(replyRole)}
                </Button>
              </Block>
            )} */}
        {loading && (
          <div className='self-center ml-2.5'>
            <Loader size='large' />
          </div>
        )}

        {(melderInfo.kanSkrive || user.isKraveier()) && (
          <div className='flex flex-1 justify-end'>
            {user.isKraveier() && (
              <div>
                {isUpdatingStatus ? (
                  <div className='self-center ml-2.5'>
                    <Loader size='large' />
                  </div>
                ) : (
                  <Button
                    variant='secondary'
                    className='ml-2.5'
                    onClick={() => {
                      setIsUpdatingStatus(true)
                      updateTilbakemeldingStatusOgEndretKrav({
                        tilbakemeldingId: tilbakemelding.id,
                        status: tilbakeMeldingStatus,
                        endretKrav: isEndretKrav,
                      })
                        .then((response: ITilbakemelding) => {
                          replace(response)
                          setIsUpdatingStatus(false)
                        })
                        .catch(() => setIsUpdatingStatus(false))
                    }}
                  >
                    Oppdater status
                  </Button>
                )}
              </div>
            )}
            <Button className='ml-2.5' disabled={!response} onClick={submit}>
              {ubesvartOgKraveier ? 'Svar' : 'Send'}
              {user.isKraveier() ? ' og oppdater status' : ''}
            </Button>
          </div>
        )}
      </div>
      {error && <Alert variant='error'>{error}</Alert>}
    </div>
  )
}

export default TilbakemeldingSvar
