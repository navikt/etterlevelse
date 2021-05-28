import { Block } from 'baseui/block'
import { H1, HeadingLarge, Label3 } from 'baseui/typography'
import { useHistory, useParams } from 'react-router-dom'
import { deleteEtterlevelse, useEtterlevelse } from '../api/EtterlevelseApi'
import React, { useRef, useState } from 'react'
import { Etterlevelse, EtterlevelseStatus } from '../constants'
import Button from '../components/common/Button'
import { ViewEtterlevelse } from '../components/etterlevelse/ViewEtterlevelse'
import { EditEtterlevelse } from '../components/etterlevelse/EditEtterlevelse'
import RouteLink from '../components/common/RouteLink'
import { LoadingSkeleton } from '../components/common/LoadingSkeleton'
import { user } from '../services/User'
import { theme } from '../util'
import { FormikProps } from 'formik'
import { DeleteItem } from '../components/DeleteItem'
import { kravNumView, kravName } from './KravPage'
import { ettlevColors, maxPageWidth, pageWidth } from '../util/theme'
import { chevronLeft, editIcon } from '../components/Images'
import CustomizedLink from '../components/common/CustomizedLink'

export const etterlevelseName = (etterlevelse: Etterlevelse) => `${kravNumView(etterlevelse)}`

export const kravLink = (kravNummer: string) => {
  return kravNummer.replace('.', '/').replace('K', '/krav/')
}

export const etterlevelseStatus = (status?: EtterlevelseStatus) => {
  if (!status) return ''
  switch (status) {
    case EtterlevelseStatus.UNDER_REDIGERING:
      return 'Under redigering'
    case EtterlevelseStatus.FERDIG:
      return 'Ferdig'
    default:
      return status
  }
}

export const EtterlevelsePage = () => {
  const params = useParams<{ id?: string }>()
  const [etterlevelse, setEtterlevelse, kravNavn] = useEtterlevelse(params.id)
  const [edit, setEdit] = useState(etterlevelse && !etterlevelse.id)
  const formRef = useRef<FormikProps<any>>()
  const history = useHistory()

  const loading = !edit && !etterlevelse

  return (
    <Block width='100%' overrides={{ Block: { props: { role: 'main' } } }}>
      {loading && <LoadingSkeleton header='Etterlevelse' />}
      {!loading &&
        <Block backgroundColor={ettlevColors.green800} display='flex' width='100%' justifyContent='center' paddingBottom='32px'>
          <Block maxWidth={maxPageWidth} width='100%'>
            <Block paddingLeft='40px' paddingRight='40px' display='flex' flexDirection='column' justifyContent='center'>
              <Block display='flex' width='100%' justifyContent='center' marginTop='24px'>
                <Block display='flex' alignItems='center' width='100%'>
                  <Block flex='1' display='flex' justifyContent='flex-start'>
                    <RouteLink href={'/etterlevelse'} hideUnderline>
                      <Button startEnhancer={<img alt={'Chevron left'} src={chevronLeft} />} size='compact' kind='tertiary'
                        $style={{ color: '#F8F8F8', ':hover': { backgroundColor: 'transparent', textDecoration: 'underline 3px' } }}> Tilbake</Button>
                    </RouteLink>
                  </Block>

                  <Block flex='1' display={['none', 'none', 'none', 'none', 'flex', 'flex']} justifyContent='flex-end'>
                    {etterlevelse?.id && user.canWrite() && <DeleteItem fun={() => deleteEtterlevelse(etterlevelse.id)} redirect={'/etterlevelse'} />}
                    {((etterlevelse?.id && user.canWrite())) &&
                      <Button
                        startEnhancer={<img src={editIcon} alt='edit' />}
                        size='compact'
                        $style={{ color: '#F8F8F8', ':hover': { backgroundColor: 'transparent', textDecoration: 'underline 3px' } }}
                        kind={'tertiary'}
                        onClick={() => setEdit(!edit)}
                        marginLeft
                      >
                        {edit ? 'Avbryt' : 'Rediger'}
                      </Button>
                    }
                    {edit &&
                      <Button
                        size='compact'
                        $style={{ color: '#F8F8F8', ':hover': { backgroundColor: 'transparent', textDecoration: 'underline 3px' } }}
                        kind={'tertiary'}
                        onClick={() => !formRef.current?.isSubmitting && formRef.current?.submitForm()}
                        marginLeft
                      >
                        Lagre
                      </Button>
                    }
                  </Block>
                </Block>
              </Block>
            </Block>

            <Block paddingLeft='40px' marginTop='31px' paddingRight='40px' width='calc(100% - 80px)' display='flex' justifyContent='center'>
              <Block maxWidth={pageWidth} width='100%' marginTop='7px'>
                <H1 $style={{ color: ettlevColors.grey25 }}>Etterlevelse</H1>
                {etterlevelse && etterlevelse?.kravNummer !== 0 && (
                  <CustomizedLink
                    style={{
                      color: ettlevColors.grey25,
                      fontSize: '18px',
                      fontWeight: 700,
                      lineHeight: '23px'
                    }}
                    href={kravLink(etterlevelseName(etterlevelse))}
                  >
                    {etterlevelseName(etterlevelse) + ' ' + kravNavn}
                  </CustomizedLink>
                )}
              </Block>
            </Block>
          </Block>
        </Block>
      }

      <Block display='flex' width='calc(100% - 80px)' justifyContent='center' paddingLeft='40px' paddingRight='40px'>
        <Block maxWidth={pageWidth} width='100%'>
          {!edit && etterlevelse && !loading &&
            <ViewEtterlevelse etterlevelse={etterlevelse} />}
          {
            edit && etterlevelse &&

            <EditEtterlevelse etterlevelse={etterlevelse} formRef={formRef} close={k => {
              if (k) {
                setEtterlevelse(k)
                if (k.id !== etterlevelse.id) {
                  history.push(`/etterlevelse/${k.id}`)
                }
              }
              setEdit(false)
            }} />

          }
        </Block>
      </Block>
    </Block >
  )
}
