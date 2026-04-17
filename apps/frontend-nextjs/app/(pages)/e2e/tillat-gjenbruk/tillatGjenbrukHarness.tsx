'use client'

import { etterlevelseDokumentasjonMapToFormVal } from '@/api/etterlevelseDokumentasjon/etterlevelseDokumentasjonApi'
import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import dynamic from 'next/dynamic'
import { useState } from 'react'

const DynamicTillatGjenbrukModal = dynamic(
  () =>
    import('@/components/etterlevelseDokumentasjon/etterlevelseDokumentasjonPage/gjenbruk/TillatGjenbrukModal'),
  { ssr: false }
)

const initialEtterlevelseDokumentasjon = (): TEtterlevelseDokumentasjonQL =>
  etterlevelseDokumentasjonMapToFormVal({
    id: 'e2e-tillat-gjenbruk',
    title: '',
    beskrivelse: '',
    varslingsadresser: [],
    teamsData: [],
    resourcesData: [],
    nomAvdelingId: '',
    tilgjengeligForGjenbruk: false,
    gjenbrukBeskrivelse: '',
  })

export const TillatGjenbrukHarness = () => {
  const [etterlevelseDokumentasjon, setEtterlevelseDokumentasjon] =
    useState<TEtterlevelseDokumentasjonQL>(initialEtterlevelseDokumentasjon)

  return (
    <div className='p-8'>
      <DynamicTillatGjenbrukModal
        etterlevelseDokumentasjon={etterlevelseDokumentasjon}
        setEtterlevelseDokumentasjon={setEtterlevelseDokumentasjon}
        isOpen={true}
        setIsOpen={() => undefined}
        renderTrigger={false}
      />
    </div>
  )
}
