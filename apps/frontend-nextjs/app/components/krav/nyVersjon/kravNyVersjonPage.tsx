'use client'

import { GetKravData } from '@/api/krav/edit/kravEditApi'
import { createKrav, kravMapToFormVal } from '@/api/krav/kravApi'
import { TextAreaField } from '@/components/common/textAreaField/textAreaField'
import { ContentLayout } from '@/components/others/layout/content/content'
import { PageLayout } from '@/components/others/scaffold/scaffold'
import { EListName, ICode, TLovCode } from '@/constants/kodeverk/kodeverkConstants'
import { IKravDataProps, TKravById } from '@/constants/krav/edit/kravEditConstant'
import { EKravStatus, IKrav, TKravQL } from '@/constants/krav/kravConstants'
import { kravNummerVersjonUrl } from '@/routes/krav/kravRoutes'
import { codelist } from '@/services/kodeverk/kodeverkService'
import { kravNewVersionValidation } from '@/test/krav/schemaValidation/kravSchemaValidation'
import { kravBreadCrumbPath } from '@/util/breadCrumbPath/breadCrumbPath'
import { Alert, Heading, Loader } from '@navikt/ds-react'
import { Form, Formik } from 'formik'
import { Params } from 'next/dist/server/request/params'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

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

  const submit = async (krav: TKravQL): Promise<void> => {
    const regelverk: TLovCode = codelist.getCode(
      EListName.LOV,
      krav.regelverk[0]?.lov.code
    ) as TLovCode
    const underavdeling: ICode = codelist.getCode(
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
              <Form>
                <div>
                  <div>
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
                  KRAVFORMFIELDS!
                  <div>
                    <div>ERROR</div>
                    <ContentLayout>KravStandardButtons</ContentLayout>
                  </div>
                  <div>
                    <TextAreaField
                      label='Notater (Kun synlig for kraveier)'
                      name='notat'
                      height='15.625rem'
                      markdown
                    />
                  </div>
                </div>
              </Form>
            </Formik>
          </div>
        </PageLayout>
      )}
    </>
  )
}
