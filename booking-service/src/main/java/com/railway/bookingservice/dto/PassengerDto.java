package com.railway.bookingservice.dto;

import lombok.*;

/** Mirrors the Passenger entity from user-service for Feign response mapping */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PassengerDto {

    private Long id;
    private String firstName;
    private String lastName;
    private int age;
    private String gender;
    private String berthPreference;
    private String idProofType;
    private String idProofNumber;
}
