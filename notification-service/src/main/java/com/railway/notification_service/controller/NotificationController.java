package com.railway.notification_service.controller;

import com.railway.notification_service.entity.Notification;
import com.railway.notification_service.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository repo;

    @GetMapping("/user/{userId}")
    public List<Notification> getNotifications(@PathVariable String userId) {
        return repo.findByUserId(userId);
    }
}