package no.nav.data.common.security;


import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.TechnicalException;
import no.nav.data.common.security.dto.OAuthState;
import no.nav.data.common.security.dto.UserInfo;
import no.nav.data.common.security.dto.UserInfoResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.DefaultRedirectStrategy;
import org.springframework.security.web.RedirectStrategy;
import org.springframework.util.Assert;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;

import static no.nav.data.Constants.APP_POD_NAME;
import static no.nav.data.Constants.COOKIE_NAME;
import static no.nav.data.common.utils.Constants.SESSION_LENGTH;
import static org.springframework.security.oauth2.core.endpoint.OAuth2ParameterNames.*;
import static org.springframework.security.web.util.UrlUtils.buildFullRequestUrl;

@Slf4j
@RestController
@RequestMapping
@RequiredArgsConstructor
@Tag(name = "Auth")
public class AuthController {

    public static final String OAUTH_2_CALLBACK_URL = "/oauth2/callback";
    private static final RedirectStrategy redirectStrategy = new DefaultRedirectStrategy();

    private final SecurityProperties securityProperties;
    private final TokenProvider tokenProvider;
    private final Encryptor encryptor;

    @Operation(summary = "Login using sso")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "302", description = "Redirect to sso")
    })
    @GetMapping("/login")
    public void login(HttpServletRequest request, HttpServletResponse response,
            @RequestParam(value = REDIRECT_URI, required = false) String redirectUri,
            @RequestParam(value = ERROR_URI, required = false) String errorUri
    ) throws IOException {
        log.debug("Request to login");
        log.debug("Checking redirect uri: {}", redirectUri);
        Assert.isTrue(securityProperties.isValidRedirectUri(redirectUri), "Illegal redirect_uri " + redirectUri);
        log.debug("Checking error uri: {}", redirectUri);
        Assert.isTrue(securityProperties.isValidRedirectUri(errorUri), "Illegal error_uri " + errorUri);
        log.debug("Checking for uri done");
        var usedRedirect = redirectUri != null ? redirectUri : securityProperties.findBaseUrl();
        if ( redirectUri == null ) {
            log.debug("No rediret uri found, using base uri: {}", securityProperties.findBaseUrl());
        }
        String redirectUrl = tokenProvider.createAuthRequestRedirectUrl(usedRedirect, errorUri, callbackRedirectUri(request));
        log.debug("Final redirect uri: {}", redirectUrl);
        redirectStrategy.sendRedirect(request, response, redirectUrl);
    }

    @Operation(summary = "oidc callback")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "302", description = "token accepted")
    })
    @CrossOrigin
    @GetMapping(OAUTH_2_CALLBACK_URL)
    public void oidc(HttpServletRequest request, HttpServletResponse response,
            @RequestParam(value = CODE, required = false) String code,
            @RequestParam(value = ERROR, required = false) String error,
            @RequestParam(value = ERROR_DESCRIPTION, required = false) String errorDesc,
            @RequestParam(STATE) String stateJson
    ) throws IOException {
        log.debug("Request to auth");
        OAuthState state;
        try {
            state = OAuthState.fromJson(stateJson, encryptor);
        } catch (Exception e) {
            throw new TechnicalException("invalid state", e);
        }
        if (StringUtils.hasText(code)) {
            var session = tokenProvider.createSession(state.getSessionId(), code, callbackRedirectUri(request));
            response.addCookie(createCookie(session, (int) SESSION_LENGTH.toSeconds(), request));
            redirectStrategy.sendRedirect(request, response, state.getRedirectUri());
        } else {
            String errorRedirect = state.errorRedirect(error, errorDesc);
            log.warn("error logging in {}", errorRedirect);
            redirectStrategy.sendRedirect(request, response, errorRedirect);
        }
    }

    @Operation(summary = "Logout")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "302", description = "Logged out"),
            @ApiResponse(responseCode = "200", description = "Logged out")
    })
    @GetMapping("/logout")
    public void logout(HttpServletRequest request, HttpServletResponse response,
            @RequestParam(value = REDIRECT_URI, required = false) String redirectUri
    ) throws IOException {
        log.debug("Request to logout");
        Assert.isTrue(securityProperties.isValidRedirectUri(redirectUri), "Illegal redirect_uri " + redirectUri);
        tokenProvider.destroySession();
        response.addCookie(createCookie(null, 0, request));
        if (redirectUri != null) {
            redirectStrategy.sendRedirect(request, response, new OAuthState(redirectUri).getRedirectUri());
        }
    }

    @Operation(summary = "User info")
    @ApiResponse(description = "userinfo returned")
    @GetMapping("/userinfo")
    public ResponseEntity<UserInfoResponse> userinfo() {
        log.debug("Request to userinfo");
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.ok(UserInfoResponse.noUser(securityProperties.isEnabled()));
        }
        return ResponseEntity.ok(((UserInfo) authentication.getDetails()).toResponse());
    }

    public static Cookie createCookie(String value, int maxAge, HttpServletRequest request) {
        Cookie cookie = new Cookie(COOKIE_NAME, value);
        cookie.setMaxAge(maxAge);
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setSecure(!"localhost".equals(request.getServerName()));
        return cookie;
    }

    private String callbackRedirectUri(HttpServletRequest request) {
        String url = buildFullRequestUrl(request);
        if (url.contains(APP_POD_NAME)) {
            url = securityProperties.findBaseUrl();
        }
        
        URI uri;
        try {
            uri = new URI(url);
        } catch (URISyntaxException e) {
            throw new IllegalArgumentException("Invalid URL: " + url, e);
        }
        String redirectUri = UriComponentsBuilder.fromUri(uri)
                        .replacePath(OAUTH_2_CALLBACK_URL)
                        .replaceQuery(null).encode().build().toUri().toString();
        
        Assert.isTrue(securityProperties.isValidRedirectUri(redirectUri), "Invalid redirect uri " + redirectUri);
        return redirectUri;
    }
}
