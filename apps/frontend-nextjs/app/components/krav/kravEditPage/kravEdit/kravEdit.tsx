import { kravMapToFormVal } from '@/api/krav/kravApi'
import { PageLayout } from '@/components/others/scaffold/scaffold'
import { IKravVersjon, TKravQL } from '@/constants/krav/kravConstants'
import { kravEditValidation } from '@/test/validation/kravEditValidation'
import { kravBreadCrumbPath } from '@/util/breadCrumbPath/breadCrumbPath'
import { Form, Formik } from 'formik'
import { FunctionComponent } from 'react'

type TProps = {
  krav: TKravQL | undefined
  alleKravVersjoner: IKravVersjon[]
  isEditingUtgaattKrav: any
}

export const KravEdit: FunctionComponent<TProps> = ({
  krav,
  alleKravVersjoner,
  isEditingUtgaattKrav,
}) => {
  const submit = async (krav: TKravQL): Promise<void> => {
    krav
    // const regelverk: TLovCode = codelist.getCode(
    //   EListName.LOV,
    //   krav.regelverk[0]?.lov.code
    // ) as TLovCode
    // const underavdeling: ICode = codelist.getCode(
    //   EListName.UNDERAVDELING,
    //   regelverk?.data?.underavdeling
    // ) as ICode
    // const mutatedKrav: TKravQL = {
    //   ...krav,
    //   underavdeling: underavdeling as ICode | undefined,
    //   varselMelding: varselMeldingActive ? krav.varselMelding : undefined,
    // }
    // const etterlevelser: IPageResponse<IEtterlevelse> =
    //   await getEtterlevelserByKravNumberKravVersion(krav.kravNummer, krav.kravVersjon)
    // if (etterlevelser.totalElements > 0 && krav.status === EKravStatus.UTKAST) {
    //   setErrorModalMessage(
    //     'Du kan ikke sette dette kravet til «Utkast» fordi det er minst én etterlevelse som bruker kravet i sin dokumentasjon.'
    //   )
    //   setShowErrorModal(true)
    // } else if (krav.id) {
    //   close(await updateKrav(mutatedKrav))
    //   setVarselMeldingActive(mutatedKrav.varselMelding ? ['VarselMelding'] : [])
    // }
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
          <Form>sgas</Form>
        </Formik>
      </div>
    </PageLayout>
  )
}
