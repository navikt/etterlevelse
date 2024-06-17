package no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.etterlevelse.documentRelation.domain.RelationType;


@Data
@EqualsAndHashCode(callSuper = true)
@FieldNameConstants
@NoArgsConstructor
@AllArgsConstructor
public class EtterlevelseDokumentasjonWithRelationRequest extends EtterlevelseDokumentasjonRequest{
   private RelationType relationType;
}