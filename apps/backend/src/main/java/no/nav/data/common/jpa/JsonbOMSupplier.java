package no.nav.data.common.jpa;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.hypersistence.utils.hibernate.type.util.ObjectMapperSupplier;
import no.nav.data.common.utils.JsonUtils;

public class JsonbOMSupplier implements ObjectMapperSupplier {

    @Override
    public ObjectMapper get() {
        return JsonUtils.getObjectMapper();
    }
}
