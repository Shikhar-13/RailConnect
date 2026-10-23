package com.railway.bookingservice.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingResponse {

    private Long ticketId;
    private String pnrNumber;
    private String status;        // CONFIRMED | WAITLISTED | CANCELLED
    private String bookingType;   // NORMAL | TATKAL
    private BigDecimal totalFare;
    private LocalDateTime bookingTime;

    private Long scheduleId;
    private Long trainId;
    private Long fromStationId;
    private Long toStationId;

    private List<PassengerDetail> passengers;
    private String stripeClientSecret;
    private String message;       // Human-readable status summary

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PassengerDetail {
        private Long ticketPassengerId;
        private Long passengerId;
        private String firstName;
        private String lastName;
        private String classType;
        private String coachNumber;
        private Integer berthNumber;
        private String berthType;
        private String passengerStatus;
        private Integer waitlistPosition;
    }
}
