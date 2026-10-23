package com.railway.paymentservice.controller;

import com.railway.paymentservice.dto.PaymentRequest;
import com.railway.paymentservice.dto.PaymentResponse;
import com.railway.paymentservice.service.StripeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final StripeService stripeService;

    @PostMapping("/create-intent")
    public ResponseEntity<PaymentResponse> createPaymentIntent(@RequestBody PaymentRequest request) {
        return ResponseEntity.ok(stripeService.createPaymentIntent(request));
    }

    @GetMapping("/verify/{pnr}")
    public ResponseEntity<PaymentResponse> verifyPayment(
            @PathVariable String pnr,
            @RequestParam String paymentIntentId) {
        return ResponseEntity.ok(stripeService.verifyPayment(pnr, paymentIntentId));
    }

    @PostMapping("/refund/{pnr}")
    public ResponseEntity<PaymentResponse> refundPayment(
            @PathVariable String pnr,
            @RequestParam String paymentIntentId,
            @RequestParam BigDecimal amount) {
        return ResponseEntity.ok(stripeService.refundPayment(pnr, paymentIntentId, amount));
    }
}
