import { getKravByKravNumberAndVersion, kravMapToFormVal, updateKrav } from '@/api/krav/kravApi'
import { TextAreaField } from '@/components/common/textAreaField/textAreaField'
import { ContentLayout } from '@/components/others/layout/content/content'
import { EKravStatus, IKrav, TKravQL } from '@/constants/krav/kravConstants'
import { kravNummerVersjonUrl } from '@/routes/krav/kravRoutes'
import { kravlisteUrl } from '@/routes/krav/kraveier/kraveierRoutes'
import { user } from '@/services/user/userService'
import { Button } from '@navikt/ds-react'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { useRouter } from 'next/navigation'
import { FunctionComponent, useState } from 'react'
import { KravStandardButtons } from '../../edit/kravStandardButtons/kravStandardButtons'
import { KravEditStatusModal } from '../kravEditStatusModal/kravEditStatusModal'

type TProps = {
  krav: IKrav
  values: TKravQL
  isSubmitting: boolean
  submitForm: (() => Promise<void>) & (() => Promise<any>)
  initialValues: TKravQL
}

export const KravEditButtons: FunctionComponent<TProps> = ({
  krav,
  values,
  isSubmitting,
  submitForm,
  initialValues,
}) => {
  const router: AppRouterInstance = useRouter()

  const [utgaattKravMessage, setUtgaattKravMessage] = useState<boolean>(false)
  const [aktivKravMessage, setAktivKravMessage] = useState<boolean>(false)

  return (
    <div className='button_container flex flex-col mt-5 py-4 px-4 sticky bottom-0 border-t-2 z-10 bg-white'>
      <div className='flex w-full flex-row-reverse'>
        <KravStandardButtons
          submitCancelButton={() => {
            if (krav.kravNummer && krav.kravVersjon) {
              router.push(kravNummerVersjonUrl(krav.kravNummer, krav.kravVersjon))
            } else {
              router.push(kravlisteUrl())
            }
          }}
          submitSaveButton={() => {
            values.status = krav.status
            submitForm()
          }}
          kravStatus={krav.status}
          submitAktivButton={() => {
            values.status = EKravStatus.AKTIV
            submitForm()
          }}
          isSubmitting={isSubmitting}
        />
        <ContentLayout>
          {krav.status === EKravStatus.AKTIV && (
            <div className='mr-2'>
              <Button
                variant='secondary'
                onClick={() => {
                  values.status = EKravStatus.UTGAATT
                  setUtgaattKravMessage(true)
                }}
                disabled={isSubmitting}
                type='button'
              >
                Sett kravet til utgått
              </Button>
            </div>
          )}

          {user.isAdmin() && krav.status === EKravStatus.UTGAATT && (
            <div className='mr-2'>
              <Button
                variant='secondary'
                onClick={() => setAktivKravMessage(true)}
                disabled={isSubmitting}
                type='button'
              >
                Sett versjonen til aktiv
              </Button>
            </div>
          )}

          {user.isAdmin() && krav.status !== EKravStatus.UTKAST && (
            <div className='mr-2'>
              <Button
                variant='secondary'
                onClick={() => {
                  values.status = EKravStatus.UTKAST
                  submitForm()
                }}
                disabled={isSubmitting}
                type='button'
              >
                Sett kravet til utkast
              </Button>
            </div>
          )}

          <KravEditStatusModal
            status='utgått'
            open={utgaattKravMessage}
            brukerBeskjed='Denne handligen kan ikke reverseres'
            setKravMessage={() => {
              values.status = initialValues.status
              setUtgaattKravMessage(false)
            }}
            formComponent={
              <TextAreaField
                label='Beskriv hvorfor kravet er utgått'
                name='beskrivelse'
                height='15.625rem'
                markdown
              />
            }
          >
            <Button
              type='button'
              className='mr-4'
              variant='primary'
              onClick={() => {
                submitForm()

                if (values.beskrivelse) {
                  setUtgaattKravMessage(false)
                }
              }}
            >
              Ja, sett til utgått
            </Button>
          </KravEditStatusModal>

          <KravEditStatusModal
            status='aktiv'
            open={aktivKravMessage}
            brukerBeskjed='Kravet har en nyere versjon som settes til utkast'
            setKravMessage={() => setAktivKravMessage(false)}
          >
            <Button
              type='button'
              variant='primary'
              onClick={async () => {
                const newVersionOfKrav: IKrav | undefined = await getKravByKravNumberAndVersion(
                  krav.kravNummer,
                  krav.kravVersjon + 1
                )
                if (newVersionOfKrav) {
                  updateKrav(
                    kravMapToFormVal({
                      ...newVersionOfKrav,
                      status: EKravStatus.UTKAST,
                    }) as TKravQL
                  ).then(() => {
                    values.status = EKravStatus.AKTIV
                    submitForm()
                    setAktivKravMessage(false)
                  })
                } else {
                  values.status = EKravStatus.AKTIV
                  submitForm()
                  setAktivKravMessage(false)
                }
              }}
            >
              Ja, sett til aktiv
            </Button>
          </KravEditStatusModal>
        </ContentLayout>
      </div>
    </div>
  )
}
