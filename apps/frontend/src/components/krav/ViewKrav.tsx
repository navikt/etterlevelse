import {AdresseType, Begrep, KravQL, KravVersjon} from '../../constants'
import {Block, Display, Responsive} from 'baseui/block'
import React from 'react'
import {kravStatus} from '../../pages/KravPage'
import {theme} from '../../util'
import moment from 'moment'
import {DotTag, DotTags} from '../common/DotTag'
import {ListName} from '../../services/Codelist'
import {Label, LabelAboveContent} from '../common/PropertyLabel'
import RouteLink, {ExternalLink, ObjectLink} from '../common/RouteLink'
import {slackLink, slackUserLink, termUrl} from '../../util/config'
import {user} from '../../services/User'
import {LovViewList} from '../Lov'
import {SuksesskriterieCard} from './Suksesskriterie'
import {Label3, Paragraph2} from 'baseui/typography'
import CustomizedLink from '../common/CustomizedLink'
import {CustomizedAccordion, CustomizedPanel} from '../common/CustomizedAccordion'
import {ettlevColors} from '../../util/theme'
import {borderStyle} from '../common/Style'
import {Markdown} from '../common/Markdown'
import ExpiredAlert from './ExpiredAlert'

const LabelWrapper = ({children}: { children: React.ReactNode }) => (
  <Block marginTop="48px" marginBottom="48px">
    {children}
  </Block>
)

const responsiveView: Responsive<Display> = ['block', 'block', 'block', 'flex', 'flex', 'flex']

export const ViewKrav = ({krav, alleKravVersjoner}: { krav: KravQL; alleKravVersjoner: KravVersjon[] }) => {
  return (
    <Block width="100%">
      {krav.suksesskriterier.map((s, i) => (
        <SuksesskriterieCard key={s.id} suksesskriterie={s} num={i + 1} totalt={krav.suksesskriterier.length}/>
      ))}
      <Block height={theme.sizing.scale1000}/>

      {/* <LabelAboveContent header title='Beskrivelse' markdown={krav.beskrivelse} /> */}

      <Block height={theme.sizing.scale800}/>

      {<AllInfo krav={krav} alleKravVersjoner={alleKravVersjoner}/>}
    </Block>
  )
}

const MediumInfo = ({krav}: { krav: KravQL }) => (
  <>
    <Label title="Status">{kravStatus(krav.status)}</Label>
    <Label title="Underavdeling">
      <ObjectLink id={krav.underavdeling?.code} type={ListName.UNDERAVDELING}>
        {krav.underavdeling?.shortName}
      </ObjectLink>
    </Label>
  </>
)

const AllInfo = ({krav, alleKravVersjoner}: { krav: KravQL; alleKravVersjoner: KravVersjon[] }) => {
  const hasKravExpired = () => {
    return krav && krav.kravVersjon < alleKravVersjoner[0].kravVersjon
  }

  return (
    <>
      {/* <LabelWrapper>
      <LabelAboveContent header title='Utfyllende beskrivelse' markdown={krav.utdypendeBeskrivelse} />
    </LabelWrapper> */}

      {/* <LabelWrapper>
      <LabelAboveContent header title='Endringer fra forrige versjon' markdown={krav.versjonEndringer} />
    </LabelWrapper> */}

      <LabelWrapper>
        <LabelAboveContent header title="Kilder">
          {
            krav.dokumentasjon.map(k => {
                const match = k.match(/\[(.*)\]\((.*)\)/m)
                return <DotTag>
                  <RouteLink href={match && match[2]}>
                    {match && match[1]}
                  </RouteLink>
                </DotTag>
              }
            )
          }
        </LabelAboveContent>
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
        <LabelAboveContent header title="Relevante implementasjoner" markdown={krav.implementasjoner}/>
      </LabelWrapper>

      <LabelWrapper>
        <LabelAboveContent header title="Begreper">
          {krav.begreper.map((b, i) => (
            <BegrepView key={i} begrep={b}/>
          ))}
        </LabelAboveContent>
      </LabelWrapper>

      {/* <LabelAboveContent title='Avdeling'>{krav.avdeling?.shortName}</LabelAboveContent> */}

      <LabelWrapper>
        <LabelAboveContent header title="Kravet er relevant for">
          <DotTags list={ListName.RELEVANS} codes={krav.relevansFor} inColumn/>
        </LabelAboveContent>
      </LabelWrapper>

      {alleKravVersjoner.length !== 0 && krav.kravVersjon > 1 && (
        <LabelWrapper>
          <LabelAboveContent title={'Tidligere versjoner'} header>
            {alleKravVersjoner.map((k) => {
              if (k.kravVersjon && k.kravVersjon < krav.kravVersjon) {
                return (
                  <DotTag>
                    <RouteLink href={'/krav/' + k.kravNummer + '/' + k.kravVersjon}>
                      K{k.kravNummer}.{k.kravVersjon}
                    </RouteLink>
                  </DotTag>
                )
              }
            })}
            {krav.versjonEndringer && (
              <Block marginTop={theme.sizing.scale900} marginBottom={theme.sizing.scale1600}>
                <CustomizedAccordion>
                  <CustomizedPanel
                    title={<Label3 $style={{color: ettlevColors.green800, marginRight: '7px'}}>Dette er nytt fra forrige versjon</Label3>}
                    overrides={{
                      Header: {
                        style: {
                          backgroundColor: 'transparent',
                          width: 'fit-content',
                          paddingLeft: '0px',
                          paddingBottom: '0px',
                          ':hover': {
                            boxShadow: 'none'
                          }
                        },
                      },
                      Content: {
                        style: {
                          backgroundColor: 'transparent',
                          borderBottomWidth: 'none',
                          borderBottomStyle: 'none',
                          borderBottomColor: 'none',
                        },
                      },
                      PanelContainer: {
                        style: {
                          ...borderStyle('hidden'),
                          backgroundColor: 'transparent'
                        }
                      }
                    }}
                  >
                    <Markdown source={krav.versjonEndringer} noMargin/>
                  </CustomizedPanel>
                </CustomizedAccordion>
              </Block>
            )}
          </LabelAboveContent>
        </LabelWrapper>
      )}

      {hasKravExpired() && (
        <Block $style={{marginTop: theme.sizing.scale900, marginBottom: theme.sizing.scale1200}}>
          <ExpiredAlert alleKravVersjoner={alleKravVersjoner}/>
        </Block>
      )}

      <Block backgroundColor="#F1F1F1" padding="32px">
        <Label display={responsiveView} title="Ansvarlig">
          {krav.underavdeling?.shortName}
        </Label>

        <Label display={responsiveView} title="Regelverk" hide={!krav.regelverk.length}>
          <LovViewList regelverk={krav.regelverk}/>
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

        <Label title="Status" display={responsiveView}>
          {kravStatus(krav.status)}
        </Label>
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

const BegrepView = ({begrep}: { begrep: Begrep }) => (
  <DotTag>
    <ExternalLink href={termUrl(begrep.id)} label={'Link begrepskatalogen'}>
      {begrep.navn}
    </ExternalLink>{' '}
    - {begrep.beskrivelse}
  </DotTag>
)
