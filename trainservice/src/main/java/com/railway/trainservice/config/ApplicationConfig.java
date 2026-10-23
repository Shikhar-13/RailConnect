package com.railway.trainservice.config;

import org.springframework.context.annotation.Configuration;

@Configuration
public class ApplicationConfig {
    // Left empty for now. We only need basic Jwt components from the auth service,
    // and no UserDetailsService/AuthenticationProvider is necessary as this service
    // only validates the JWT provided by the API Gateway and doesn't handle login.
}
