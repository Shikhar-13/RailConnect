package com.railway.bookingservice.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequest {
    private String pnr;
    private BigDecimal amount;
    private String currency;
}
