import { etterlevelseDokumentasjonerUrl } from '../../common/RouteLinkEtterlevelsesdokumentasjon'
import { PageLayout } from '../../scaffold/Page'
import EtterlevelseDokumentasjonForm from './EtterlevelseDokumentasjonForm'

export const CreateEtterlevelseDokumentasjonPage = () => (
  <PageLayout
    pageTitle='Opprett nytt etterlevelsesdokument'
    currentPage='Opprett nytt etterlevelsesdokument'
    breadcrumbPaths={[
      { href: etterlevelseDokumentasjonerUrl(), pathName: 'Dokumentere etterlevelse' },
    ]}
  >
    <EtterlevelseDokumentasjonForm title='Opprett nytt etterlevelsesdokument' />
  </PageLayout>
)

export default CreateEtterlevelseDokumentasjonPage
