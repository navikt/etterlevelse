package no.nav.data.common.auditing.domain;

import com.fasterxml.jackson.annotation.JsonFilter;
import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.Version;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import lombok.experimental.SuperBuilder;
import no.nav.data.common.rest.ChangeStampResponse;
import no.nav.data.common.storage.domain.ChangeStamp;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Data
@SuperBuilder
@MappedSuperclass
@JsonFilter("relationFilter")
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode
@FieldNameConstants
@EntityListeners({AuditingEntityListener.class})
public abstract class ChangeStamped {

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
                .createdDate(getCreatedDate() == null ? LocalDateTime.now() : getCreatedDate())
                .lastModifiedBy(getLastModifiedBy())
                .lastModifiedDate(getLastModifiedDate() == null ? LocalDateTime.now() : getLastModifiedDate())
                .build();
    }
    
    public ChangeStamp getChangeStamp() {
        return ChangeStamp.builder()
                .createdBy(getCreatedBy())
                .createdDate(getCreatedDate())
                .lastModifiedBy(getLastModifiedBy())
                .lastModifiedDate(getLastModifiedDate())
                .build();
    }

}
