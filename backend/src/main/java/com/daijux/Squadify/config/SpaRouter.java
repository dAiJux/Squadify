package com.daijux.Squadify.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.server.RequestPredicate;
import org.springframework.web.reactive.function.server.RequestPredicates;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.RouterFunctions;
import org.springframework.web.reactive.function.server.ServerResponse;

@Configuration
public class SpaRouter {

    private static final Resource INDEX_HTML = new ClassPathResource("static/index.html");

    @Bean
    public RouterFunction<ServerResponse> spaRoutes() {
        RequestPredicate spaGet = RequestPredicates.GET("/**")
                .and(request -> {
                    String path = request.path();
                    return !path.startsWith("/api") && !path.contains(".");
                });

        return RouterFunctions.route(spaGet,
                req -> ServerResponse.ok()
                        .contentType(MediaType.TEXT_HTML)
                        .body(BodyInserters.fromResource(INDEX_HTML)));
    }
}
