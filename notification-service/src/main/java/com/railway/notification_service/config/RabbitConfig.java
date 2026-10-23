package com.railway.notification_service.config;

import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {

    public static final String PAYMENT_QUEUE = "payment.verified";
    public static final String BOOKING_QUEUE = "booking.confirmed";

    @Bean
    public Queue paymentVerifiedQueue() {
        return new Queue(PAYMENT_QUEUE, true);
    }

    @Bean
    public Queue bookingConfirmedQueue() {
        return new Queue(BOOKING_QUEUE, true);
    }
}