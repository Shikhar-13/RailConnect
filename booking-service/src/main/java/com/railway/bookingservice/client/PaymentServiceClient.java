package com.railway.bookingservice.client;

import com.railway.bookingservice.dto.PaymentRequest;
import com.railway.bookingservice.dto.PaymentResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@FeignClient(name = "payment-service")
public interface PaymentServiceClient {

    @PostMapping("/api/payments/create-intent")
    PaymentResponse createPaymentIntent(@RequestBody PaymentRequest request);

    @GetMapping("/api/payments/verify/{pnr}")
    PaymentResponse verifyPayment(
            @PathVariable("pnr") String pnr,
            @RequestParam("paymentIntentId") String paymentIntentId);

    @PostMapping("/api/payments/refund/{pnr}")
    PaymentResponse refundPayment(
            @PathVariable("pnr") String pnr,
            @RequestParam("paymentIntentId") String paymentIntentId,
            @RequestParam("amount") BigDecimal amount);
}
