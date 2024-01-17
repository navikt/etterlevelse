import { gql } from '@apollo/client'
import { Heading } from '@navikt/ds-react'
import { Block } from 'baseui/block'
import moment from 'moment'
import { arkPennIcon } from '../components/Images'
import { SkeletonPanel } from '../components/common/LoadingSkeleton'
import { PanelLink } from '../components/common/PanelLink'
import EditEtterlevelseDokumentasjonModal from '../components/etterlevelseDokumentasjon/edit/EditEtterlevelseDokumentasjonModal'
import { DokumentasjonTabs } from '../components/etterlevelseDokumentasjon/tabs/DokumentasjonsTabs'
import { PageLayout } from '../components/scaffold/Page'
import { ITeam, TEtterlevelseDokumentasjonQL } from '../constants'
import { ampli, userRoleEventProp } from '../services/Amplitude'

interface IDokumentasjonCount {
  dokumentasjonCount?: number
}

export type TCustomTeamObject = IDokumentasjonCount & ITeam

export const tabMarginBottom = '48px'

export const MyEtterlevelseDokumentasjonerPage = () => {
  ampli.logEvent('sidevisning', {
    side: 'Side for Dokumentasjoner',
    sidetittel: 'Dokumentere etterlevelse',
    ...userRoleEventProp,
  })

  return (
    <PageLayout pageTitle="Dokumentere etterlevelse" currentPage="Dokumentere etterlevelse">
      <div className="pb-52 w-full">
        <div className="w-full flex justify-center">
          <div className="w-full">
            <div>
              <div className="flex">
                <div className="flex-1">
                  <Heading size="medium">Dokumentere etterlevelse</Heading>
                </div>

                <div className="flex justify-end">
                  <EditEtterlevelseDokumentasjonModal />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center w-full">
          <div className="w-full">
            <div className="pt-6">
              <DokumentasjonTabs />
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

export const EtterlevelseDokumentasjonerPanels = ({
  etterlevelseDokumentasjoner,
  loading,
}: {
  etterlevelseDokumentasjoner: TEtterlevelseDokumentasjonQL[]
  loading?: boolean
}) => {
  if (loading) return <SkeletonPanel count={5} />
  return (
    <Block marginBottom={tabMarginBottom}>
      {etterlevelseDokumentasjoner.map((ed) => (
        <Block key={ed.id} marginBottom={'8px'}>
          <PanelLink
            useTitleUnderLine
            useDescriptionUnderline
            panelIcon={
              <img
                src={arkPennIcon}
                width="33px"
                height="33px"
                aria-hidden
                alt={'Dokumenter ikon'}
              />
            }
            href={`/dokumentasjon/${ed.id}`}
            title={
              <>
                <strong>E{ed.etterlevelseNummer}</strong>
              </>
            }
            beskrivelse={ed.title}
            rightBeskrivelse={
              ed.sistEndretEtterlevelse !== undefined && ed.sistEndretEtterlevelse !== ''
                ? `Sist endret: ${moment(ed.sistEndretEtterlevelse).format('ll')}`
                : ''
            }
          />
        </Block>
      ))}
    </Block>
  )
}

export type TVariables = {
  pageNumber?: number
  pageSize?: number
  sistRedigert?: number
  mineEtterlevelseDokumentasjoner?: boolean
  sok?: string
  teams?: string[]
  behandlingId?: string
}

// eslint-disable-next-line @typescript-eslint/ban-types
export const query = gql`
  query getEtterlevelseDokumentasjoner(
    $pageNumber: NonNegativeInt
    $pageSize: NonNegativeInt
    $mineEtterlevelseDokumentasjoner: Boolean
    $sistRedigert: NonNegativeInt
    $sok: String
    $behandlingId: String
  ) {
    etterlevelseDokumentasjoner: etterlevelseDokumentasjon(
      filter: {
        mineEtterlevelseDokumentasjoner: $mineEtterlevelseDokumentasjoner
        sistRedigert: $sistRedigert
        sok: $sok
        behandlingId: $behandlingId
      }
      pageNumber: $pageNumber
      pageSize: $pageSize
    ) {
      pageNumber
      pageSize
      pages
      numberOfElements
      totalElements
      content {
        id
        title
        etterlevelseNummer
        sistEndretEtterlevelse
        teamsData {
          id
          name
        }
      }
    }
  }
`
// eslint-enable-next-line @typescript-eslint/ban-types
