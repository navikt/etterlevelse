'use client'

import { getEtterlevelserByKravNumberKravVersion } from '@/api/etterlevelse/etterlevelseApi'
import { kravMapToFormVal, updateKrav } from '@/api/krav/kravApi'
import { TextAreaField } from '@/components/common/textAreaField/textAreaField'
import { PageLayout } from '@/components/others/scaffold/scaffold'
import { IPageResponse } from '@/constants/commonConstants'
import { IEtterlevelse } from '@/constants/etterlevelseDokumentasjon/etterlevelse/etterlevelseConstants'
import { EListName, ICode, TLovCode } from '@/constants/kodeverk/kodeverkConstants'
import { EKravStatus, IKrav, IKravVersjon, TKravQL } from '@/constants/krav/kravConstants'
import { CodelistContext } from '@/provider/kodeverk/kodeverkProvider'
import { kravNummerVersjonUrl } from '@/routes/krav/kravRoutes'
import { kravEditValidation } from '@/test/validation/kravEditValidation'
import { kravBreadCrumbPath } from '@/util/breadCrumbPath/breadCrumbPath'
import { Heading } from '@navikt/ds-react'
import { Form, Formik } from 'formik'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { useRouter } from 'next/navigation'
import { FunctionComponent, useContext, useState } from 'react'
import { KravFormFields } from '../../form/kravFormFields/kravFormFields'
import ErrorModal from '../errorModal/errorModal'
import { KravEditButtons } from '../kravEditButtons/kravEditButtons'

type TProps = {
  krav: TKravQL
  alleKravVersjoner: IKravVersjon[]
  isEditingUtgaattKrav: any
}

export const KravEdit: FunctionComponent<TProps> = ({
  krav,
  alleKravVersjoner,
  isEditingUtgaattKrav,
}) => {
  const router: AppRouterInstance = useRouter()
  const [varselMeldingActive, setVarselMeldingActive] = useState<string[]>(
    krav?.varselMelding ? ['VarselMelding'] : []
  )

  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorModalMessage, setErrorModalMessage] = useState('')
  const codelist = useContext(CodelistContext)

  const close = (krav: IKrav): void => {
    if (krav) {
      router.push(kravNummerVersjonUrl(krav.kravNummer, krav.kravVersjon))
    }
  }

  const submit = async (krav: TKravQL): Promise<void> => {
    const regelverk: TLovCode = codelist.utils.getCode(
      EListName.LOV,
      krav.regelverk[0]?.lov.code
    ) as TLovCode
    const underavdeling: ICode = codelist.utils.getCode(
      EListName.UNDERAVDELING,
      regelverk?.data?.underavdeling
    ) as ICode
    const mutatedKrav: TKravQL = {
      ...krav,
      underavdeling: underavdeling as ICode | undefined,
      varselMelding: varselMeldingActive ? krav.varselMelding : undefined,
    }

    const etterlevelser: IPageResponse<IEtterlevelse> =
      await getEtterlevelserByKravNumberKravVersion(krav.kravNummer, krav.kravVersjon)
    if (etterlevelser.totalElements > 0 && krav.status === EKravStatus.UTKAST) {
      setErrorModalMessage(
        'Du kan ikke sette dette kravet til «Utkast» fordi det er minst en etterlevelse som bruker kravet i sin dokumentasjon.'
      )
      setShowErrorModal(true)
    } else if (krav.id) {
      close(await updateKrav(mutatedKrav))
      setVarselMeldingActive(mutatedKrav.varselMelding ? ['VarselMelding'] : [])
    }
  }

  return (
    <PageLayout
      pageTitle='Rediger krav'
      currentPage='Rediger krav'
      breadcrumbPaths={[kravBreadCrumbPath]}
      key={`K${krav?.kravNummer}${krav?.kravVersjon}`}
    >
      <div>
        <Formik
          initialValues={kravMapToFormVal(krav as TKravQL)}
          onSubmit={submit}
          validationSchema={kravEditValidation({ alleKravVersjoner, isEditingUtgaattKrav })}
          validateOnChange={false}
          validateOnBlur={false}
        >
          {({ values, errors, isSubmitting, submitForm, initialValues, setFieldValue }) => (
            <Form>
              <div>
                <div className='w-full'>
                  <Heading level='1' size='medium'>
                    Rediger krav
                  </Heading>
                  <Heading level='2' size='small'>
                    {`K${krav.kravNummer}.${krav.kravVersjon} ${krav.navn}`}
                  </Heading>
                </div>
                <KravFormFields
                  mode='edit'
                  kravVersjon={values.kravVersjon}
                  errors={errors}
                  varselMeldingActive={varselMeldingActive}
                  setVarselMeldingActive={setVarselMeldingActive}
                  isEditingUtgaattKrav={isEditingUtgaattKrav}
                />
                <KravEditButtons
                  krav={krav}
                  values={values}
                  setFieldValue={setFieldValue}
                  isSubmitting={isSubmitting}
                  submitForm={submitForm}
                  initialValues={initialValues}
                />
                <div className='py-12'>
                  <TextAreaField
                    label='Notater (Kun synlig for kraveier)'
                    name='notat'
                    height='15.625rem'
                    markdown
                  />
                </div>
                <ErrorModal
                  isOpen={showErrorModal}
                  errorMessage={errorModalMessage}
                  submit={setShowErrorModal}
                />
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </PageLayout>
  )
}
