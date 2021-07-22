import { AdresseType, Begrep, KravQL } from '../../constants'
import { Block, Display, Responsive } from 'baseui/block'
import React from 'react'
import { kravStatus } from '../../pages/KravPage'
import { theme } from '../../util'
import moment from 'moment'
import { DotTag, DotTags } from '../common/DotTag'
import { ListName } from '../../services/Codelist'
import { Label, LabelAboveContent } from '../common/PropertyLabel'
import RouteLink, { ExternalLink, ObjectLink } from '../common/RouteLink'
import { slackLink, slackUserLink, termUrl } from '../../util/config'
import { user } from '../../services/User'
import { LovViewList } from '../Lov'
import { SuksesskriterieCard } from './Suksesskriterie'
import { Paragraph2 } from 'baseui/typography'
import CustomizedLink from '../common/CustomizedLink'
import { getKravByKravNummer } from '../../api/KravApi'

const LabelWrapper = ({ children }: { children: React.ReactNode }) => (
  <Block marginTop="48px" marginBottom="48px">
    {children}
  </Block>
)

const responsiveView: Responsive<Display> = ['block', 'block', 'block', 'flex', 'flex', 'flex']

export const ViewKrav = ({ krav }: { krav: KravQL }) => {
  return (
    <Block width="100%">
      {krav.suksesskriterier.map((s, i) => (
        <SuksesskriterieCard key={s.id} suksesskriterie={s} num={i + 1} totalt={krav.suksesskriterier.length} />
      ))}
      <Block height={theme.sizing.scale1000} />

      {/* <LabelAboveContent header title='Beskrivelse' markdown={krav.beskrivelse} /> */}

      <Block height={theme.sizing.scale800} />

      {<AllInfo krav={krav} />}
    </Block>
  )
}

const MediumInfo = ({ krav }: { krav: KravQL }) => (
  <>
    <Label title="Status">{kravStatus(krav.status)}</Label>
    <Label title="Underavdeling">
      <ObjectLink id={krav.underavdeling?.code} type={ListName.UNDERAVDELING}>
        {krav.underavdeling?.shortName}
      </ObjectLink>
    </Label>
  </>
)

type KravVersjon = {
  kravNummer?: string | number
  kravVersjon?: string | number
}

const AllInfo = ({ krav }: { krav: KravQL }) => {
  const [tidligereKravVersjoner, setTidligereKravVersjoner] = React.useState<KravVersjon[]>([])

  React.useEffect(() => {
    getKravByKravNummer(krav.kravNummer).then((resp) => {
      if (resp.content.length) {
        const tidligereVersjoner = resp.content.slice(0, -1).map((k) => { return { kravVersjon: k.kravVersjon, kravNummer: k.kravNummer } })
        if (!tidligereVersjoner.find(k => k.kravVersjon === krav.kravVersjon)) {
          setTidligereKravVersjoner(tidligereVersjoner)
        } else {
          setTidligereKravVersjoner([])
        }
      }
    })
  }, [krav])

  return (
    <>
      {/* <LabelWrapper>
      <LabelAboveContent header title='Utfyllende beskrivelse' markdown={krav.utdypendeBeskrivelse} />
    </LabelWrapper> */}

      {/* <LabelWrapper>
      <LabelAboveContent header title='Endringer fra forrige versjon' markdown={krav.versjonEndringer} />
    </LabelWrapper> */}

      <LabelWrapper>
        <LabelAboveContent header title="Dokumentasjon" markdown={krav.dokumentasjon} />
      </LabelWrapper>

      {/* <LabelWrapper>
      <LabelAboveContent header title='Rettskilder' markdown={krav.rettskilder} />
    </LabelWrapper> */}

      {user.isKraveier() && (
        <LabelWrapper>
          <LabelAboveContent header title="Etiketter">
            {krav.tagger.join(', ')}
          </LabelAboveContent>
        </LabelWrapper>
      )}

      <LabelWrapper>
        <LabelAboveContent header title="Relevante implementasjoner" markdown={krav.implementasjoner} />
      </LabelWrapper>

      <LabelWrapper>
        <LabelAboveContent header title="Begreper">
          {krav.begreper.map((b, i) => (
            <BegrepView key={i} begrep={b} />
          ))}
        </LabelAboveContent>
      </LabelWrapper>

      {/* <LabelAboveContent title='Avdeling'>{krav.avdeling?.shortName}</LabelAboveContent> */}

      <LabelWrapper>
        <LabelAboveContent header title="Kravet er relevant for">
          <DotTags list={ListName.RELEVANS} codes={krav.relevansFor} inColumn />
        </LabelAboveContent>
      </LabelWrapper>

      {tidligereKravVersjoner.length !== 0 && <LabelWrapper>
        <LabelAboveContent title="Tidligere versjoner">
          {tidligereKravVersjoner.map((k) => (
            <DotTag>
              <RouteLink href={'/krav/' + k.kravNummer + '/' + k.kravVersjon}>
                K{k.kravNummer}.{k.kravVersjon}
              </RouteLink>
            </DotTag>
          ))}
        </LabelAboveContent>
      </LabelWrapper>}

      <Block backgroundColor="#F1F1F1" padding="32px">
        <Label display={responsiveView} title="Ansvarlig">{krav.underavdeling?.shortName}</Label>

        <Label display={responsiveView} title="Regelverk" hide={!krav.regelverk.length}>
          <LovViewList regelverk={krav.regelverk} />
        </Label>

        <Label display={responsiveView} title="Varslingsadresser" hide={!user.isKraveier()}>
          <DotTags
            items={krav.varslingsadresser.map((va, i) => {
              if (va.type === AdresseType.SLACK)
                return (
                  <Block>
                    Slack: <CustomizedLink href={slackLink(va.adresse)}>#{va.slackChannel?.name || va.adresse}</CustomizedLink>
                  </Block>
                )
              if (va.type === AdresseType.SLACK_USER)
                return (
                  <Block>
                    Slack: <CustomizedLink href={slackUserLink(va.adresse)}>{va.slackUser?.name || va.adresse}</CustomizedLink>
                  </Block>
                )
              return (
                <Block>
                  Epost: <CustomizedLink href={`mailto:${va.adresse}`}>{va.adresse}</CustomizedLink>
                </Block>
              )
            })}
          />
        </Label>

        <Label title="Status" display={responsiveView}>{kravStatus(krav.status)}</Label>
        {/* {krav.periode?.start && <Label title='Gyldig fom'>{formatDate(krav.periode?.start)}</Label>}
      {krav.periode?.slutt && <Label title='Gyldig tom'>{formatDate(krav.periode?.slutt)}</Label>} */}
      </Block>

      <Block>
        <Paragraph2>
          Sist endret: {moment(krav.changeStamp.lastModifiedDate).format('ll')} av {krav.changeStamp.lastModifiedBy.split(' - ')[1]}
        </Paragraph2>
      </Block>
    </>
  )
}

const BegrepView = ({ begrep }: { begrep: Begrep }) => (
  <DotTag>
    <ExternalLink href={termUrl(begrep.id)} label={'Link begrepskatalogen'}>
      {begrep.navn}
    </ExternalLink>{' '}
    - {begrep.beskrivelse}
  </DotTag>
)
