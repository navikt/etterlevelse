package no.nav.data.etterlevelse.arkivering.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;

import java.util.List;

@Data
@Builder
@FieldNameConstants
@NoArgsConstructor
@AllArgsConstructor
public class ArkiverRequest  {
    private List<String> failedToArchiveEtterlevelseNr;
}
