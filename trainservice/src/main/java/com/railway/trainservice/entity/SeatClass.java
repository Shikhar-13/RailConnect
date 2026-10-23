package com.railway.trainservice.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "seat_classes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeatClass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "train_id", nullable = false)
    private Train train;

    @Column(nullable = false)
    private String classType; // e.g., SL, 3A, 2A, 1A, CC

    @Column(nullable = false)
    private Integer totalSeats;

    @Column(nullable = false)
    private Double farePerKm;
}
