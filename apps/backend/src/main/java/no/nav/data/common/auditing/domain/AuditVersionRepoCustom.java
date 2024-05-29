package no.nav.data.common.auditing.domain;


import java.util.List;

public interface AuditVersionRepoCustom {
    List<AuditVersion> findByTableIdAndTimeStamp(String tableId, String timeStamp);

}
