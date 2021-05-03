import { Block } from 'baseui/block'
import { H1, HeadingSmall, Paragraph1 } from 'baseui/typography'
import { useHistory, useParams } from 'react-router-dom'
import { deleteKrav, KravIdParams, mapToFormVal } from '../api/KravApi'
import React, { useEffect, useRef, useState } from 'react'
import { EtterlevelseQL, Krav, KravQL, KravStatus } from '../constants'
import Button from '../components/common/Button'
import { ViewKrav } from '../components/krav/ViewKrav'
import { EditKrav } from '../components/krav/EditKrav'
import RouteLink, { ObjectLink } from '../components/common/RouteLink'
import { LoadingSkeleton } from '../components/common/LoadingSkeleton'
import { user } from '../services/User'
import { theme } from '../util'
import { FormikProps } from 'formik'
import { DeleteItem } from '../components/DeleteItem'
import { Cell, Row, Table } from '../components/common/Table'
import { Spinner } from '../components/common/Spinner'
import { Teams } from '../components/common/TeamName'
import { marginAll } from '../components/common/Style'
import { ObjectType } from '../components/admin/audit/AuditTypes'
import { behandlingName } from '../api/BehandlingApi'
import { etterlevelseStatus } from './EtterlevelsePage'
import { gql, useQuery } from '@apollo/client'
import { Tilbakemeldinger } from '../components/krav/Tilbakemelding'
import CustomizedTag from '../components/common/CustomizedTag'
import { chevronLeft, editIcon, plusIcon } from '../components/Images'
import { Label } from '../components/common/PropertyLabel'
import { CustomizedTab, CustomizedTabs } from '../components/common/CustomizedTabs'
import { maxPageWidth, pageWidth } from '../util/theme'

export const kravNumView = (it: { kravVersjon: number, kravNummer: number }) => `K${it.kravNummer}.${it.kravVersjon}`
export const kravName = (krav: Krav) => `${kravNumView(krav)} - ${krav.navn}`

export const kravStatus = (status: KravStatus) => {
  if (!status) return ''
  switch (status) {
    case KravStatus.UTKAST:
      return 'Utkast'
    case KravStatus.UNDER_ARBEID:
      return 'Under arbeid'
    case KravStatus.AKTIV:
      return 'Aktiv'
    case KravStatus.UTGAATT:
      return 'Utgått'
    default:
      return status
  }
}

export const KravPage = () => {
  const params = useParams<KravIdParams>()
  const [krav, setKrav] = useState<KravQL | undefined>()
  const { loading: kravLoading, data: kravQuery, refetch: reloadKrav } = useQuery<{ kravById: KravQL }, KravIdParams>(query, {
    variables: params,
    skip: (!params.id || params.id === 'ny') && !params.kravNummer
  })
  useEffect(() => {
    if (kravQuery?.kravById) setKrav(kravQuery.kravById)
  }, [kravQuery])

  useEffect(() => {
    if (params.id === 'ny') {
      setKrav(mapToFormVal({}) as KravQL)
      setEdit(true)
    }
  }, [params.id])

  // todo split loading krav and subelements?
  const etterlevelserLoading = kravLoading

  const [edit, setEdit] = useState(krav && !krav.id)
  const history = useHistory()
  const formRef = useRef<FormikProps<any>>()

  const newVersion = () => {
    if (!krav) return
    setKrav({ ...krav, id: '', kravVersjon: krav.kravVersjon + 1, nyKravVersjon: true })
    setEdit(true)
  }

  useEffect(() => {
    // hent krav på ny ved avbryt ny versjon
    if (!edit && !krav?.id && krav?.nyKravVersjon) reloadKrav()
  }, [edit])

  const getLastModifiedBy = (krav: KravQL) => {
    const monthList = ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'desember']
    const date = new Date(krav.changeStamp.lastModifiedDate)
    const year = date.getFullYear()
    const month = monthList[date.getMonth()]
    const dt = date.getDate() < 10 ? '0' + date.getDate().toString() : date.getDate().toString()

    return `Sist endret: ${dt}. ${month} ${year} av ${krav.changeStamp.lastModifiedBy.split(' ')[0]}`
  }

  return (
    <Block width='100%' overrides={{ Block: { props: { role: 'main' } } }}>
      {kravLoading && <LoadingSkeleton header='Krav' />}
      {!kravLoading &&
        <Block backgroundColor='#112724' display='flex' width='100%' justifyContent='center' paddingBottom='32px'>
          <Block maxWidth={maxPageWidth} width='100%'>
            <Block paddingLeft='40px' paddingRight='40px' display='flex' flexDirection='column' justifyContent='center'>
              <Block display='flex' width='100%' justifyContent='center' marginTop='24px'>
                <Block display='flex' alignItems='center' width='100%'>
                  <Block flex='1' display='flex' justifyContent='flex-start'>
                    <RouteLink href={'/krav'} hideUnderline>
                      <Button startEnhancer={<img alt={'Chevron left'} src={chevronLeft} />} size='compact' kind='tertiary' $style={{ color: '#F8F8F8' }}> Tilbake</Button>
                    </RouteLink>
                  </Block>
                  <Block flex='1' display={['none', 'none', 'none', 'none', 'flex', 'flex']} justifyContent='flex-end'>
                    {krav?.id && user.isKraveier() &&
                      <Button startEnhancer={<img alt='add' src={plusIcon} />} onClick={newVersion} marginLeft size='compact' kind='tertiary' $style={{ color: '#F8F8F8' }}>Ny
                    versjon</Button>}
                    {krav?.id && user.isKraveier() && <DeleteItem fun={() => deleteKrav(krav.id)} redirect={'/krav'} />}
                    {((krav?.id && user.isKraveier())) &&
                      <Button
                        startEnhancer={<img src={editIcon} alt='edit' />}
                        size='compact'
                        $style={{ color: '#F8F8F8' }}
                        kind={'tertiary'}
                        onClick={() => setEdit(!edit)} marginLeft
                      >
                        Rediger
                    </Button>
                    }
                  </Block>
                </Block>
              </Block>
            </Block>

            <Block paddingLeft='40px' marginTop='31px' paddingRight='40px' width='calc(100% - 80px)' display='flex' justifyContent='center'>
              <Block maxWidth={pageWidth} width='100%' marginTop='7px'>
                <Block $style={{ color: '#F8F8F8', fontWeight: 700, fontSize: '18px', fontFamily: 'Source Sans Pro' }}>
                  {krav && krav?.kravNummer !== 0 ? kravNumView(krav) : 'Ny'}
                </Block>
                <H1 $style={{ color: '#F8F8F8' }}>{krav && krav?.navn ? krav.navn : 'Ny'} </H1>
              </Block>
            </Block>
          </Block>
        </Block>
      }

      {krav && !kravLoading &&
        <Block width='100%'>
          <Block backgroundColor='#CCD9D7' display='flex' width='100%' justifyContent='center'>
            <Block maxWidth={maxPageWidth} width='100%'>
              <Block paddingLeft='40px' paddingRight='40px' justifyContent='center' display='flex'>
                <Block marginBottom='80px' marginTop='64px' width={pageWidth}>
                  <Label title='' markdown={krav.hensikt} />
                </Block>
              </Block>
            </Block>
          </Block>

          <Block display={'flex'} justifyContent='center' width='100%'
            $style={{
              background: 'linear-gradient(top, #CCD9D7 50px, #F8F8F8 0%)'
            }}>
            <Block maxWidth={pageWidth} width='100%'>
              <CustomizedTabs fontColor='#0B483F' activeColor='#102723' tabBackground='#CBD9D7'>
                <CustomizedTab title={'Om kravet'}>
                  <ViewKrav krav={krav} />
                </CustomizedTab>
                <CustomizedTab title={'Spørsmål og svar'}>
                  <Tilbakemeldinger krav={krav} />
                </CustomizedTab>
                <CustomizedTab title={'Eksempler på etterlevelse'}>
                  <Etterlevelser loading={etterlevelserLoading} etterlevelser={krav.etterlevelser} />
                </CustomizedTab>
              </CustomizedTabs>
            </Block>
          </Block>

          <Block display='flex' justifyContent='center' width='calc(100% - 80px)' paddingLeft='40px' paddingRight='40px'>
            <Block maxWidth={pageWidth} width='100%'>
              <Paragraph1>{getLastModifiedBy(krav)}</Paragraph1>
            </Block>
          </Block>
        </Block>}

      {krav && <EditKrav isOpen={edit} setIsOpen={setEdit} krav={krav} formRef={formRef} close={k => {
        if (k) {
          if (k.id !== krav.id) {
            history.push(`/krav/${k.kravNummer}/${k.kravVersjon}`)
          } else {
            reloadKrav()
          }
        }
        setEdit(false)
      }} />}

    </Block>
  )
}
const Etterlevelser = (
  {
    loading, etterlevelser
  }: {
    loading: boolean, etterlevelser?: EtterlevelseQL[]
  }
) => {

  return (
    <Block>
      <HeadingSmall>Kravet etterleves av</HeadingSmall>
      <Block $style={{ ...marginAll('-' + theme.sizing.scale600) }}>
        {loading && <Spinner size={theme.sizing.scale800} />}
        {!loading &&
          <Table data={etterlevelser || []} emptyText='etterlevelser' headers={[
            { title: 'Behandling' },
            { title: 'Status' },
            { title: 'System' },
            { title: 'Team' },
            { title: 'Avdeling' }
          ]} render={state =>
            state.data.map(etterlevelse =>
              <Row key={etterlevelse.id}>
                <Cell><ObjectLink type={ObjectType.Behandling} id={etterlevelse.behandling.id}>{behandlingName(etterlevelse.behandling)}</ObjectLink></Cell>
                <Cell><ObjectLink type={ObjectType.Etterlevelse} id={etterlevelse.id}>
                  {etterlevelseStatus(etterlevelse.status)}
                </ObjectLink></Cell>
                <Cell>{etterlevelse.behandling.systemer.map(s => s.shortName).join(', ')}</Cell>
                <Cell><Teams teams={etterlevelse.behandling.teams} link /></Cell>
                <Cell>{etterlevelse.behandling.avdeling?.shortName}</Cell>
              </Row>
            )
          } />}
      </Block>
    </Block>
  )
}

const query = gql`
  query getKravWithEtterlevelse($id: ID, $kravNummer: Int, $kravVersjon: Int) {
    kravById(id: $id, nummer: $kravNummer, versjon: $kravVersjon) {
      id
      kravNummer
      kravVersjon
      changeStamp {
        lastModifiedBy
        lastModifiedDate
      }

      navn
      beskrivelse
      hensikt
      utdypendeBeskrivelse
      versjonEndringer

      dokumentasjon
      implementasjoner
      begrepIder
      begreper {
        id
        navn
        beskrivelse
      }
      varslingsadresser {
        adresse
        type
        slackChannel {
          id
          name
          numMembers
        }
        slackUser {
          id
          name
        }
      }
      rettskilder
      regelverk {
        lov {
          code
          shortName
        }
        spesifisering
      }
      tagger
      periode {
        start
        slutt
      }

      avdeling {
        code
        shortName
      }
      underavdeling {
        code
        shortName
      }
      relevansFor {
        code
        shortName
      }
      status

      suksesskriterier {
        id
        navn
        beskrivelse
      }

      etterlevelser {
        id
        behandling {
          id
          nummer
          navn
          overordnetFormaal {
            shortName
          }
          systemer {
            code
            shortName
          }
          avdeling {
            code
            shortName
          }
          teams
        }
        status
      }
    }
  }
`

