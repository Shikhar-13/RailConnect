package com.railway.bookingservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * TICKET — one booking record per booking request.
 * A ticket may cover one or more passengers, all travelling
 * on the same schedule, same class, from→to segment.
 */
@Entity
@Table(name = "tickets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** PNR – unique booking reference shown to the user */
    @Column(nullable = false, unique = true, length = 20)
    private String pnrNumber;

    /** User who made the booking (from JWT userId claim) */
    @Column(nullable = false)
    private Long userId;

    /** References Schedule.id in train-service */
    @Column(nullable = false)
    private Long scheduleId;

    /** References Train.id in train-service */
    @Column(nullable = false)
    private Long trainId;

    /** References Station.id for boarding point */
    @Column(nullable = false)
    private Long fromStationId;

    /** References Station.id for alighting point */
    @Column(nullable = false)
    private Long toStationId;

    /** NORMAL or TATKAL */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private BookingType bookingType;

    /** Total fare for all passengers on this ticket */
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalFare;

    /** CONFIRMED | WAITLISTED | CANCELLED */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    private TicketStatus status;

    @Column(nullable = false)
    private LocalDateTime bookingTime;

    @Column
    private LocalDateTime cancellationTime;

    @Column(length = 50)
    private String stripePaymentIntentId;

    @Column(length = 255)
    private String stripeClientSecret;

    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TicketPassenger> passengers = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        this.bookingTime = LocalDateTime.now();
    }

    // ── Enums ──────────────────────────────────────────────
    public enum BookingType { NORMAL, TATKAL }

    public enum TicketStatus { PENDING_PAYMENT, CONFIRMED, WAITLISTED, CANCELLED }
}
