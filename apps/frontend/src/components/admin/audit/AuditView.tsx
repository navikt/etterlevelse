import moment from 'moment'
import { Block } from 'baseui/block'
import ReactJson from 'react-json-view'
import React, { useEffect, useState } from 'react'
import { LabelLarge } from 'baseui/typography'
import { AuditActionIcon, AuditLabel as Label } from './AuditComponents'
import { Card } from 'baseui/card'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBinoculars, faExchangeAlt, faTimes } from '@fortawesome/free-solid-svg-icons'
import { PLACEMENT, StatefulTooltip } from 'baseui/tooltip'
import { StatefulPopover } from 'baseui/popover'
import DiffViewer from 'react-diff-viewer'
import { Spinner } from 'baseui/spinner'
import { useRefs } from '../../../util/hooks'
import { theme } from '../../../util'
import { intl } from '../../../util/intl/intl'
import { AuditAction, AuditLog } from './AuditTypes'
import { ObjectLink } from '../../common/RouteLink'
import Button from '../../common/Button'
import { ettlevColors } from '../../../util/theme'

type AuditViewProps = {
  auditLog?: AuditLog
  auditId?: string
  loading: boolean
  viewId: (id: string) => void
}

function initialOpen(auditLog?: AuditLog, auditId?: string) {
  return auditLog?.audits.map((o, i) => i === 0 || o.id === auditId) || []
}

export const AuditView = (props: AuditViewProps) => {
  const { auditLog, auditId, loading, viewId } = props
  const refs = useRefs<HTMLDivElement>(auditLog?.audits.map((al) => al.id) || [])
  const [open, setOpen] = useState(initialOpen(auditLog, auditId))

  useEffect(() => {
    if (auditId && auditLog && refs[auditId] && auditId !== auditLog.audits[0].id) {
      refs[auditId].current!.scrollIntoView({ block: 'start' })
    }
    setOpen(initialOpen(auditLog, auditId))
  }, [auditId, auditLog])

  const logFound = auditLog && !!auditLog.audits.length
  const newestAudit = auditLog?.audits[0]

  return (
    <Card>
      {loading && <Spinner $color={ettlevColors.green400} $size={theme.sizing.scale2400} />}
      {!loading && auditLog && !logFound && <LabelLarge>{intl.auditNotFound}</LabelLarge>}

      {logFound && (
        <>
          <Block display="flex" justifyContent="space-between">
            <Block width="90%">
              <Label label={intl.id}>{auditLog?.id}</Label>
              <Label label={intl.table}>{newestAudit?.table}</Label>
              <Label label={intl.audits}>{auditLog?.audits.length}</Label>
            </Block>
            <Block display="flex">
              <Button size="compact" kind="tertiary" marginRight onClick={() => setOpen(auditLog!.audits.map(() => true))}>
                Åpne alle
              </Button>
              {newestAudit?.action !== AuditAction.DELETE && (
                <StatefulTooltip content={() => intl.view} placement={PLACEMENT.top}>
                  <Block>
                    <ObjectLink id={newestAudit!.tableId} type={newestAudit!.table} audit={newestAudit}>
                      <Button size="compact" shape="round" kind="tertiary">
                        <FontAwesomeIcon icon={faBinoculars} />
                      </Button>
                    </ObjectLink>
                  </Block>
                </StatefulTooltip>
              )}
              <StatefulTooltip content={() => intl.close} placement={PLACEMENT.top}>
                <Block>
                  <Button size="compact" shape="round" kind="tertiary" onClick={() => viewId('')}>
                    <FontAwesomeIcon icon={faTimes} />
                  </Button>
                </Block>
              </StatefulTooltip>
            </Block>
          </Block>

          {auditLog &&
            auditLog.audits.map((audit, index) => {
              const time = moment(audit.time)
              return (
                <Block key={audit.id} ref={refs[audit.id]} marginBottom="1rem" marginTop=".5rem" backgroundColor={audit.id === props.auditId ? theme.colors.mono200 : undefined}>
                  <Block display="flex" justifyContent="space-between">
                    <Block width="90%">
                      <Label label={intl.auditNr}>{auditLog.audits.length - index}</Label>
                      <Label label={intl.action}>
                        <AuditActionIcon action={audit.action} withText={true} />
                      </Label>
                      <Label label={intl.time}>
                        {time.format('LL')} {time.format('HH:mm:ss.SSS Z')}
                      </Label>
                      <Label label={intl.user}>{audit.user}</Label>
                    </Block>
                    <Block>
                      <StatefulPopover
                        placement={PLACEMENT.left}
                        content={() => (
                          <Card>
                            <DiffViewer
                              leftTitle="Previous"
                              rightTitle="Current"
                              oldValue={JSON.stringify(auditLog?.audits[index + 1]?.data, null, 2)}
                              newValue={JSON.stringify(audit.data, null, 2)}
                            />
                          </Card>
                        )}
                        overrides={{
                          Body: {
                            style: () => ({
                              width: '80%',
                              maxHeight: '80%',
                              overflowY: 'scroll',
                            }),
                          },
                        }}
                      >
                        <div>
                          <Button size="compact" shape="round" kind="tertiary">
                            <FontAwesomeIcon icon={faExchangeAlt} />
                          </Button>
                        </div>
                      </StatefulPopover>
                    </Block>
                  </Block>
                  <ReactJson
                    src={audit.data}
                    name={null}
                    shouldCollapse={(p) => p.name === null && !open[index]}
                    onSelect={(sel) => {
                      ; (sel.name === 'id' || sel.name?.endsWith('Id')) && viewId(sel.value as string)
                    }}
                  />
                </Block>
              )
            })}
        </>
      )}
    </Card>
  )
}

const test = { 
  "id": "03ff5bb4-4d1d-4da2-b452-d6263657c317",
   "data": { 
    "id": "03ff5bb4-4d1d-4da2-b452-d6263657c317", 
    "navn": "Fødselsnummer skal bare brukes der det er nødvendig for å oppnå sikker identifisering ", 
    "status": "AKTIV",
    "tagger": [], 
    "hensikt": "Bruk av fødselsnummer er effektivt for å forhindre forveksling og vil dermed sikre kvalitet på personopplysningene. Samtidig muliggjør fødselsnummeret en sikker identifisering på tvers av systemer, og det legger til rette for enkel sammenstilling av personopplysninger fra forskjellige registre. Derfor må slik entydig identifisering være nødvendig for at vi kan bruke det.", "periode": { "slutt": null, "start": null, "active": true }, "avdeling": "KUN", "regelverk": [{ "lov": "PERSONOPPLYSNINGSLOVEN", "spesifisering": "§ 12" }, { "lov": "PERSONVERNFORORDNINGEN", "spesifisering": "artikkel 87" }], "begrepIder": ["BEGREP-168"], "kravNummer": 109, "beskrivelse": null, "kravVersjon": 1, "relevansFor": ["VEDTAKSBEHANDLING", "PERSONOPPLYSNINGER"], "rettskilder": [], "dokumentasjon": [], "underavdeling": "JURIDISK", "implementasjoner": [], "suksesskriterier": [{ "id": 1, "navn": "Vi har avklart etter en konkret vurdering at det er nødvendig å bruke fødselsnummer.", "beskrivelse": "### 1. Vi har avklart etter en konkret vurdering at det er nødvendig å bruke fødselsnummer. \n\n\nFødselsnummer regnes ikke som særlig kategori av personopplysninger, men det er likevel klare grenser for bruken av det. Vi kan bruke fødselsnummer der det er nødvendig for å skille enkeltmennesker fra hverandre på en sikker måte. I noen tilfeller vil det ikke være nødvendig å bruke fødselsnummer. Det kan for eksempel brukes fødselsdato, kundenummer, ansattnummer e.l. \nNAV vil i de fleste tilfeller ha saklig behov for å bruke fødselsnummer. \n  \nDe samme vilkårene gjelder for bruk av andre entydige identifikasjonsmidler, for eksempel D-nummer, fingeravtrykk, ansiktsgjenkjenning og andre biometriske data." }, { "id": 2, "navn": "Det er gjennomført tiltak for å sikre at fødselsnummer bare er tilgjengelig for mottakeren hvis det sendes i brev, e-post eller sms.", "beskrivelse": "### 2. Det er gjennomført tiltak for å sikre at fødselsnummer bare er tilgjengelig for mottakeren hvis det sendes i brev, e-post eller sms.\n\n\nNår fødselsnummer sendes, skal det ikke være tilgjengelig for andre enn mottakeren. \nBruk lukket konvolutt hvis dere sender fødselsnummer i et brev. Fødselsnummeret skal ikke være synlig i konvoluttvinduet eller være skrevet på utsiden av konvolutten. \nKrypter fødselsnummeret hvis dere sender det i e-post eller over internett. Alminnelig usikret e-post eller annen ukryptert internettkommunikasjon gir ikke tilfredsstillende informasjonssikkerhet." }], "versjonEndringer": null, "varslingsadresser": [{ "type": "EPOST", "adresse": "nav.personvern@nav.no" }],
     "utdypendeBeskrivelse": null 
    },
     "type": "Krav", 
     "version": 1, 
     "createdBy": "S139733 - Sæther, Siv Mari", 
     "createdDate": "2021-04-21T14:52:41.807329", 
     "lastModifiedBy": "S139733 - Sæther, Siv Mari", 
     "lastModifiedDate": "2021-05-06T08:51:44.119242289" 
    }