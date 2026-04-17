'use client'

import { TextAreaField } from '@/components/common/textAreaField/textAreaField'
import { List } from '@navikt/ds-react'
import { usePathname } from 'next/navigation'

export const BeskrivelseAvGjenbruk = () => {
  const pathname = usePathname()
  const useMarkdownEditor =
    !pathname?.startsWith('/e2e') || process.env.NEXT_PUBLIC_ENABLE_E2E_PAGES !== 'true'

  return (
    <>
      <List as='ul' className='mb-5'>
        <List.Item>
          Når du tillater gjenbruk av dokumentet ditt, vil de som gjenbruker kunne arve både
          veilending og svar, og bruke disse som utgangspunkt for sin egen dokumentasjon.
        </List.Item>
        <List.Item>
          De som gjenbruker er likevel ansvarlig for at etterlevelsen blir riktig.
        </List.Item>
      </List>
      <TextAreaField
        name='gjenbrukBeskrivelse'
        label='Skriv veiledning som hjelper andre å forstå om de skal gjenbruke dette dokumentet'
        height='150px'
        markdown={useMarkdownEditor}
        noPlaceholder
        caption={<>Hvem skal gjenbruke? Ved hvilken type arbeid blir gjenbruk passende?</>}
      />
    </>
  )
}
