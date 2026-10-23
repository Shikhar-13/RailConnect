package com.railway.bookingservice.config;

import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {

    public static final String BOOKING_EVENTS = "booking.events";
    public static final String PAYMENT_EVENTS  = "payment.events";

    @Bean
    public Queue bookingEventsQueue() {
        return new Queue(BOOKING_EVENTS, true);
    }

    @Bean
    public Queue paymentEventsQueue() {
        return new Queue(PAYMENT_EVENTS, true);
    }
}