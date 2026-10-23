package com.railway.trainservice.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "seat_availability")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeatAvailability {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_id", nullable = false)
    private Schedule schedule;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seat_class_id", nullable = false)
    private SeatClass seatClass;

    @Column(nullable = false)
    private Integer availableSeats;

    @Column(nullable = false)
    @Builder.Default
    private Integer tatkalSeats = 0;

    @Column(nullable = false)
    private Integer racSeats;

    @Column(nullable = false)
    private Integer waitlistCount;

    @Version
    private Long version; // Optimistic locking
}
