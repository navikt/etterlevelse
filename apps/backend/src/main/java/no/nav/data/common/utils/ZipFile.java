package no.nav.data.common.utils;

import lombok.*;

@Data
@Builder
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
public class ZipFile {
    private String filnavn;

    private String filtype;

    @Builder.Default
    private byte[] fil = new byte[0];
}