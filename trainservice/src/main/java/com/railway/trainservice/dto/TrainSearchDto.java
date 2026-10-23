package com.railway.trainservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TrainSearchDto {
    private String sourceStation;
    private String destinationStation;
    private LocalDate searchDate;
    private List<TrainSummaryDto> availableTrains;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TrainSummaryDto {
        private Long trainId;
        private String trainNumber;
        private String trainName;
        private String departureTime;
        private String arrivalTime;
        private Double totalDistance;
        private List<SeatAvailabilitySummaryDto> seatAvailabilities;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SeatAvailabilitySummaryDto {
        private String classType;
        private Integer availableSeats;
        private Double estimatedFare;
    }
}
