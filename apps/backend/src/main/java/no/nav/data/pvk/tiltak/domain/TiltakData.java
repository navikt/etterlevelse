package no.nav.data.pvk.tiltak.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
public class TiltakData {
    
    private String navn;
    private String beskrivelse;
    private String ansvarlig;
    private LocalDate frist;
    private String ansvarligTeam;
    @Builder.Default
    private boolean iverksatt = false;
    private LocalDate iverksattDato;
}
