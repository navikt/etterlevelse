package no.nav.data.etterlevelse.etterlevelseDokumentasjon.restore.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeletedEtterlevelseDokumentasjonResponse {

    private String id;
    private int etterlevelseNummer;
    private int etterlevelseDokumentVersjon;
    private String title;
    private LocalDateTime deletedTime;
    private String deletedBy;
    private boolean hadPvk;

}
