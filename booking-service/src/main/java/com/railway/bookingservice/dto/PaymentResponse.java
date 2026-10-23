package com.railway.bookingservice.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private String pnr;
    private String stripePaymentIntentId;
    private String clientSecret;
    private String status;
    private String message;
}
