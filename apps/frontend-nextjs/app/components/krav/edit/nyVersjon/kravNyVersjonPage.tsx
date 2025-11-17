'use client'

import { GetKravData } from '@/api/krav/edit/kravEditApi'
import { createKrav, kravMapToFormVal } from '@/api/krav/kravApi'
import { FormError } from '@/components/common/modalSchema/formError/formError'
import { TextAreaField } from '@/components/common/textAreaField/textAreaField'
import { ContentLayout } from '@/components/others/layout/content/content'
import { PageLayout } from '@/components/others/scaffold/scaffold'
import { EListName, ICode, TLovCode } from '@/constants/kodeverk/kodeverkConstants'
import { IKravDataProps, TKravById } from '@/constants/krav/edit/kravEditConstant'
import { EKravStatus, IKrav, TKravQL } from '@/constants/krav/kravConstants'
import { CodelistContext } from '@/provider/kodeverk/kodeverkProvider'
import { kravNummerVersjonUrl } from '@/routes/krav/kravRoutes'
import { kravNewVersionValidation } from '@/test/krav/schemaValidation/kravSchemaValidation'
import { kravBreadCrumbPath } from '@/util/breadCrumbPath/breadCrumbPath'
import { Alert, Heading, Loader } from '@navikt/ds-react'
import { Form, Formik } from 'formik'
import { Params } from 'next/dist/server/request/params'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { useParams, useRouter } from 'next/navigation'
import { useContext, useEffect, useState } from 'react'
import { KravFormFields } from '../form/kravFormFields/kravFormFields'
import { KravStandardButtons } from '../form/kravStandardButtons/kravStandardButtons'

export const KravNyVersjonPage = () => {
  const router: AppRouterInstance = useRouter()
  const params: Params = useParams()
  const [krav, setKrav] = useState<TKravQL | undefined>()
  const [varselMeldingActive, setVarselMeldingActive] = useState<string[]>(
    krav?.varselMelding ? ['VarselMelding'] : []
  )

  const kravData: IKravDataProps | undefined = GetKravData(params)
  const kravQuery: TKravById | undefined = kravData?.kravQuery
  const kravLoading: boolean | undefined = kravData?.kravLoading
  const codelist = useContext(CodelistContext)

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
      underavdeling: underavdeling as ICode,
      varselMelding: varselMeldingActive ? krav.varselMelding : undefined,
    }
    close(await createKrav(mutatedKrav))
    setVarselMeldingActive(mutatedKrav.varselMelding ? ['VarselMelding'] : [])
  }

  const close = (krav: IKrav): void => {
    if (krav) {
      router.push(kravNummerVersjonUrl(krav.kravNummer, krav.kravVersjon))
    }
  }

  useEffect(() => {
    if (kravQuery?.kravById)
      setKrav({
        ...kravQuery.kravById,
        id: '',
        kravVersjon: kravQuery.kravById.kravVersjon + 1,
        nyKravVersjon: true,
        status: EKravStatus.UTKAST,
      })
  }, [kravQuery])

  return (
    <>
      {krav && (
        <PageLayout
          pageTitle='Rediger krav'
          currentPage='Rediger krav'
          breadcrumbPaths={[kravBreadCrumbPath]}
          key={`K${krav?.kravNummer}/${krav?.kravVersjon}`}
        >
          {kravLoading && (
            <div className='w-full flex items-center flex-col'>
              <Loader size='3xlarge' />{' '}
            </div>
          )}

          <div>
            <Formik
              initialValues={kravMapToFormVal({ ...krav, versjonEndringer: '' })}
              onSubmit={submit}
              validationSchema={kravNewVersionValidation()}
              validateOnChange={false}
              validateOnBlur={false}
            >
              {({ values, errors, isSubmitting, submitForm }) => (
                <Form>
                  <div>
                    <div className='w-full'>
                      <Heading level='1' size='medium'>
                        Ny versjon
                      </Heading>
                      <Heading
                        level='2'
                        size='small'
                      >{`K${krav?.kravNummer}.${krav?.kravVersjon} ${krav?.navn}`}</Heading>
                      <Alert variant='warning'>
                        <Heading spacing size='small' level='3'>
                          Sikker på at du vil opprette en ny versjon?
                        </Heading>
                        Ny versjon av kravet skal opprettes når det er{' '}
                        <strong>vesentlige endringer</strong> i kravet som gjør at{' '}
                        <strong>teamene må revurdere</strong> sin besvarelse av kravet. Ved alle
                        mindre justeringer, endre i det aktive kravet, og da slipper teamene å
                        revurdere sin besvarelse.
                      </Alert>
                    </div>

                    <KravFormFields
                      mode='edit'
                      kravVersjon={values.kravVersjon}
                      errors={errors}
                      varselMeldingActive={varselMeldingActive}
                      setVarselMeldingActive={setVarselMeldingActive}
                    />

                    <div className='button_container flex flex-col mt-5 py-4 px-4 sticky bottom-0 border-t-2 z-10 bg-white'>
                      {errors.status && (
                        <div className='mb-3'>
                          <FormError fieldName='status' />
                        </div>
                      )}

                      <ContentLayout>
                        <KravStandardButtons
                          submitCancelButton={() => {
                            router.push(kravNummerVersjonUrl(krav.kravNummer, krav.kravVersjon - 1))
                          }}
                          submitSaveButton={() => {
                            values.status = EKravStatus.UTKAST
                            submitForm()
                          }}
                          createMode
                          kravStatus={values.status}
                          submitAktivButton={() => {
                            values.status = EKravStatus.AKTIV
                            submitForm()
                          }}
                          isSubmitting={isSubmitting}
                        />
                      </ContentLayout>
                    </div>
                    <div className='py-12'>
                      <TextAreaField
                        label='Notater (Kun synlig for kraveier)'
                        name='notat'
                        height='15.625rem'
                        markdown
                      />
                    </div>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </PageLayout>
      )}
    </>
  )
}
