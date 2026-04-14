import { Markdown } from '@/components/common/markdown/markdown'
import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import {
  etterlevelseDokumentasjonGjenbrukIdUrl,
  etterlevelseDokumentasjonRelasjonUrl,
} from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import { Button, Link } from '@navikt/ds-react'
import { useRouter } from 'next/navigation'
import { FunctionComponent } from 'react'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
}

export const TilgjengeligForGjenbruk: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
}) => {
  const router = useRouter()

  return (
    <>
      <Markdown source={etterlevelseDokumentasjon.gjenbrukBeskrivelse} />
      <>
        <div className='mt-5'>
          <Button
            onClick={() => {
              router.push(etterlevelseDokumentasjonGjenbrukIdUrl(etterlevelseDokumentasjon.id))
            }}
            size='small'
            variant='secondary'
            className='whitespace-nowrap mt-3'
            type='button'
          >
            Gjenbruk dokumentet
          </Button>
        </div>
        <div className='mt-5'>
          <Link href={etterlevelseDokumentasjonRelasjonUrl(etterlevelseDokumentasjon.id)}>
            Se hvilke etterlevelser som allerede gjenbruker dette dokumentet
          </Link>
        </div>
      </>
    </>
  )
}
