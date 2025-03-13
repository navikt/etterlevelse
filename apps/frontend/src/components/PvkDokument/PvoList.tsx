import { BodyLong, BodyShort, Label, LinkPanel, List, Spacer } from '@navikt/ds-react'

export const PvoList = () => (
  <div>
    {/* {loading && <Skeleton variant="rectangle" />} */}
    {/* {!loading && ( */}
    <List className="mb-2.5 flex flex-col gap-2">
      {/* {kravene &&
          kravene.map((krav: IKrav | TKravQL) => {
            const lov: TLovCode = codelistUtils.getCode(
              EListName.LOV,
              krav.regelverk[0]?.lov?.code
            ) as TLovCode
            const tema: TTemaCode = codelistUtils.getCode(
              EListName.TEMA,
              lov?.data?.tema
            ) as TTemaCode

            return ( */}
      <List.Item
        icon={<div />}
        className="mb-0"
        //   key={krav.id}
      >
        <LinkPanel
        // href={`/krav/${krav.kravNummer}/${krav.kravVersjon}`}
        >
          <LinkPanel.Title className="flex items-center">
            <div className="max-w-xl">
              <BodyShort size="small">
                TEST
                {/* K{krav.kravNummer}.{krav.kravVersjon} */}
              </BodyShort>
              <BodyLong>
                <Label>
                  {/* {krav.navn} */}
                  test
                </Label>
              </BodyLong>
            </div>
            <Spacer />
            <div className="mr-5">{/* <StatusView status={krav.status} /> */}</div>
            <div className="w-44">
              <BodyShort size="small" className="break-words">
                Let
                {/* {tema && tema.shortName ? tema.shortName : ''} */}
              </BodyShort>
              <BodyShort size="small">
                euhwr
                {/* {krav.changeStamp.lastModifiedDate !== undefined &&
                krav.changeStamp.lastModifiedDate !== ''
                  ? `Sist endret: ${moment(krav.changeStamp.lastModifiedDate).format('ll')}`
                  : ''} */}
              </BodyShort>
            </div>
          </LinkPanel.Title>
        </LinkPanel>
      </List.Item>
      {/* )
          })} */}
    </List>
    {/* )} */}
  </div>
)
