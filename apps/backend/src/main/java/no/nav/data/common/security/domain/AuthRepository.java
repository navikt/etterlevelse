package no.nav.data.common.security.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;


public interface AuthRepository extends JpaRepository<Auth, UUID> {

    List<Auth> findByLastActiveBefore(LocalDateTime time);

    @Query(value = "select count(distinct user_id) "
            + "from auth "
            + "where last_active > ?1", nativeQuery = true)
    long countDistinctUserIdByLastActiveAfter(LocalDateTime time);
}
