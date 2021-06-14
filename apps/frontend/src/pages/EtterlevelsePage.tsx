import {Block} from 'baseui/block'
import {H1} from 'baseui/typography'
import {useHistory, useParams} from 'react-router-dom'
import {useEtterlevelse} from '../api/EtterlevelseApi'
import React, {useEffect, useRef, useState} from 'react'
import {Etterlevelse, EtterlevelseStatus, Krav} from '../constants'
import Button from '../components/common/Button'
import {ViewEtterlevelse} from '../components/etterlevelse/ViewEtterlevelse'
import RouteLink from '../components/common/RouteLink'
import {LoadingSkeleton} from '../components/common/LoadingSkeleton'
import {FormikProps} from 'formik'
import {kravNumView} from './KravPage'
import {ettlevColors, maxPageWidth, pageWidth} from '../util/theme'
import {chevronLeft} from '../components/Images'
import CustomizedLink from '../components/common/CustomizedLink'
import {getKravByKravNummer} from '../api/KravApi'

export const etterlevelseName = (etterlevelse: Etterlevelse) =>
  `${kravNumView(etterlevelse)}`

export const kravLink = (kravNummer: string) => {
  return kravNummer.replace('.', '/').replace('K', '/krav/')
}

export const getEtterlevelseStatus = (status?: EtterlevelseStatus) => {
  if (!status) return ''
  switch (status) {
    case EtterlevelseStatus.UNDER_REDIGERING:
      return 'Under arbeid'
    case EtterlevelseStatus.FERDIG:
      return 'Oppfylt'
    case EtterlevelseStatus.OPPFYLLES_SENERE:
      return 'Oppfylles senere'
    case EtterlevelseStatus.IKKE_RELEVANT:
      return 'Ikke relevant'
    default:
      return status
  }
}

export const EtterlevelsePage = () => {
  const params = useParams<{id?: string}>()
  const [etterlevelse, setEtterlevelse] = useEtterlevelse(params.id)
  const [edit, setEdit] = useState(etterlevelse && !etterlevelse.id)
  const [krav, setKrav] = useState<Krav>()
  const formRef = useRef<FormikProps<any>>()
  const history = useHistory()

  const loading = !edit && !etterlevelse

  useEffect(() => {
    etterlevelse &&
      getKravByKravNummer(
        etterlevelse?.kravNummer,
        etterlevelse?.kravVersjon,
      ).then(setKrav)
  }, [etterlevelse])

  return (
    <Block width="100%" overrides={{Block: {props: {role: 'main'}}}}>
      {loading && <LoadingSkeleton header="Etterlevelse" />}
      {!loading && (
        <Block
          backgroundColor={ettlevColors.green800}
          display="flex"
          width="100%"
          justifyContent="center"
          paddingBottom="32px"
        >
          <Block maxWidth={maxPageWidth} width="100%">
            <Block
              paddingLeft="40px"
              paddingRight="40px"
              display="flex"
              flexDirection="column"
              justifyContent="center"
            >
              <Block
                display="flex"
                width="100%"
                justifyContent="center"
                marginTop="24px"
              >
                <Block display="flex" alignItems="center" width="100%">
                  <Block flex="1" display="flex" justifyContent="flex-start">
                    <RouteLink href={'/etterlevelse'} hideUnderline>
                      <Button
                        startEnhancer={
                          <img alt={'Chevron left'} src={chevronLeft} />
                        }
                        size="compact"
                        kind="tertiary"
                        $style={{
                          color: '#F8F8F8',
                          ':hover': {
                            backgroundColor: 'transparent',
                            textDecoration: 'underline 3px',
                          },
                        }}
                      >
                        {' '}
                        Tilbake
                      </Button>
                    </RouteLink>
                  </Block>

                  {/*
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
                  */}
                </Block>
              </Block>
            </Block>

            <Block
              paddingLeft="40px"
              marginTop="31px"
              paddingRight="40px"
              width="calc(100% - 80px)"
              display="flex"
              justifyContent="center"
            >
              <Block maxWidth={pageWidth} width="100%" marginTop="7px">
                <H1 $style={{color: ettlevColors.grey25}}>Etterlevelse</H1>
                {etterlevelse && etterlevelse?.kravNummer !== 0 && krav && (
                  <CustomizedLink
                    style={{
                      color: ettlevColors.grey25,
                      fontSize: '18px',
                      fontWeight: 700,
                      lineHeight: '23px',
                    }}
                    href={kravLink(etterlevelseName(etterlevelse))}
                  >
                    {etterlevelseName(etterlevelse) + ' ' + krav?.navn}
                  </CustomizedLink>
                )}
              </Block>
            </Block>
          </Block>
        </Block>
      )}

      <Block
        display="flex"
        width="calc(100% - 80px)"
        justifyContent="center"
        paddingLeft="40px"
        paddingRight="40px"
      >
        <Block maxWidth={pageWidth} width="100%">
          {etterlevelse && !loading && krav && (
            <ViewEtterlevelse
              etterlevelse={etterlevelse}
              setEtterlevelse={setEtterlevelse}
              loading={loading}
              krav={krav}
            />
          )}
          {/* {
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

          } */}
        </Block>
      </Block>
    </Block>
  )
}
