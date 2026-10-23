package com.railway.bookingservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * TATKAL_QUEUE — holds the first-come-first-served queue for Tatkal bookings.
 *
 * The queue opens 24 hrs before departure.
 * Entries are processed in FIFO order by a @Scheduled job every minute.
 * If the user's seat is available when their turn comes → PROCESSED (→ Ticket created).
 * If the schedule is past departure → EXPIRED.
 */
@Entity
@Table(name = "tatkal_queue")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TatkalQueue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long scheduleId;

    @Column(nullable = false)
    private Long seatClassId;

    /** Requesting user */
    @Column(nullable = false)
    private Long userId;

    /** Serialized as JSON string – list of passenger IDs + berth preferences */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String passengerDetailsJson;

    @Column(nullable = false)
    private Long fromStationId;

    @Column(nullable = false)
    private Long toStationId;

    /** 1 = first in Tatkal queue */
    @Column(nullable = false)
    private Integer queuePosition;

    @Column(nullable = false)
    private LocalDateTime requestedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    private TatkalStatus status;

    /** Set after processing – the resulting ticket */
    @Column
    private Long resultingTicketId;

    @PrePersist
    protected void onCreate() {
        this.requestedAt = LocalDateTime.now();
    }

    public enum TatkalStatus { PENDING, PROCESSED, EXPIRED }
}
