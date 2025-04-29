package no.nav.data.common.auditing.domain;

import com.fasterxml.jackson.annotation.JsonFilter;
import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.Version;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldNameConstants;
import lombok.experimental.SuperBuilder;
import no.nav.data.common.auditing.AuditVersionListener;
import no.nav.data.common.rest.ChangeStampResponse;
import no.nav.data.common.storage.domain.ChangeStamp;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Getter
@Setter
@SuperBuilder
@FieldNameConstants
@MappedSuperclass
@JsonFilter("relationFilter")
@EntityListeners({AuditingEntityListener.class, AuditVersionListener.class})
@NoArgsConstructor
@AllArgsConstructor
public abstract class Auditable {

    @CreatedBy
    @Column(name = "CREATED_BY")
    protected String createdBy;

    @CreatedDate
    @Column(name = "CREATED_DATE")
    protected LocalDateTime createdDate;

    @LastModifiedBy
    @Column(name = "LAST_MODIFIED_BY")
    protected String lastModifiedBy;

    @LastModifiedDate
    @Column(name = "LAST_MODIFIED_DATE")
    protected LocalDateTime lastModifiedDate;

    @Version
    @Column(name = "VERSION")
    protected Integer version;

    public ChangeStampResponse convertChangeStampResponse() {
        return ChangeStampResponse.builder()
                .createdDate(createdDate == null ? LocalDateTime.now() : createdDate)
                .lastModifiedBy(lastModifiedBy)
                .lastModifiedDate(lastModifiedDate == null ? LocalDateTime.now() : lastModifiedDate)
                .build();
    }
    
    public ChangeStamp getChangeStamp() {
        return ChangeStamp.builder()
                .createdBy(createdBy)
                .createdDate(createdDate)
                .lastModifiedBy(lastModifiedBy)
                .lastModifiedDate(lastModifiedDate)
                .build();
    }

}
