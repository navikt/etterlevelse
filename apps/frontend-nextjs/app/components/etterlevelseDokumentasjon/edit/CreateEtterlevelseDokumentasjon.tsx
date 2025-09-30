import { etterlevelseDokumentasjonerUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import { PageLayout } from '../../others/scaffold/scaffold'
import EtterlevelseDokumentasjonForm from '../form/etterlevelseDokumentasjonForm'

export const CreateEtterlevelseDokumentasjon = () => (
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

export default CreateEtterlevelseDokumentasjon
