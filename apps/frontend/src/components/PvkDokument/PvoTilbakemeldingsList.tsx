import { BodyLong, BodyShort, Label, LinkPanel, List, Skeleton, Spacer } from '@navikt/ds-react'
import moment from 'moment'
import { IPvkDokumentListItem } from '../../constants'
import StatusView from '../common/StatusTag'

interface IProps {
  allPvkDocumentListItem: IPvkDokumentListItem[]
  isLoading: boolean
}

export const PvoTilbakemeldingsList = ({ allPvkDocumentListItem, isLoading }: IProps) => (
  <div>
    {isLoading && <Skeleton variant="rectangle" />}
    {!isLoading && (
      <List className="mb-2.5 flex flex-col gap-2">
        {allPvkDocumentListItem &&
          allPvkDocumentListItem.map((pvkDokument: IPvkDokumentListItem) => {
            return (
              <List.Item icon={<div />} className="mb-0" key={pvkDokument.id}>
                <LinkPanel href={`/pvo/pvkdokument/${pvkDokument.id}/tilbakemelding/1`}>
                  <LinkPanel.Title className="flex items-center">
                    <div className="max-w-xl">
                      <BodyShort size="small">E{pvkDokument.etterlevelseNummer}</BodyShort>
                      <BodyLong>
                        <Label>{pvkDokument.title}</Label>
                      </BodyLong>
                    </div>
                    <Spacer />
                    <div className="mr-5">
                      <StatusView
                        status={
                          pvkDokument.status === 'AKTIV' ? 'Under arbeid' : pvkDokument.status
                        }
                      />
                    </div>
                    <div className="w-44">
                      <BodyShort size="small" className="break-words">
                        PVK dokument ble
                      </BodyShort>
                      <BodyShort size="small">
                        {pvkDokument.changeStamp.lastModifiedDate !== undefined &&
                        pvkDokument.changeStamp.lastModifiedDate !== ''
                          ? `sist endret: ${moment(pvkDokument.changeStamp.lastModifiedDate).format('ll')}`
                          : ''}
                      </BodyShort>
                    </div>
                  </LinkPanel.Title>
                </LinkPanel>
              </List.Item>
            )
          })}
      </List>
    )}
  </div>
)
