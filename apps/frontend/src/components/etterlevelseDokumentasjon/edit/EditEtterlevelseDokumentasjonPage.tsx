import { PageLayout } from '../../scaffold/Page'
import EtterlevelseDokumentasjonForm from './EtterlevelseDokumentasjonForm'

export const EditEtterlevelseDokumentasjonPage = () => {
  return (
    <PageLayout
      pageTitle="Opprett nytt etterlevelsesdokument"
      currentPage="Opprett nytt etterlevelsesdokument"
      breadcrumbPaths={[{ href: '/dokumentasjoner', pathName: 'Dokumentere etterlevelse' }]}
    >
      <EtterlevelseDokumentasjonForm title="Rediger etterlevelsesdokumentet" />
    </PageLayout>
  )
}
export default EditEtterlevelseDokumentasjonPage
