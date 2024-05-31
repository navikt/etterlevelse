import { PageLayout } from '../../scaffold/Page'
import EtterlevelseDokumentasjonForm from './EtterlevelseDokumentasjonForm'

export const CreateEtterlevelseDokumentasjonPage = () => {
  return (
    <PageLayout
      pageTitle="Opprett nytt etterlevelsesdokument"
      currentPage="Opprett nytt etterlevelsesdokument"
      breadcrumbPaths={[{ href: '/dokumentasjoner', pathName: 'Dokumentere etterlevelse' }]}
    >
      <EtterlevelseDokumentasjonForm title="Opprett nytt etterlevelsesdokument" />
    </PageLayout>
  )
}

export default CreateEtterlevelseDokumentasjonPage
