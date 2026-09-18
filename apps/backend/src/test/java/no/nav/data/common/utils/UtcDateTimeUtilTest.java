package no.nav.data.common.utils;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class UtcDateTimeUtilTest {

    @Test
    void stripTrailingZ_removesTrailingUppercaseZ() {
        assertThat(UtcDateTimeUtil.stripTrailingZ("2026-03-02T12:34:19.650127279Z"))
                .isEqualTo("2026-03-02T12:34:19.650127279");
    }

    @Test
    void stripTrailingZ_leavesPlainTimestampUntouched() {
        assertThat(UtcDateTimeUtil.stripTrailingZ("2026-03-02T12:34:19.650127279"))
                .isEqualTo("2026-03-02T12:34:19.650127279");
    }

    @Test
    void stripTrailingZ_leavesNullUntouched() {
        assertThat(UtcDateTimeUtil.stripTrailingZ(null)).isNull();
    }
}

