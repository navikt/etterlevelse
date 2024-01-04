import { BodyLong, Heading, LinkPanel, Loader, Spacer, Tag } from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import { PageLayout } from '../components/scaffold/Page'
import { ampli, userRoleEventProp } from '../services/Amplitude'
import { ListName, TemaCode, codelist } from '../services/Codelist'
import { useForceUpdate } from '../util/hooks'
import { useKravCounter } from './TemaPage'

export const TemaOversiktPage = () => {
  useEffect(() => {
    ampli.logEvent('sidevisning', { side: 'Tema side', ...userRoleEventProp })
  }, [])

  return (
    <PageLayout pageTitle="Forstå kravene" currentPage="Forstå kravene">
      <div className="w-full flex justify-center items-center flex-col">
        <div className="w-full px-8">
          <TemaPanels />
        </div>
      </div>
    </PageLayout>
  )
}

export const TemaPanels = ({ subContent }: { subContent?: boolean }) => {
  const [num] = useState<{ [t: string]: number }>({})
  const update = useForceUpdate()

  const updateNum = (tema: string, temaNum: number) => {
    num[tema] = temaNum
    update()
  }

  const kravAntall = Object.values(num).reduce((p, c) => p + c, 0)
  const temaListe = codelist.getCodes(ListName.TEMA).sort((a, b) => a.shortName.localeCompare(b.shortName, 'nb'))

  return (
    <div>
      <div>
        <Heading size={subContent ? 'medium' : 'large'} level={subContent ? '2' : '1'}>Forstå kravene</Heading>
        <BodyLong>
          Totalt {kravAntall} krav fordelt på {temaListe.length} temaer
        </BodyLong>
      </div>
      <div className="mt-6">
        {temaListe.map((tema) => (
          <TemaPanel subContent={subContent} key={tema.code} tema={tema} setNum={updateNum} />
        ))}
      </div>
    </div>
  )
}

export const TemaPanel = ({ tema, setNum, subContent }: { tema: TemaCode; setNum: (tema: string, num: number) => void, subContent?:boolean }) => {
  const lover = codelist.getCodesForTema(tema.code)
  const { data, loading } = useKravCounter({ lover: [...lover.map((l) => l.code)] }, { skip: !lover.length })
  const krav = data?.krav.content || []
  useEffect(() => setNum(tema.code, krav.length), [])

  if (loading) {
    return <Loader size="large" />
  }

  return (
    <LinkPanel className="mb-2" key={tema.code} href={'/tema/' + tema.code}>
      <div className="w-full flex items-center ">
        <div>
          <LinkPanel.Title className={`flex ${subContent ? ' text-xl' : ''}`}>{tema.shortName}</LinkPanel.Title>
          <LinkPanel.Description className="lg:flex items-center gap-2">
            {lover.map((l, i) => (
              <div key={l.code} className="flex items-center gap-2">
                {l.shortName}
                {i < lover.length - 1 && <span className="hidden lg:block h-2 w-2 rotate-45 rounded-[1px] bg-red-200"></span>}
              </div>
            ))}
          </LinkPanel.Description>
        </div>
        <Spacer />
        <Tag variant="info">{krav.length || 0} krav</Tag>
      </div>
    </LinkPanel>
  )
}