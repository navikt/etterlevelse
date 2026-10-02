import { ChevronLeftIcon, ChevronRightIcon } from '@navikt/aksel-icons'
import { Button, ExpansionCard, ReadMore } from '@navikt/ds-react'
import { FunctionComponent } from 'react'
import { etterlevelseDokumentasjonTemaCodeKravStatusFilterUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelse/etterlevelseRoutes'
import { TKravNavigationGroup } from '@/util/etterlevelseDokumentasjon/etterlevelseDokumentasjonUtil'

export type TKravNavigationTarget = {
  url: string
  temaName: string
}

type TProps = {
  forrigeKravUrl: string
  nesteKravUrl: string
  forrigeTema?: TKravNavigationTarget
  nesteTema?: TKravNavigationTarget
  onNavigate: (url: string) => void
  kravGrupper?: TKravNavigationGroup[]
  currentKravNummer?: number
  currentKravVersjon?: number
  etterlevelseDokumentasjonId?: string
}

const KravNavigationButtons: FunctionComponent<TProps> = ({
  forrigeKravUrl,
  nesteKravUrl,
  forrigeTema,
  nesteTema,
  onNavigate,
  kravGrupper,
  currentKravNummer,
  currentKravVersjon,
  etterlevelseDokumentasjonId,
}) => {
  const hasKravliste: boolean = !!kravGrupper && kravGrupper.length > 0

  if (!forrigeKravUrl && !nesteKravUrl && !forrigeTema && !nesteTema && !hasKravliste) {
    return null
  }

  return (
    <div className='w-full flex flex-col gap-4 py-6'>
      <div className='flex flex-wrap justify-between items-center gap-4'>
        {forrigeKravUrl && (
          <Button
            type='button'
            variant='tertiary'
            icon={<ChevronLeftIcon aria-hidden />}
            iconPosition='left'
            onClick={() => onNavigate(forrigeKravUrl)}
          >
            Forrige krav
          </Button>
        )}
        {nesteKravUrl && (
          <Button
            type='button'
            variant='tertiary'
            icon={<ChevronRightIcon aria-hidden />}
            iconPosition='right'
            onClick={() => onNavigate(nesteKravUrl)}
          >
            Neste krav
          </Button>
        )}
      </div>
      {/* <div className='flex flex-wrap justify-between items-center gap-4'>
        <div className='flex-1 flex justify-start'>
          {forrigeTema && (
            <Button
              type='button'
              variant='tertiary'
              icon={<ChevronLeftDoubleIcon aria-hidden />}
              iconPosition='left'
              onClick={() => onNavigate(forrigeTema.url)}
            >
              Forrige tema ({forrigeTema.temaName})
            </Button>
          )}
        </div>
        <div className='flex-1 flex justify-end'>
          {nesteTema && (
            <Button
              type='button'
              variant='tertiary'
              icon={<ChevronRightDoubleIcon aria-hidden />}
              iconPosition='right'
              onClick={() => onNavigate(nesteTema.url)}
            >
              Neste tema ({nesteTema.temaName})
            </Button>
          )}
        </div>
      </div> */}
      {hasKravliste && (
        <ExpansionCard size='small' aria-label='Navigere kravlisten'>
          <ExpansionCard.Header>
            <ExpansionCard.Title size='small'>Naviger i kravlisten</ExpansionCard.Title>
          </ExpansionCard.Header>
          <ExpansionCard.Content>
            <div className='flex flex-col gap-2 max-h-96 overflow-auto p-2'>
              {kravGrupper!.map((group: TKravNavigationGroup) => {
                const isCurrentGroup: boolean = group.krav.some(
                  (kravItem) =>
                    kravItem.kravNummer === currentKravNummer &&
                    kravItem.kravVersjon === currentKravVersjon
                )
                return (
                  <ReadMore
                    key={group.temaCode}
                    header={<span className='text-lg'>{group.temaName}</span>}
                    size='small'
                    defaultOpen={isCurrentGroup}
                  >
                    <ul className='flex flex-col'>
                      {group.krav.map((kravItem) => {
                        const isCurrent: boolean =
                          kravItem.kravNummer === currentKravNummer &&
                          kravItem.kravVersjon === currentKravVersjon
                        return (
                          <li key={`${kravItem.kravNummer}.${kravItem.kravVersjon}`}>
                            <button
                              type='button'
                              aria-current={isCurrent ? 'true' : undefined}
                              onClick={() =>
                                onNavigate(
                                  etterlevelseDokumentasjonTemaCodeKravStatusFilterUrl(
                                    etterlevelseDokumentasjonId as string,
                                    kravItem.temaCode,
                                    kravItem.kravNummer,
                                    kravItem.kravVersjon
                                  )
                                )
                              }
                              className={`w-full text-left px-2 py-1 rounded-sm text-lg hover:bg-gray-100 ${
                                isCurrent ? 'font-semibold' : ''
                              }`}
                            >
                              K{kravItem.kravNummer}.{kravItem.kravVersjon} {kravItem.navn}
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  </ReadMore>
                )
              })}
            </div>
          </ExpansionCard.Content>
        </ExpansionCard>
      )}
    </div>
  )
}

export default KravNavigationButtons
