package com.railway.bookingservice.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * TICKET_PASSENGER — one row per passenger on a ticket.
 *
 * BERTH SEGMENT SHARING (IRCTC-style):
 * The same physical berth (coachNumber + berthNumber) can be assigned
 * to DIFFERENT passengers on NON-OVERLAPPING segments of the same route.
 * e.g., Passenger A: NDLS→AGC (stops 1-4), Passenger B: AGC→BCT (stops 4-8)
 * both get berth "S1/32" on the same schedule.
 *
 * Overlap check is enforced in BookingService:
 * two TicketPassenger rows have the same berth iff their
 * (fromStopOrder, toStopOrder) ranges do NOT intersect.
 */
@Entity
@Table(name = "ticket_passengers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketPassenger {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    private Ticket ticket;

    /** Mirrors Passenger.id in user-service */
    @Column(name = "passenger_id", nullable = true)
    private Long passengerId;

    // Snapshot of passenger info at booking time
    @Column(nullable = false, length = 50)
    private String firstName;

    @Column(nullable = false, length = 50)
    private String lastName;

    @Column(nullable = false)
    private Integer age;

    @Column(nullable = false, length = 10)
    private String gender;

    // Class / berth assignment
    @Column(nullable = false, length = 10)
    private String classType;      // SL, 3A, 2A, 1A, CC

    @Column(length = 10)
    private String coachNumber;    // e.g., S1, B2  (null until confirmed)

    @Column
    private Integer berthNumber;   // 1-72 for Sleeper  (null until confirmed)

    @Column(length = 15)
    private String berthType;      // LOWER / MIDDLE / UPPER / SIDE_LOWER / SIDE_UPPER

    /** Passenger-level status (can differ from ticket if partial cancellations) */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    private PassengerStatus passengerStatus;

    /** Populated only when passengerStatus = WAITLISTED */
    @Column
    private Integer waitlistPosition;

    // ── Stop orders for segment overlap check ──
    /** Stop order of the from-station on this train's route */
    @Column(nullable = false)
    private Integer fromStopOrder;

    /** Stop order of the to-station on this train's route */
    @Column(nullable = false)
    private Integer toStopOrder;

    // ── Enum ──────────────────────────────────────────────
    public enum PassengerStatus { CONFIRMED, WAITLISTED, CANCELLED }
}
