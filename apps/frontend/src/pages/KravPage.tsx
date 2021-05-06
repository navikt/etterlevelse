import {Block} from 'baseui/block'
import {H1, HeadingXLarge, LabelLarge, LabelSmall, Paragraph2, ParagraphSmall} from 'baseui/typography'
import {useHistory, useParams} from 'react-router-dom'
import {deleteKrav, KravIdParams, mapToFormVal} from '../api/KravApi'
import React, {useEffect, useRef, useState} from 'react'
import {EtterlevelseQL, EtterlevelseStatus, ExternalCode, Krav, KravQL, KravStatus} from '../constants'
import Button from '../components/common/Button'
import {ViewKrav} from '../components/krav/ViewKrav'
import {EditKrav} from '../components/krav/EditKrav'
import RouteLink from '../components/common/RouteLink'
import {LoadingSkeleton} from '../components/common/LoadingSkeleton'
import {user} from '../services/User'
import {theme} from '../util'
import {FormikProps} from 'formik'
import {DeleteItem} from '../components/DeleteItem'
import {Spinner} from '../components/common/Spinner'
import {borderRadius, paddingAll} from '../components/common/Style'
import {useQuery} from '@apollo/client'
import {Tilbakemeldinger} from '../components/krav/Tilbakemelding'
import {chevronLeft, editIcon, pageIcon, plusIcon, sadFolderIcon} from '../components/Images'
import {Label} from '../components/common/PropertyLabel'
import {CustomizedTab, CustomizedTabs} from '../components/common/CustomizedTabs'
import {ettlevColors, maxPageWidth, pageWidth} from '../util/theme'
import {CustomizedAccordion, CustomizedPanel} from '../components/common/CustomizedAccordion'
import * as _ from 'lodash'
import moment from 'moment'
import {faChevronRight} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {useQueryParam} from '../util/hooks'
import {InfoBlock} from '../components/common/InfoBlock'
import {gql} from '@apollo/client/core'

export const kravNumView = (it: {kravVersjon: number, kravNummer: number}) => `K${it.kravNummer}.${it.kravVersjon}`
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
  const {loading: kravLoading, data: kravQuery, refetch: reloadKrav} = useQuery<{kravById: KravQL}, KravIdParams>(query, {
    variables: params,
    skip: (!params.id || params.id === 'ny') && !params.kravNummer
  })
  const tilbakemeldingId = useQueryParam('tilbakemeldingId')
  const [tab, setTab] = useState<React.Key>(!!tilbakemeldingId ? 'tilbakemeldinger' : 'krav')


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
    setKrav({...krav, id: '', kravVersjon: krav.kravVersjon + 1, nyKravVersjon: true})
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
    <Block width='100%' overrides={{Block: {props: {role: 'main'}}}}>
      {kravLoading && <LoadingSkeleton header='Krav'/>}
      {!kravLoading &&
      <Block backgroundColor='#112724' display='flex' width='100%' justifyContent='center' paddingBottom='32px'>
        <Block maxWidth={maxPageWidth} width='100%'>
          <Block paddingLeft='40px' paddingRight='40px' display='flex' flexDirection='column' justifyContent='center'>
            <Block display='flex' width='100%' justifyContent='center' marginTop='24px'>
              <Block display='flex' alignItems='center' width='100%'>
                <Block flex='1' display='flex' justifyContent='flex-start'>
                  <RouteLink href={'/krav'} hideUnderline>
                    <Button startEnhancer={<img alt={'Chevron left'} src={chevronLeft}/>} size='compact' kind='tertiary' $style={{color: '#F8F8F8', ':hover':{backgroundColor:'transparent', textDecoration:'underline 3px'}}}> Tilbake</Button>
                  </RouteLink>
                </Block>
                <Block flex='1' display={['none', 'none', 'none', 'none', 'flex', 'flex']} justifyContent='flex-end'>
                  {krav?.id && user.isKraveier() &&
                  <Button startEnhancer={<img alt='add' src={plusIcon}/>} onClick={newVersion} marginLeft size='compact' kind='tertiary' $style={{color: '#F8F8F8', ':hover':{backgroundColor:'transparent', textDecoration:'underline 3px'}}}>Ny
                    versjon</Button>}
                  {krav?.id && user.isKraveier() && <DeleteItem fun={() => deleteKrav(krav.id)} redirect={'/krav'}/>}
                  {((krav?.id && user.isKraveier())) &&
                  <Button
                    startEnhancer={<img src={editIcon} alt='edit'/>}
                    size='compact'
                    $style={{color: '#F8F8F8', ':hover':{backgroundColor:'transparent', textDecoration:'underline 3px'}}}
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
              <Block $style={{color: '#F8F8F8', fontWeight: 700, fontSize: '18px', fontFamily: 'Source Sans Pro'}}>
                {krav && krav?.kravNummer !== 0 ? kravNumView(krav) : 'Ny'}
              </Block>
              <H1 $style={{color: '#F8F8F8'}}>{krav && krav?.navn ? krav.navn : 'Ny'} </H1>
            </Block>
          </Block>
        </Block>
      </Block>
      }

      {krav && !kravLoading &&
      <Block width='100%'>
        <Block backgroundColor={ettlevColors.green100} display='flex' width='100%' justifyContent='center'>
          <Block maxWidth={maxPageWidth} width='100%'>
            <Block paddingLeft='40px' paddingRight='40px' justifyContent='center' display='flex'>
              <Block marginBottom='80px' marginTop='64px' width={pageWidth}>
                <Label title='' p1 markdown={krav.hensikt}/>
              </Block>
            </Block>
          </Block>
        </Block>

        <Block display={'flex'} justifyContent='center' width='100%'
               $style={{
                 background: `linear-gradient(top, ${ettlevColors.green100} 50px, ${ettlevColors.gray25} 0%)`
               }}>
          <Block maxWidth={pageWidth} width='100%'>
            <CustomizedTabs fontColor={ettlevColors.green600} activeColor={ettlevColors.green800} tabBackground={ettlevColors.green100}
                            activeKey={tab} onChange={k => setTab(k.activeKey)}>
              <CustomizedTab title={'Om kravet'} key={'krav'}>
                <ViewKrav krav={krav}/>
              </CustomizedTab>
              <CustomizedTab title={'Eksempler på etterlevelse'} key={'etterlevelser'}>
                <Etterlevelser loading={etterlevelserLoading} etterlevelser={krav.etterlevelser}/>
              </CustomizedTab>
              <CustomizedTab title={'Tilbakemeldinger'} key={'tilbakemeldinger'}>
                <Tilbakemeldinger krav={krav}/>
              </CustomizedTab>
            </CustomizedTabs>
          </Block>
        </Block>

        <Block display='flex' justifyContent='center' width='calc(100% - 80px)' paddingLeft='40px' paddingRight='40px'>
          <Block maxWidth={pageWidth} width='100%'>
            <Paragraph2>{getLastModifiedBy(krav)}</Paragraph2>
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
      }}/>}

    </Block>
  )
}
const Etterlevelser = ({loading, etterlevelser: allEtterlevelser}: {loading: boolean, etterlevelser?: EtterlevelseQL[]}) => {
  const etterlevelser = (allEtterlevelser || [])
  .filter(e => e.status === EtterlevelseStatus.FERDIG)
  .sort((a, b) => a.behandling.navn.localeCompare(b.behandling.navn))

  const avdelinger = _.sortedUniqBy((etterlevelser?.map(e => e.behandling.avdeling)
    .sort((a, b) => (a?.shortName || '').localeCompare(b?.shortName || ''))
    .filter(avdeling => !!avdeling) || []) as ExternalCode[],
    a => a.code
  )
  const [hover, setHover] = useState('')

  return (
    <Block>
      <HeadingXLarge maxWidth={'500px'}>Her kan du se hvordan andre team har dokumentert etterlevelse</HeadingXLarge>
      {loading && <Spinner size={theme.sizing.scale800}/>}
      {!loading && !etterlevelser.length &&
      <InfoBlock icon={sadFolderIcon} alt={'Trist mappe ikon'} text={'Det er ikke dokumentert etterlevelse på dette kravet'} color={ettlevColors.green800}/>}

      <CustomizedAccordion>
        {avdelinger.map(a => <CustomizedPanel
          key={a.code}
          title={a.shortName}>

          {etterlevelser?.filter(e => e.behandling.avdeling?.code === a.code).map(e => (
            <RouteLink key={e.id} href={`/etterlevelse/${e.id}`} hideUnderline $style={{
              display: 'flex'
            }}>
              <Block overrides={{
                Block: {
                  style: {
                    width: '100%',
                    ...paddingAll(theme.sizing.scale600),
                    paddingLeft: theme.sizing.scale300,
                    display: 'flex',
                    justifyContent: 'space-between',
                    backgroundColor: ettlevColors.white,

                    borderWidth: '1px',
                    borderColor: ettlevColors.grey50,
                    borderStyle: 'solid',

                    ':hover': {
                      position: 'relative',
                      boxSizing: 'border-box',
                      boxShadow: '0px 3px 4px rgba(0, 0, 0, 0.12)'
                    }
                  }
                }
              }} onMouseEnter={() => setHover(e.id)} onMouseLeave={() => setHover('')}>
                <PageIcon hover={hover === e.id}/>

                <Block marginLeft={theme.sizing.scale300} marginRight={theme.sizing.scale600} $style={{flexGrow: 1}}
                       display={'flex'} flexDirection={'column'} justifyContent={'center'}
                >
                  <LabelLarge $style={{lineHeight: '20px'}}>{e.behandling.navn}</LabelLarge>
                  <ParagraphSmall marginBottom={0} marginTop={theme.sizing.scale100}>{e.behandling.overordnetFormaal.shortName}</ParagraphSmall>
                </Block>

                <Block minWidth={'120px'} maxWidth={'120px'}>
                  <LabelSmall>{!!e.behandling.teamsData.length ? e.behandling.teamsData.map(t => t.name).join(', ') : 'Ingen team'}</LabelSmall>
                  <ParagraphSmall marginBottom={0} marginTop={theme.sizing.scale100}>Utfylt: {moment(e.changeStamp.lastModifiedDate).format('ll')}</ParagraphSmall>
                </Block>

                <Block marginLeft={hover === e.id ? `calc(${theme.sizing.scale600} + 4px)` : theme.sizing.scale600} alignSelf={'center'} marginRight={hover === e.id ? '-4px' : 0}>
                  <FontAwesomeIcon icon={faChevronRight} size={'lg'} color={ettlevColors.green800}/>
                </Block>

              </Block>
            </RouteLink>))}

        </CustomizedPanel>)}
      </CustomizedAccordion>
    </Block>
  )
}

const PageIcon = (props: {hover: boolean}) => (
  <Block $style={{
    ...borderRadius('100%'),
    backgroundColor: props.hover ? ettlevColors.green100 : ettlevColors.green50,
    minWidth: '38px',
    maxWidth: '38px',
    height: '38px',
    display: 'flex',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  }}>
    <img src={pageIcon} alt={'Page icon'} width={'22px'} height={'30px'}/>
  </Block>
)

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
          teamsData {
            id
            name
          }
        }
        changeStamp {
          lastModifiedDate
        }
        status
      }
    }
  }
`

