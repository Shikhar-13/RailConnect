package com.railway.bookingservice.dto;

import lombok.*;

/** Mirrors SeatAvailability from train-service for Feign response mapping */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeatAvailabilityDto {

    private Long id;
    private Long scheduleId;
    private String classType;
    private Integer availableSeats;
    private Integer tatkalSeats;
    private Integer waitlistCount;
    private Long version;
}
