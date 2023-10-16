import { Etterlevelse, EtterlevelseMetadata, EtterlevelseStatus, KRAV_FILTER_TYPE, KravQL, KravStatus } from '../../../constants'
import { Form, Formik, FormikProps, validateYupSchema, yupToFormErrors } from 'formik'
import { mapEtterlevelseToFormValue } from '../../../api/EtterlevelseApi'
import { Block } from 'baseui/block'
import Button from '../../common/Button'
import React, { useEffect } from 'react'

import { HeadingXLarge, LabelSmall, ParagraphMedium, ParagraphXSmall } from 'baseui/typography'
import { ettlevColors, responsivePaddingInnerPage, responsiveWidthInnerPage, theme } from '../../../util/theme'
import { SuksesskriterierBegrunnelseEdit } from './SuksesskriterieBegrunnelseEdit'
import { KIND as NKIND, Notification } from 'baseui/notification'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import { borderColor, borderRadius, borderStyle, borderWidth, marginAll } from '../../common/Style'
import moment from 'moment'
import { CustomizedAccordion, CustomizedPanel } from '../../common/CustomizedAccordion'
import { AllInfo } from '../../krav/ViewKrav'
import CustomizedModal from '../../common/CustomizedModal'
import { useNavigate } from 'react-router-dom'
import EtterlevelseCard from '../EtterlevelseCard'
import { ModalHeader } from 'baseui/modal'
import { etterlevelseSchema } from './etterlevelseSchema'
import _ from 'lodash'
import { Checkbox } from 'baseui/checkbox'
import { DateField } from '../../common/Inputs'
import EditNotatfelt from '../../etterlevelseMetadata/EditNotatfelt'
import { notesIcon, notesWithContentIcon } from '../../Images'
import { syncEtterlevelseKriterieBegrunnelseWithKrav } from '../../etterlevelseDokumentasjonTema/common/utils'

type EditProps = {
  krav: KravQL
  etterlevelse: Etterlevelse
  submit: (etterlevelse: Etterlevelse) => Promise<void>
  formRef?: React.RefObject<any>
  varsleMelding?: string
  disableEdit: boolean
  documentEdit?: boolean
  close: (k?: Etterlevelse | undefined) => void
  setIsAlertUnsavedModalOpen: (state: boolean) => void
  isAlertUnsavedModalOpen: boolean
  navigatePath: string
  setNavigatePath: (state: string) => void
  editedEtterlevelse?: Etterlevelse
  tidligereEtterlevelser?: Etterlevelse[]
  viewMode?: boolean
  kravFilter: KRAV_FILTER_TYPE
  etterlevelseMetadata: EtterlevelseMetadata
  setEtterlevelseMetadata: React.Dispatch<React.SetStateAction<EtterlevelseMetadata>>
}

export const EtterlevelseEditFields = ({
  krav,
  etterlevelse,
  submit,
  formRef,
  disableEdit,
  documentEdit,
  close,
  setIsAlertUnsavedModalOpen,
  isAlertUnsavedModalOpen,
  navigatePath,
  setNavigatePath,
  editedEtterlevelse,
  tidligereEtterlevelser,
  viewMode,
  kravFilter,
  etterlevelseMetadata,
  setEtterlevelseMetadata,
}: EditProps) => {
  const [etterlevelseStatus] = React.useState<string>(
    editedEtterlevelse ? editedEtterlevelse.status : etterlevelse.status || EtterlevelseStatus.UNDER_REDIGERING,
  )
  const [radioHover] = React.useState<string>('')
  const [isOppfylesSenere, setOppfylesSenere] = React.useState<boolean>(etterlevelseStatus === EtterlevelseStatus.OPPFYLLES_SENERE)
  const [isNotatfeltOpen, setIsNotatfeltOpen] = React.useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    if (navigatePath) {
      if (
        _.isEqualWith(mapEtterlevelseToFormValue(etterlevelse, krav), formRef?.current.values) ||
        kravFilter === KRAV_FILTER_TYPE.UTGAATE_KRAV ||
        kravFilter === KRAV_FILTER_TYPE.BORTFILTTERTE_KRAV
      ) {
        navigate(navigatePath)
      } else if (kravFilter === KRAV_FILTER_TYPE.RELEVANTE_KRAV) {
        setIsAlertUnsavedModalOpen(true)
      }
    }
  }, [navigatePath])

  const getTidligereEtterlevelser = () => {
    return <Block>{tidligereEtterlevelser && tidligereEtterlevelser.length > 0 && <EtterlevelseCard etterlevelse={tidligereEtterlevelser[0]} />}</Block>
  }

  return (
    <div className="w-full">
      <div className="flex flex-row-reverse">
        <Button
          notBold
          onClick={() => setIsNotatfeltOpen(true)}
        >
          <div>
            <Block>{etterlevelseMetadata.notater ? <img src={notesWithContentIcon} alt="Notater med innohold" /> : <img src={notesIcon} alt="Notater" />}</Block>
            {etterlevelseMetadata.notater ? 'Vis arbeidsnotat' : 'Lag arbeidsnotat'}
          </div>
        </Button>
      </div>
      <EditNotatfelt
        isOpen={isNotatfeltOpen}
        setIsNotatfeltOpen={setIsNotatfeltOpen}
        etterlevelseMetadata={etterlevelseMetadata}
        setEtterlevelseMetadata={setEtterlevelseMetadata}
      />

      {viewMode === false ? (
        <Formik
          onSubmit={submit}
          initialValues={editedEtterlevelse ? mapEtterlevelseToFormValue(editedEtterlevelse) : mapEtterlevelseToFormValue(etterlevelse)}
          validate={(value) => {
            const mutatedEtterlevelse = value
            value.suksesskriterieBegrunnelser = syncEtterlevelseKriterieBegrunnelseWithKrav(value, krav)

            try {
              validateYupSchema(mutatedEtterlevelse, etterlevelseSchema(), true, { status: value.status })
            } catch (err) {
              return yupToFormErrors(err)
            }
          }}
          innerRef={formRef}
          validateOnChange={false}
          validateOnBlur={false}
        >
          {({ values, isSubmitting, submitForm, errors, setFieldError }: FormikProps<Etterlevelse>) => (
            <div className="lg:-mt-24 flex flex-col items-center">
              <div className="w-8/12">
                <Form>
                  <Block>
                    <Block>
                      {(etterlevelse.status === EtterlevelseStatus.IKKE_RELEVANT || etterlevelse.status === EtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT) && (
                        <ParagraphMedium $style={{ fontStyle: 'italic' }}>Dette kravet er dokumentert som ikke relevant 20.05.2022</ParagraphMedium>
                      )}

                      {(etterlevelse.status === EtterlevelseStatus.IKKE_RELEVANT || etterlevelse.status === EtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT) && (
                        <Block marginBottom="48px">
                          <LabelSmall $style={{ lineHeight: '32px' }}>Beskrivelse av hvorfor kraver er ikke relevant</LabelSmall>
                          <ParagraphMedium>{etterlevelse.statusBegrunnelse}</ParagraphMedium>
                        </Block>
                      )}
                      <Block display={'flex'} width={'100%'} marginBottom={'16px'}>
                        <LabelSmall minWidth={'fit-content'}>Hvilke suksesskriterier er oppfylt?</LabelSmall>
                        {tidligereEtterlevelser && tidligereEtterlevelser.length > 0 && (
                          <Block display="flex" width="100%" justifyContent="flex-end">
                            {getTidligereEtterlevelser()}
                          </Block>
                        )}
                      </Block>

                      <SuksesskriterierBegrunnelseEdit disableEdit={disableEdit} suksesskriterie={krav.suksesskriterier} viewMode={false} />

                      <Block marginBottom="24px">
                        <CustomizedAccordion>
                          {/*The commented code block is part of a feature that will be implemented later.*/}
                          {/*<CustomizedPanel*/}
                          {/*  title="Krav du bør se i relasjon til dette"*/}
                          {/*  overrides={{ Content: { style: { backgroundColor: ettlevColors.white, paddingLeft: '20px', paddingRight: '20px' } } }}*/}
                          {/*>*/}
                          {/*  <Block />*/}
                          {/*</CustomizedPanel>*/}
                          <CustomizedPanel
                            title={
                              <Block>
                                <HeadingXLarge marginTop={theme.sizing.scale100} marginBottom={theme.sizing.scale100} color={ettlevColors.green600}>
                                  Lenker og annen informasjon om kravet
                                </HeadingXLarge>
                              </Block>
                            }
                            overrides={{ Content: { style: { backgroundColor: ettlevColors.white, paddingLeft: '20px', paddingRight: '20px' } } }}
                          >
                            <Block width="100%" height="1px" backgroundColor="#E3E3E3" />
                            <AllInfo krav={krav} alleKravVersjoner={[{ kravNummer: krav.kravNummer, kravVersjon: krav.kravVersjon, kravStatus: krav.status }]} />
                          </CustomizedPanel>
                        </CustomizedAccordion>
                      </Block>

                      <Block width={'100%'} marginTop={'65px'}>
                        {Object.keys(errors).length > 0 && (
                          <Block display="flex" width="100%">
                            <Block width="100%">
                              <Notification
                                overrides={{
                                  Body: {
                                    style: {
                                      width: 'auto',
                                      ...borderStyle('solid'),
                                      ...borderWidth('1px'),
                                      ...borderColor(ettlevColors.red600),
                                      ...borderRadius('4px'),
                                    },
                                  },
                                }}
                                kind={NKIND.negative}
                              >
                                <Block display="flex" justifyContent="center">
                                  <FontAwesomeIcon
                                    icon={faTimesCircle}
                                    style={{
                                      marginRight: '5px',
                                    }}
                                  />
                                  <ParagraphMedium marginBottom="0px" marginTop="0px" $style={{ lineHeight: '18px' }}>
                                    Du må fylle ut alle obligatoriske felter
                                  </ParagraphMedium>
                                </Block>
                              </Notification>
                            </Block>
                          </Block>
                        )}
                      </Block>
                    </Block>
                  </Block>
                </Form>
              </div>

              <Block width="100%" backgroundColor={kravFilter === KRAV_FILTER_TYPE.UTGAATE_KRAV ? 'transparent' : ettlevColors.green100}>
                {!documentEdit && (
                  <div
                    className="flex w-full items-center justify-end gap-12 px-8"
                  >
                    {kravFilter === KRAV_FILTER_TYPE.RELEVANTE_KRAV && (
                      <Block display="flex" flexDirection="column" paddingTop="27px" paddingBottom="24px" minWidth={'fit-content'}>
                        <Checkbox
                          checked={isOppfylesSenere}
                          onChange={() => {
                            setOppfylesSenere(!isOppfylesSenere)
                          }}
                          key={EtterlevelseStatus.OPPFYLLES_SENERE}
                          overrides={{
                            Root: {
                              style: {
                                textUnderlineOffset: '3px',
                                ':hover': { textDecoration: 'underline 1px' },
                                marginRight: 'auto',
                              },
                            },
                            ToggleInner: {
                              style: {
                                backgroundColor: ettlevColors.white,
                                ':hover': { backgroundColor: ettlevColors.white },
                                ':active': { backgroundColor: ettlevColors.green600 },
                              },
                            },
                            Checkmark: {
                              style: ({ $isFocused }) => ({
                                outlineColor: $isFocused ? ettlevColors.focusOutline : undefined,
                                outlineWidth: $isFocused ? '3px' : undefined,
                                outlineStyle: $isFocused ? 'solid' : undefined,
                              }),
                            },
                          }}
                        >
                          <Block $style={{ textDecoration: radioHover === EtterlevelseStatus.OPPFYLLES_SENERE ? 'underline' : 'none' }}>
                            <ParagraphMedium $style={{ lineHeight: '22px' }} marginTop="0px" marginBottom="0px">
                              Kravet skal etterleves senere
                            </ParagraphMedium>
                          </Block>
                        </Checkbox>

                        {isOppfylesSenere && (
                          <Block width="100%" marginLeft="33px">
                            <Block maxWidth="170px" width="100%">
                              <DateField error={!!errors.fristForFerdigstillelse} label="Dato" name="fristForFerdigstillelse" />
                            </Block>
                            {/* {errors.fristForFerdigstillelse && (
                            <Block display="flex" width="100%" marginTop=".2rem">
                              <Block width="100%">
                                <Notification
                                  overrides={{
                                    Body: {
                                      style: { width: 'auto', ...paddingZero, marginTop: 0, backgroundColor: 'transparent', color: ettlevColors.red600 },
                                    },
                                  }}
                                  kind={NKIND.negative}
                                >
                                  {errors.fristForFerdigstillelse}
                                </Notification>
                              </Block>
                            </Block>
                          )} */}
                          </Block>
                        )}
                      </Block>
                    )}
                    <div className="flex flex-col">
                      <Block paddingTop="27px" paddingBottom="24px" width="100%">
                        <Button disabled={krav.status === KravStatus.UTGAATT ? false : disableEdit} type="button" variant="secondary" marginRight onClick={close}>
                          {krav.status === KravStatus.UTGAATT ? 'Lukk' : 'Avbryt og forkast endringene'}
                        </Button>
                        {kravFilter === KRAV_FILTER_TYPE.UTGAATE_KRAV && (
                          <Button
                            type="button"
                            variant="secondary"
                            marginRight
                            disabled={isSubmitting || disableEdit}
                            onClick={() => {
                              submitForm()
                            }}
                          >
                            Lagre endringer
                          </Button>
                        )}
                        {kravFilter === KRAV_FILTER_TYPE.RELEVANTE_KRAV && (
                          <>
                            <Button
                              type="button"
                              // kind="secondary"
                              marginRight
                              disabled={isSubmitting || disableEdit}
                              onClick={() => {
                                if (values.status === EtterlevelseStatus.FERDIG_DOKUMENTERT || !isOppfylesSenere) {
                                  values.status = EtterlevelseStatus.UNDER_REDIGERING
                                } else if (isOppfylesSenere) {
                                  values.status = EtterlevelseStatus.OPPFYLLES_SENERE
                                }
                                submitForm()
                              }}
                            >
                              Lagre og fortsett senere
                            </Button>
                            <Button
                              disabled={disableEdit || isOppfylesSenere}
                              type="button"
                              onClick={() => {
                                values.status = EtterlevelseStatus.FERDIG_DOKUMENTERT
                                values.suksesskriterieBegrunnelser.forEach((skb, index) => {
                                  if (skb.begrunnelse === '' || skb.begrunnelse === undefined) {
                                    setFieldError(`suksesskriterieBegrunnelser[${index}]`, 'Du må fylle ut dokumentasjonen')
                                  }
                                })
                                submitForm()
                              }}
                            >
                              Ferdig utfylt
                            </Button>
                          </>
                        )}
                      </Block>
                      {etterlevelse.changeStamp.lastModifiedDate && etterlevelse.changeStamp.lastModifiedBy && (
                        <Block paddingBottom="16px" display="flex" justifyContent="flex-end" width="100%">
                          <ParagraphXSmall marginTop="0px" marginBottom="0px">
                            Sist utfylt: {moment(etterlevelse.changeStamp.lastModifiedDate).format('ll')} av {etterlevelse.changeStamp.lastModifiedBy.split('-')[1]}
                          </ParagraphXSmall>
                        </Block>
                      )}
                    </div>
                  </div>
                )}
              </Block>

              <CustomizedModal
                onClose={() => setIsAlertUnsavedModalOpen(false)}
                isOpen={isAlertUnsavedModalOpen}
                size="default"
                overrides={{
                  Dialog: {
                    style: {
                      ...borderRadius('0px'),
                      ...marginAll('0px'),
                      maxWidth: '500px',
                      width: '100%',
                    },
                  },
                }}
              >
                <Block width="100%">
                  <ModalHeader>Er du sikkert på at du vil forlate redigerings siden uten å lagre?</ModalHeader>
                  <Block paddingBottom="32px" paddingLeft="24px" paddingRight="32px" display="flex" justifyContent="flex-end">
                    <Button
                      onClick={() => {
                        if (values.status === EtterlevelseStatus.FERDIG_DOKUMENTERT) {
                          values.status = Object.values(EtterlevelseStatus).filter((e) => e === etterlevelseStatus)[0]
                        }
                        submitForm()
                        navigate(navigatePath)
                        setIsAlertUnsavedModalOpen(false)
                      }}
                    >
                      Lagre og fortsett
                    </Button>
                    <Button
                      marginLeft
                      onClick={() => {
                        setIsAlertUnsavedModalOpen(false)
                        setTimeout(() => navigate(navigatePath), 1)
                      }}
                    >
                      Fortsett uten å lagre
                    </Button>
                    <Button
                      marginLeft
                      variant="secondary"
                      onClick={() => {
                        setNavigatePath('')
                        setIsAlertUnsavedModalOpen(false)
                      }}
                    >
                      Avbryt
                    </Button>
                  </Block>
                </Block>
              </CustomizedModal>
            </div>
          )}
        </Formik>
      ) : (
        <Formik onSubmit={submit} initialValues={editedEtterlevelse ? mapEtterlevelseToFormValue(editedEtterlevelse) : mapEtterlevelseToFormValue(etterlevelse)} innerRef={formRef}>
          {() => (
            <Block>
              <Block marginTop="32px" justifyContent="center" width={responsiveWidthInnerPage} paddingLeft={responsivePaddingInnerPage} paddingRight={responsivePaddingInnerPage}>
                <Form>
                  <Block>
                    <Block>
                      {(etterlevelse.status === EtterlevelseStatus.IKKE_RELEVANT || etterlevelse.status === EtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT) && (
                        <ParagraphMedium $style={{ fontStyle: 'italic' }}>Dette kravet er dokumentert som ikke relevant 20.05.2022, og senere blitt bortfiltrert</ParagraphMedium>
                      )}

                      {(etterlevelse.status === EtterlevelseStatus.IKKE_RELEVANT || etterlevelse.status === EtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT) && (
                        <Block marginBottom="48px">
                          <LabelSmall $style={{ lineHeight: '32px' }}>Beskrivelse av hvorfor kraver er ikke relevant</LabelSmall>
                          <ParagraphMedium>{etterlevelse.statusBegrunnelse}</ParagraphMedium>
                        </Block>
                      )}

                      <SuksesskriterierBegrunnelseEdit disableEdit={true} suksesskriterie={krav.suksesskriterier} viewMode={true} />
                      <Block marginBottom="24px">
                        <CustomizedAccordion>
                          <CustomizedPanel
                            title="Lenker og annen informasjon om kravet"
                            overrides={{ Content: { style: { backgroundColor: ettlevColors.white, paddingLeft: '20px', paddingRight: '20px' } } }}
                          >
                            <Block width="100%" height="1px" backgroundColor="#E3E3E3" />
                            <AllInfo krav={krav} alleKravVersjoner={[{ kravNummer: krav.kravNummer, kravVersjon: krav.kravVersjon, kravStatus: krav.status }]} />
                          </CustomizedPanel>
                        </CustomizedAccordion>
                      </Block>
                    </Block>
                  </Block>
                </Form>
              </Block>
            </Block>
          )}
        </Formik>
      )}
    </div>
  )
}

export default EtterlevelseEditFields
