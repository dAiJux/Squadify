package com.daijux.Squadify.security;

import com.daijux.Squadify.model.User;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpCookie;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextImpl;
import org.springframework.security.web.server.context.ServerSecurityContextRepository;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class JwtSecurityContextRepository implements ServerSecurityContextRepository {

    private final JwtTokenProvider tokenProvider;

    public JwtSecurityContextRepository(JwtTokenProvider tokenProvider) {
        this.tokenProvider = tokenProvider;
    }

    @Override
    public Mono<Void> save(ServerWebExchange exchange, SecurityContext context) {
        return Mono.empty();
    }

    @Override
    public Mono<SecurityContext> load(ServerWebExchange exchange) {
        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

        if (authHeader == null) {
            HttpCookie cookie = exchange.getRequest().getCookies().getFirst("squadify_token");
            if (cookie != null) {
                authHeader = "Bearer " + cookie.getValue();
            }
        }

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            if (tokenProvider.validateToken(token)) {
                User principal = new User();
                principal.setId(tokenProvider.getUserIdFromToken(token));
                principal.setUsername(tokenProvider.getUsernameFromToken(token));
                principal.setRoles(tokenProvider.getRolesFromToken(token));

                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
                return Mono.just(new SecurityContextImpl(auth));
            }
        }
        return Mono.empty();
    }
}