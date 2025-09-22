'use client'

import { EListName, TLovCode } from '@/constants/kodeverk/kodeverkConstants'
import { TKravQL } from '@/constants/krav/kravConstants'
import { TTemaCode } from '@/constants/teamkatalogen/teamkatalogConstants'
import { useKravCounter } from '@/query/krav/kravQuery'
import { temaUrl } from '@/routes/kodeverk/tema/kodeverkTemaRoutes'
import { codelist } from '@/services/kodeverk/kodeverkService'
import { BodyLong, Heading, LinkPanel, List, Loader, Spacer, Tag } from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import { PageLayout } from '../others/scaffold/scaffold'

export const TemaOversiktPage = () => {
  // useEffect(() => {
  //   const ampliInstance = ampli()
  //   if (ampliInstance) {
  //     ampliInstance.logEvent('sidevisning', { side: 'Tema side', ...userRoleEventProp })
  //   }
  // }, [])

  return (
    <PageLayout pageTitle='Forstå kravene' currentPage='Forstå kravene'>
      <div className='w-full flex justify-center items-center flex-col'>
        <div className='w-full px-8'>
          <TemaPanels />
        </div>
      </div>
    </PageLayout>
  )
}

export const TemaPanels = ({ subContent }: { subContent?: boolean }) => {
  const [num] = useState<{ [t: string]: number[] }>({})
  const [kravAntall, setKravAntall] = useState<number>(0)
  const [temaListe, setTemaListe] = useState<TTemaCode[]>([])

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

  useEffect(() => {
    console.debug(codelist.lists)
    setTemaListe(
      codelist
        .getCodes(EListName.TEMA)
        .sort((a: TTemaCode, b: TTemaCode) =>
          a.shortName.localeCompare(b.shortName, 'nb')
        ) as TTemaCode[]
    )
  }, [])

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
      <List className='mt-6'>
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
  const lover: TLovCode[] = codelist.getLovCodesForTema(tema.code)
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
      {loading && <Loader size='large' className='flex justify-self-center' />}
      {!loading && (
        <LinkPanel className='mb-2' key={tema.code} href={`${temaUrl}/${tema.code}`}>
          <div className='w-full flex items-center '>
            <div>
              <LinkPanel.Title className={`flex ${subContent ? ' text-xl' : ''}`}>
                {tema.shortName}
              </LinkPanel.Title>
              <LinkPanel.Description className='lg:flex items-center gap-2 flex-wrap'>
                {lover.map((lov, index) => (
                  <div key={lov.code} className='flex items-center gap-2'>
                    {lov.shortName}
                    {index < lover.length - 1 && (
                      <span className='hidden lg:block h-2 w-2 rotate-45 rounded-[0.063rem] bg-red-200'></span>
                    )}
                  </div>
                ))}
              </LinkPanel.Description>
            </div>
            <Spacer />
            <div className='min-w-18'>
              <Tag variant='info'>{krav.length || 0} krav</Tag>
            </div>
          </div>
        </LinkPanel>
      )}
    </>
  )
}

export default TemaOversiktPage
