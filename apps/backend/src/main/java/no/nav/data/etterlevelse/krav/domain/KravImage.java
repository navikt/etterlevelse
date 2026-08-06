package no.nav.data.etterlevelse.krav.domain;

import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Type;

import java.util.UUID;

@Data
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "KRAV_IMAGE")
public class KravImage {

    @Id
    @Column(name = "ID")
    @Builder.Default
    private UUID id = UUID.randomUUID();
    
    @Column(name = "KRAV_ID")
    private UUID kravId;
    
    @Type(value = JsonBinaryType.class)
    @Column(name = "DATA", nullable = false)
    @Builder.Default
    private KravImageData data = new KravImageData();

    @Version
    @Column(name = "VERSION")
    protected Integer version;

    // The rest is just boilerplate to delegate some getters and setters to data

    public String getType() {
        return data.getType();
    }

    public byte[] getContent() {
        return data.getContent();
    }

    public String getName() {
        return data.getName();
    }
}
