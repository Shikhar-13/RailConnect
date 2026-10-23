package com.railway.paymentservice.service;

import com.railway.paymentservice.dto.PaymentRequest;
import com.railway.paymentservice.dto.PaymentResponse;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.RefundCreateParams;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class StripeService {

    @Value("${stripe.secret.key}")
    private String secretKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = secretKey;
    }

    public PaymentResponse createPaymentIntent(PaymentRequest request) {
        try {
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(request.getAmount().multiply(new java.math.BigDecimal(100)).longValue()) // Stripe expects cents
                    .setCurrency(request.getCurrency() != null ? request.getCurrency() : "inr")
                    .putMetadata("pnr", request.getPnr())
                    .setAutomaticPaymentMethods(
                        PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                            .setEnabled(true)
                            .setAllowRedirects(
                                PaymentIntentCreateParams.AutomaticPaymentMethods.AllowRedirects.NEVER
                            )
                            .build()
                    )
                    .build();

            PaymentIntent intent = PaymentIntent.create(params);
            
            return PaymentResponse.builder()
                    .pnr(request.getPnr())
                    .stripePaymentIntentId(intent.getId())
                    .clientSecret(intent.getClientSecret())
                    .status(intent.getStatus())
                    .message("PaymentIntent created successfully")
                    .build();
        } catch (StripeException e) {
            log.error("Stripe error creating PaymentIntent for PNR: {}", request.getPnr(), e);
            return PaymentResponse.builder()
                    .pnr(request.getPnr())
                    .status("FAILED")
                    .message(e.getMessage())
                    .build();
        }
    }

    public PaymentResponse verifyPayment(String pnr, String paymentIntentId) {
        try {
            PaymentIntent intent = PaymentIntent.retrieve(paymentIntentId);
            return PaymentResponse.builder()
                    .pnr(pnr)
                    .stripePaymentIntentId(intent.getId())
                    .status(intent.getStatus())
                    .message("Payment status: " + intent.getStatus())
                    .build();
        } catch (StripeException e) {
            log.error("Stripe error retrieving PaymentIntent: {}", paymentIntentId, e);
            return PaymentResponse.builder()
                    .pnr(pnr)
                    .status("ERROR")
                    .message(e.getMessage())
                    .build();
        }
    }

    public PaymentResponse refundPayment(String pnr, String paymentIntentId, java.math.BigDecimal amount) {
        try {
            RefundCreateParams params = RefundCreateParams.builder()
                    .setPaymentIntent(paymentIntentId)
                    .setAmount(amount.multiply(new java.math.BigDecimal(100)).longValue())
                    .build();

            Refund refund = Refund.create(params);
            return PaymentResponse.builder()
                    .pnr(pnr)
                    .stripePaymentIntentId(paymentIntentId)
                    .status(refund.getStatus())
                    .message("Refund initiated: " + refund.getStatus())
                    .build();
        } catch (StripeException e) {
            log.error("Stripe error creating refund for PaymentIntent: {}", paymentIntentId, e);
            return PaymentResponse.builder()
                    .pnr(pnr)
                    .status("REFUND_FAILED")
                    .message(e.getMessage())
                    .build();
        }
    }
}
