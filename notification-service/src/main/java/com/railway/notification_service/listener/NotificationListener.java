package com.railway.notification_service.listener;

import com.railway.notification_service.config.RabbitConfig;
import com.railway.notification_service.dto.NotificationEvent;
import com.railway.notification_service.entity.Notification;
import com.railway.notification_service.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class NotificationListener {

    private final NotificationRepository repo;

    @RabbitListener(queues = RabbitConfig.PAYMENT_QUEUE)
    public void paymentNotification(NotificationEvent event) {
        save(event, "Payment Successful");
    }

    @RabbitListener(queues = RabbitConfig.BOOKING_QUEUE)
    public void bookingNotification(NotificationEvent event) {
        save(event, "Booking Confirmed");
    }

    private void save(NotificationEvent event, String prefix) {
        Notification n = Notification.builder()
                .userId(event.getUserId())
                .email(event.getEmail())
                .pnr(event.getPnr())
                .message(prefix + ": " + event.getMessage())
                .createdAt(LocalDateTime.now())
                .build();

        repo.save(n);
        System.out.println("🔔 SAVED NOTIFICATION → " + n);
    }
}