import { BodyLong, Heading, LinkPanel, List, Loader, Spacer, Tag } from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import { PageLayout } from '../components/scaffold/Page'
import { TKravQL } from '../constants'
import { useKravCounter } from '../query/KravQuery'
import { ampli, userRoleEventProp } from '../services/Amplitude'
import { CodelistService, EListName, TLovCode, TTemaCode } from '../services/Codelist'

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
  const [num] = useState<{ [t: string]: number[] }>({})
  const [kravAntall, setKravAntall] = useState<number>(0)
  const [codelistUtils] = CodelistService()

  const updateNum = (tema: string, temaNum: number[]): void => {
    num[tema] = temaNum

    const kravNummerArray: number[] = []
    Object.keys(num).forEach((key: string) => kravNummerArray.push(...num[key]))
    setKravAntall(
      kravNummerArray.filter(
        (value: number, index: number, self: number[]) =>
          index === self.findIndex((kravNummer) => kravNummer === value)
      ).length
    )
  }

  const temaListe: TTemaCode[] = codelistUtils
    .getCodes(EListName.TEMA)
    .sort((a: TTemaCode, b: TTemaCode) =>
      a.shortName.localeCompare(b.shortName, 'nb')
    ) as TTemaCode[]

  return (
    <div>
      <div>
        <Heading size={subContent ? 'medium' : 'large'} level={subContent ? '2' : '1'}>
          Forstå kravene
        </Heading>
        <BodyLong>
          Totalt {kravAntall} krav fordelt på {temaListe.length} temaer
        </BodyLong>
      </div>
      <List className="mt-6">
        {temaListe.map((tema: TTemaCode) => (
          <List.Item icon={<div />} key={tema.code}>
            <TemaPanel subContent={subContent} tema={tema} setNum={updateNum} />
          </List.Item>
        ))}
      </List>
    </div>
  )
}

interface ITemaPanelProps {
  tema: TTemaCode
  setNum: (tema: string, num: number[]) => void
  subContent?: boolean
}

export const TemaPanel = ({ tema, setNum, subContent }: ITemaPanelProps) => {
  const [codelistUtils] = CodelistService()
  const lover: TLovCode[] = codelistUtils.getLovCodesForTema(tema.code)
  const { data, loading } = useKravCounter(
    { lover: [...lover.map((lov: TLovCode) => lov.code)] },
    { skip: !lover.length }
  )
  const krav: TKravQL[] = data?.krav.content || []
  useEffect(
    () =>
      setNum(
        tema.code,
        krav.map((krav: TKravQL) => krav.kravNummer)
      ),
    [data]
  )

  return (
    <>
      {loading && <Loader size="large" className="flex justify-self-center" />}
      {!loading && (
        <LinkPanel className="mb-2" key={tema.code} href={'/tema/' + tema.code}>
          <div className="w-full flex items-center ">
            <div>
              <LinkPanel.Title className={`flex ${subContent ? ' text-xl' : ''}`}>
                {tema.shortName}
              </LinkPanel.Title>
              <LinkPanel.Description className="lg:flex items-center gap-2 flex-wrap">
                {lover.map((lov, index) => (
                  <div key={lov.code} className="flex items-center gap-2">
                    {lov.shortName}
                    {index < lover.length - 1 && (
                      <span className="hidden lg:block h-2 w-2 rotate-45 rounded-[0.063rem] bg-red-200"></span>
                    )}
                  </div>
                ))}
              </LinkPanel.Description>
            </div>
            <Spacer />
            <Tag variant="info">{krav.length || 0} krav</Tag>
          </div>
        </LinkPanel>
      )}
    </>
  )
}
