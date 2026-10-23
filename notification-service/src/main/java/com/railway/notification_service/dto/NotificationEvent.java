package com.railway.notification_service.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationEvent {

    private String pnr;
    private String email;
    private String userId;
    private String message;
}