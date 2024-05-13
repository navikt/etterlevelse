import { Checkbox, CheckboxGroup } from '@navikt/ds-react'

export const CheckList = () => (
  <div className="flex w-full flex-col">
    <div className="flex w-full items-center gap-8">
      <div>&#x20;</div>
      <div>
        <Checkbox value="">&#x20;</Checkbox>
      </div>
      <div>
        EGER
        {/* <KravCard
                key={`krav_${idx}`}
                krav={krav}
                kravFilter={EKravFilterType.RELEVANTE_KRAV}
                etterlevelseDokumentasjonId={etterlevelseDokumentasjonId}
                temaCode={tema.code}
              /> */}
      </div>
    </div>
    <div className="flex w-full items-center gap-8">
      <div>&#x20;</div>
      <CheckboxGroup legend="">
        <Checkbox value="">
          wegbe
          {/* <KravCard
                  key={`krav_${idx}`}
                  krav={krav}
                  kravFilter={EKravFilterType.RELEVANTE_KRAV}
                  etterlevelseDokumentasjonId={etterlevelseDokumentasjonId}
                  temaCode={tema.code}
                /> */}
        </Checkbox>
      </CheckboxGroup>
    </div>
  </div>
)
