'use client'
import { getPvkDokumentVersions } from '@/api/pvkDokument/pvkDokumentApi'
import AuthCheckComponent from '@/components/common/authCheckComponent'
import { IPvkDokumentVersionItem } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { Alert, BodyLong, Heading, Loader } from '@navikt/ds-react'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

const PvkVersionsPage = () => {
  const params = useParams<{ pvkDokumentId?: string }>()
  const [versions, setVersions] = useState<IPvkDokumentVersionItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    ;(async () => {
      if (params.pvkDokumentId) {
        setIsLoading(true)
        try {
          const page = await getPvkDokumentVersions(params.pvkDokumentId)
          setVersions(page.content || [])
        } catch (e: any) {
          setError('Kunne ikke hente versjonshistorikk')
        } finally {
          setIsLoading(false)
        }
      }
    })()
  }, [params.pvkDokumentId])

  const computeDiff = (prev: any, curr: any): { path: string; prev: any; curr: any }[] => {
    const changes: { path: string; prev: any; curr: any }[] = []
    const isObject = (v: any) => typeof v === 'object' && v !== null
    const isArray = (v: any) => Array.isArray(v)

    const diffArrays = (pArr: any[] = [], cArr: any[] = [], path: string) => {
      if (!pArr.length && !cArr.length) return
      const pPrim = pArr.every((x) => !isObject(x))
      const cPrim = cArr.every((x) => !isObject(x))
      if (pPrim && cPrim) {
        const pSet = new Set(pArr)
        const cSet = new Set(cArr)
        ;[...cSet].forEach((val) => {
          if (!pSet.has(val)) changes.push({ path: `${path}[+]`, prev: undefined, curr: val })
        })
        ;[...pSet].forEach((val) => {
          if (!cSet.has(val)) changes.push({ path: `${path}[-]`, prev: val, curr: undefined })
        })
        return
      }

      const key = 'innsendingId'
      const pMap = new Map((pArr || []).map((o) => [o?.[key], o]))
      const cMap = new Map((cArr || []).map((o) => [o?.[key], o]))
      cMap.forEach((obj, id) => {
        if (!pMap.has(id)) changes.push({ path: `${path}[+id=${id}]`, prev: undefined, curr: obj })
        else {
          const pobj = pMap.get(id)
          Object.keys(obj || {}).forEach((k) => {
            const a = obj[k]
            const b = pobj?.[k]
            if (JSON.stringify(a) !== JSON.stringify(b))
              changes.push({ path: `${path}[~id=${id}].${k}`, prev: b, curr: a })
          })
        }
      })
      pMap.forEach((obj, id) => {
        if (!cMap.has(id)) changes.push({ path: `${path}[-id=${id}]`, prev: obj, curr: undefined })
      })
    }

    const walk = (p: any, c: any, path: string) => {
      if (isArray(p) || isArray(c)) return diffArrays(p || [], c || [], path)
      const keys = new Set([...Object.keys(p || {}), ...Object.keys(c || {})])
      keys.forEach((k) => {
        const np = p?.[k]
        const nc = c?.[k]
        const nextPath = path ? `${path}.${k}` : k
        if (isObject(np) || isObject(nc)) walk(np, nc, nextPath)
        else if (JSON.stringify(np) !== JSON.stringify(nc))
          changes.push({ path: nextPath, prev: np, curr: nc })
      })
    }

    walk(prev, curr, '')
    return changes
  }

  const DiffView = ({ prev, curr }: { prev?: any; curr: any }) => {
    const diffs = computeDiff(prev?.data, curr?.data)
    if (!prev) return <BodyLong>Første versjon</BodyLong>
    if (!diffs.length) return <BodyLong>Ingen endringer fra forrige versjon</BodyLong>
    const sectionForPath = (path: string): string => {
      if (path.startsWith('meldingerTilPvo')) return 'Meldinger til PVO'
      if (
        path.startsWith('behandlingensLivslop') ||
        path.startsWith('behandlingensLivslopBeskrivelse')
      )
        return 'Behandlingens livsløp'
      if (
        path.startsWith('pvkVurdering') ||
        path.startsWith('berOmNyVurderingFraPvo') ||
        path.startsWith('pvkVurderingsBegrunnelse')
      )
        return 'Vurdering'
      if (path.startsWith('ytterligereEgenskaper')) return 'Ytterligere egenskaper'
      if (path.startsWith('merknadTilRisikoeier') || path.startsWith('merknadFraRisikoeier'))
        return 'Merknader'
      if (
        path.startsWith('harInvolvertRepresentant') ||
        path.startsWith('representantInvolveringsBeskrivelse') ||
        path.startsWith('harDatabehandlerRepresentantInvolvering') ||
        path.startsWith('dataBehandlerRepresentantInvolveringBeskrivelse')
      )
        return 'Involvering'
      return 'Generelt'
    }

    const sections: Record<string, { path: string; prev: any; curr: any }[]> = {}
    diffs.forEach((d) => {
      const s = sectionForPath(d.path)
      if (!sections[s]) sections[s] = []
      sections[s].push(d)
    })

    const sectionOrder = [
      'Meldinger til PVO',
      'Vurdering',
      'Behandlingens livsløp',
      'Involvering',
      'Ytterligere egenskaper',
      'Merknader',
      'Generelt',
    ]

    return (
      <div className='mt-3 space-y-4'>
        {sectionOrder
          .filter((key) => sections[key] && sections[key].length)
          .map((key) => (
            <div key={key}>
              <Heading level='3' size='xsmall' className='mb-2'>
                {key}
              </Heading>
              <div className='space-y-1'>
                {sections[key].map((d, i) => (
                  <BodyLong key={i} className='text-sm'>
                    <span className='font-medium'>{d.path}</span>: {String(d.prev)} →{' '}
                    {String(d.curr)}
                  </BodyLong>
                ))}
              </div>
            </div>
          ))}
      </div>
    )
  }

  return (
    <div className='flex w-full justify-center'>
      <div className='w-full max-w-5xl px-2 py-4'>
        <Heading size='small' level='2' className='mb-4'>
          PVK versjonshistorikk
        </Heading>
        {isLoading && (
          <div className='flex w-full justify-center'>
            <Loader size='large' />
          </div>
        )}
        {error && (
          <Alert variant='error' className='my-4'>
            {error}
          </Alert>
        )}
        {!isLoading && versions.length === 0 && (
          <Alert variant='info'>Ingen arkiverte versjoner funnet.</Alert>
        )}
        {!isLoading && versions.length > 0 && (
          <div className='space-y-3'>
            {versions.map((v, idx) => (
              <div key={v.id} className='border rounded p-3'>
                <div className='text-sm'>
                  <span className='font-medium'>Versjon: </span>
                  {v.contentVersion ?? versions.length - idx}
                </div>
                <div className='text-sm'>
                  <span className='font-medium'>Status: </span>
                  {v.status}
                </div>
                <div className='text-sm'>
                  <span className='font-medium'>Dato: </span>
                  {v.changeStamp?.lastModifiedDate || ''}
                </div>
                <DiffView prev={versions[idx + 1]} curr={v} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const Page = () => (
  <AuthCheckComponent>
    <PvkVersionsPage />
  </AuthCheckComponent>
)

export default Page
