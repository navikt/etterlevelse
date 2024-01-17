package no.nav.data.etterlevelse.common;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import no.nav.data.common.mail.EmailService;
import no.nav.data.common.mail.MailTask;
import no.nav.data.common.security.SecurityUtils;
import no.nav.data.integration.team.dto.Resource;
import no.nav.data.integration.team.teamcat.TeamcatResourceClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Tag(name = "App")
@RequestMapping("/app")
@RequiredArgsConstructor
public class AppController {

    private final TeamcatResourceClient teamcatResourceClient;
    private final EmailService emailService;

    @Operation(summary = "mail test")
    @ApiResponses(value = {@ApiResponse(description = "mail")})
    @GetMapping(value = "/mail", produces = "text/html")
    public ResponseEntity<String> mail() {
        Resource resource = teamcatResourceClient.getResource(SecurityUtils.getCurrentIdent()).orElseThrow();
        emailService.sendMail(MailTask.builder()
                .to(resource.getEmail())
                .subject("test")
                .body("testbody")
                .build());
        return ResponseEntity.ok("ok");
    }
}
