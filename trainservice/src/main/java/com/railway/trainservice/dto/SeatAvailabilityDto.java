package com.railway.trainservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SeatAvailabilityDto {
    private Long id;
    private Long scheduleId;
    private Long seatClassId;
    private String classType;
    private Integer availableSeats;
    private Integer tatkalSeats;
    private Integer racSeats;
    private Integer waitlistCount;
}
