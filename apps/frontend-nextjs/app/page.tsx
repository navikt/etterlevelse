import { EtterlevelseDokumentasjon } from './components/frontpage/etterlevelseDokumentasjon/etterlevelseDokumentasjon'
import { PageLayout } from './components/others/scaffold/scaffold'

export default function Home() {
  return (
    <PageLayout noPadding fullWidth>
      <EtterlevelseDokumentasjon />
    </PageLayout>
  )
}
