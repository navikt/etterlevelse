package no.nav.data.common.storage.domain;

import no.nav.data.common.mail.MailTask;
import no.nav.data.common.security.azure.support.MailLog;
import no.nav.data.etterlevelse.arkivering.domain.EtterlevelseArkiv;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
import no.nav.data.etterlevelse.etterlevelsemetadata.domain.EtterlevelseMetadata;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.KravImage;
import no.nav.data.etterlevelse.krav.domain.Tilbakemelding;
import no.nav.data.etterlevelse.kravprioritylist.domain.KravPriorityList;
import no.nav.data.etterlevelse.melding.domain.Melding;
import no.nav.data.etterlevelse.virkemiddel.domain.Virkemiddel;
import org.springframework.util.Assert;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

public final class TypeRegistration {

    private static final Map<Class<? extends DomainObject>, String> classToType = new HashMap<>();
    private static final Map<String, Class<? extends DomainObject>> typeToClass = new HashMap<>();
    private static final Set<String> auditedTypes = new HashSet<>();


    static {
        addDomainClass(Krav.class, true);
        addDomainClass(KravPriorityList.class, true);
        addDomainClass(Etterlevelse.class, true);
        addDomainClass(EtterlevelseMetadata.class, true);
        addDomainClass(Melding.class, true);
        addDomainClass(EtterlevelseArkiv.class, true);
        addDomainClass(EtterlevelseDokumentasjon.class,true);
        addDomainClass(Virkemiddel.class, true);

        addDomainClass(Tilbakemelding.class, false);
        addDomainClass(KravImage.class, false);
        addDomainClass(MailTask.class, false);
        addDomainClass(MailLog.class, false);
    }

    private TypeRegistration() {
    }

    private static void addDomainClass(Class<? extends DomainObject> aClass, boolean audited) {
        String typeName = aClass.getSimpleName();
        classToType.put(aClass, typeName);
        typeToClass.put(typeName, aClass);
        if (audited) {
            auditedTypes.add(typeName);
        }
    }

    public static boolean isAudited(String type) {
        return auditedTypes.contains(type);
    }

    public static String typeOf(Class<? extends DomainObject> clazz) {
        String typeString = classToType.get(clazz);
        Assert.notNull(typeString, "Class %s is not a registered type".formatted(clazz));
        return typeString;
    }

    @SuppressWarnings("unchecked")
    public static <T extends DomainObject> Class<T> classFrom(String type) {
        Class<?> aClass = typeToClass.get(type);
        return (Class<T>) aClass;
    }
}
