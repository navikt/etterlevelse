import { ExternalLink } from '@/components/common/externalLink/externalLink'
import { LabelAboveContent } from '@/components/common/labelAboveContent/labelAboveContent'
import { LabelWrapper } from '@/components/common/labelWrapper/labelWrapper'
import { Markdown } from '@/components/common/markdown/markdown'
import { IKravVersjon, TKravViewProps } from '@/constants/krav/kravConstants'
import { kravUrl } from '@/routes/krav/kravRoutes'
import { BodyShort, Label } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

interface IProps extends TKravViewProps {
  alleKravVersjoner: IKravVersjon[]
}

export const KravTidligereVersjoner: FunctionComponent<IProps> = ({
  alleKravVersjoner,
  krav,
  header,
}) => (
  <>
    {alleKravVersjoner.length !== 0 && krav.kravVersjon > 1 && (
      <LabelWrapper>
        <LabelAboveContent title='Tidligere versjoner' header={header}>
          {alleKravVersjoner.map((kravRelasjon: IKravVersjon, index: number) => (
            <>
              {kravRelasjon.kravVersjon &&
                parseInt(kravRelasjon.kravVersjon.toString()) < krav.kravVersjon && (
                  <BodyShort key={`kravVersjon_list_${index}`} className={'break-words'}>
                    <ExternalLink
                      href={`${kravUrl}/${kravRelasjon.kravNummer}/${kravRelasjon.kravVersjon}`}
                    >{`K${kravRelasjon.kravNummer}.${kravRelasjon.kravVersjon}`}</ExternalLink>
                  </BodyShort>
                )}
            </>
          ))}
          {krav.versjonEndringer && (
            <div className='my-8'>
              <Label size='medium'>Dette er nytt fra forrige versjon</Label>
              <Markdown source={krav.versjonEndringer} />
            </div>
          )}
        </LabelAboveContent>
      </LabelWrapper>
    )}
  </>
)
