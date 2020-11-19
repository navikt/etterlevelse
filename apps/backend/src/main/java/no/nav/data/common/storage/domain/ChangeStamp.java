package no.nav.data.common.storage.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChangeStamp {

    private String createdBy;
    private LocalDateTime createdDate;

    private String lastModifiedBy;
    private LocalDateTime lastModifiedDate;
}
