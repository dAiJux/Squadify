package com.daijux.Squadify.config;

import com.daijux.Squadify.security.JwtSecurityContextRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import reactor.core.publisher.Mono;

@Configuration
@EnableWebFluxSecurity
public class WebSecurity {

        private final JwtSecurityContextRepository jwtSecurityContextRepository;

        public WebSecurity(JwtSecurityContextRepository jwtSecurityContextRepository) {
                this.jwtSecurityContextRepository = jwtSecurityContextRepository;
        }

        @Bean
        public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
                return http
                                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                                .formLogin(ServerHttpSecurity.FormLoginSpec::disable)
                                .httpBasic(ServerHttpSecurity.HttpBasicSpec::disable)
                                .headers(headers -> headers
                                                .frameOptions(frameOptions -> frameOptions.mode(
                                                                org.springframework.security.web.server.header.XFrameOptionsServerHttpHeadersWriter.Mode.DENY))
                                                .contentSecurityPolicy(csp -> csp.policyDirectives(
                                                                "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'"))
                                                .referrerPolicy(referrer -> referrer.policy(
                                                                org.springframework.security.web.server.header.ReferrerPolicyServerHttpHeadersWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN)))
                                .exceptionHandling(exceptionHandling -> exceptionHandling
                                                .authenticationEntryPoint((exchange, e) -> Mono.fromRunnable(
                                                                () -> exchange.getResponse().setStatusCode(
                                                                                HttpStatus.UNAUTHORIZED)))
                                                .accessDeniedHandler((exchange,
                                                                e) -> Mono.fromRunnable(() -> exchange.getResponse()
                                                                                .setStatusCode(HttpStatus.FORBIDDEN))))
                                .authorizeExchange(exchanges -> exchanges
                                                .pathMatchers(HttpMethod.POST, "/api/auth/register", "/api/auth/login")
                                                .permitAll()
                                                .pathMatchers("/api/**").authenticated()
                                                .anyExchange().permitAll())
                                .securityContextRepository(jwtSecurityContextRepository)
                                .build();
        }
}