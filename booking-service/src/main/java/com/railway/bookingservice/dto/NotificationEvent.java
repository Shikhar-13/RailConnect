package com.railway.bookingservice.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationEvent {
    private String userId;
    private String email;
    private String pnr;
    private String message;
}