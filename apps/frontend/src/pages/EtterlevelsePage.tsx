import { Block } from 'baseui/block'
import { HeadingXXLarge, LabelSmall } from 'baseui/typography'
import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { useParams } from 'react-router-dom'
import { useEtterlevelse } from '../api/EtterlevelseApi'
import { getKravByKravNumberAndVersion } from '../api/KravApi'
import CustomizedBreadcrumbs, { IBreadcrumbPaths } from '../components/common/CustomizedBreadcrumbs'
import { LoadingSkeleton } from '../components/common/LoadingSkeleton'
import { ViewEtterlevelse } from '../components/etterlevelse/ViewEtterlevelse'
import { IEtterlevelse, IKrav } from '../constants'
import { ampli, userRoleEventProp } from '../services/Amplitude'
import { ListName, TemaCode, codelist } from '../services/Codelist'
import { ettlevColors, maxPageWidth, pageWidth, responsivePaddingSmall, responsiveWidthSmall } from '../util/theme'
import { kravNumView } from './KravPage'

export const etterlevelseName = (etterlevelse: IEtterlevelse) => `${kravNumView(etterlevelse)}`

export const kravLink = (kravNummer: string) => {
  return kravNummer.replace('.', '/').replace('K', '/krav/')
}

export const EtterlevelsePage = () => {
  const params = useParams<{ id?: string }>()
  const [etterlevelse] = useEtterlevelse(params.id)
  const [edit] = useState(etterlevelse && !etterlevelse.id)
  const [krav, setKrav] = useState<IKrav>()
  const [kravTema, setKravTema] = useState<TemaCode>()

  const loading = !edit && !etterlevelse

  useEffect(() => {
    etterlevelse &&
      getKravByKravNumberAndVersion(etterlevelse?.kravNummer, etterlevelse?.kravVersjon).then((res) => {
        if (res) {
          setKrav(res)
          const lovData = codelist.getCode(ListName.LOV, res.regelverk[0]?.lov?.code)
          if (lovData?.data) {
            setKravTema(codelist.getCode(ListName.TEMA, lovData.data.tema))
          }
        }
      })
    if (etterlevelse) {
      ampli.logEvent('sidevisning', {
        side: 'Etterlevelse side',
        sidetittel: `Etterlevelse: K${etterlevelse.kravNummer.toString()}.${etterlevelse.kravVersjon.toString()} ${krav?.navn}`,
        ...userRoleEventProp
      })
    }
  }, [etterlevelse])

  const getBreadcrumPaths = (): IBreadcrumbPaths[] => {
    const breadcrumbPaths: IBreadcrumbPaths[] = []

    breadcrumbPaths.push({
      pathName: 'Forstå kravene',
      href: '/tema',
    })

    if (kravTema && kravTema.shortName) {
      breadcrumbPaths.push({
        pathName: kravTema.shortName.toString(),
        href: '/tema/' + kravTema.code,
      })
    }

    breadcrumbPaths.push({
      pathName: `K${krav?.kravNummer}.${krav?.kravVersjon}`,
      href: '/krav/' + krav?.kravNummer + '/' + krav?.kravVersjon,
    })

    return breadcrumbPaths
  }

  return (
    <Block width="100%" id="content" overrides={{ Block: { props: { role: 'main' } } }}>
      {loading && <LoadingSkeleton header="Etterlevelse" />}
      {!loading && (
        <Block backgroundColor={ettlevColors.green800} display="flex" width="100%" justifyContent="center" paddingBottom="32px">
          <Helmet>
            <meta charSet="utf-8" />
            <title>Etterlevelse: {etterlevelse?.kravNummer ? 'K' + etterlevelse.kravNummer.toString() + '.' + etterlevelse.kravVersjon.toString() + ' ' + krav?.navn : ''} </title>
          </Helmet>
          <Block maxWidth={maxPageWidth} width="100%">
            <Block paddingLeft={responsivePaddingSmall} paddingRight={responsivePaddingSmall} display="flex" flexDirection="column" justifyContent="center">
              <Block display="flex" width="100%" justifyContent="center" marginTop="24px">
                <Block display="flex" alignItems="center" width="100%">
                  <Block flex="1" display="flex" justifyContent="flex-start">
                    {/* <RouteLink hideUnderline>
                      <Button
                        startEnhancer={<img alt={'Chevron left'} src={chevronLeft} />}
                        size="compact"
                        kind="tertiary"
                        $style={{ color: '#F8F8F8', ':hover': { backgroundColor: 'transparent', textDecoration: 'underline 3px' } }}
                      >
                        {' '}
                        Tilbake
                      </Button>
                    </RouteLink> */}
                    <CustomizedBreadcrumbs fontColor={ettlevColors.grey25} currentPage="Etterlevelse" paths={getBreadcrumPaths()} />
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

            <Block paddingLeft={responsivePaddingSmall} paddingRight={responsivePaddingSmall} width={responsiveWidthSmall} display="flex" justifyContent="center">
              <Block maxWidth={pageWidth} width="100%">
                <HeadingXXLarge marginTop="0px" $style={{ color: ettlevColors.grey25 }}>
                  Etterlevelse
                </HeadingXXLarge>
                {etterlevelse && etterlevelse?.kravNummer !== 0 && krav && (
                  <LabelSmall
                    $style={{
                      color: ettlevColors.grey25,
                      lineHeight: '23px',
                    }}
                  >
                    {etterlevelseName(etterlevelse) + ' ' + krav?.navn}
                  </LabelSmall>
                )}
              </Block>
            </Block>
          </Block>
        </Block>
      )}

      <Block display="flex" width={responsiveWidthSmall} justifyContent="center" paddingLeft={responsivePaddingSmall} paddingRight={responsivePaddingSmall}>
        <Block maxWidth={pageWidth} width="100%">
          {etterlevelse && !loading && krav && <ViewEtterlevelse etterlevelse={etterlevelse} loading={loading} krav={krav} />}
        </Block>
      </Block>
    </Block>
  )
}
