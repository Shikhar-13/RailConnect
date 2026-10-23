package com.railway.bookingservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * WAITLIST_ENTRY — holds a passenger's place in the waitlist queue
 * when their class is fully booked.
 * On cancellation, WaitlistService picks the top entry and promotes
 * it to CONFIRMED automatically.
 */
@Entity
@Table(name = "waitlist_entries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WaitlistEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long scheduleId;

    @Column(nullable = false)
    private Long seatClassId;

    /** The ticket this waitlist entry belongs to */
    @Column(nullable = false)
    private Long ticketId;

    /** The specific passenger (TicketPassenger id) who is waitlisted */
    @Column(nullable = false)
    private Long ticketPassengerId;

    /** 1 = first in queue */
    @Column(nullable = false)
    private Integer queuePosition;

    @Column(nullable = false)
    private LocalDateTime enrolledAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    private WaitlistStatus status;

    /** Segment info needed for berth assignment on promotion */
    @Column(nullable = false)
    private Long fromStationId;

    @Column(nullable = false)
    private Long toStationId;

    @Column(nullable = false)
    private Integer fromStopOrder;

    @Column(nullable = false)
    private Integer toStopOrder;

    @PrePersist
    protected void onCreate() {
        this.enrolledAt = LocalDateTime.now();
    }

    public enum WaitlistStatus { WAITING, PROMOTED, EXPIRED, CANCELLED }
}
