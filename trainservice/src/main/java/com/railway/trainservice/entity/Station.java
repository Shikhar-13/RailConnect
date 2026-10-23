package com.railway.trainservice.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "stations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Station {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String stationCode;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String state;
}
