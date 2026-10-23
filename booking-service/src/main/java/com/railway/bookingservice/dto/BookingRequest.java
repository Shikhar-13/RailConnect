package com.railway.bookingservice.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingRequest {

    @NotNull(message = "Schedule ID is required")
    private Long scheduleId;

    @NotNull(message = "Train ID is required")
    private Long trainId;

    @NotNull(message = "Seat class ID is required")
    private Long seatClassId;

    @NotNull(message = "From station ID is required")
    private Long fromStationId;

    @NotNull(message = "To station ID is required")
    private Long toStationId;

    /** Stop orders come from the train-service search result */
    @NotNull
    private Integer fromStopOrder;

    @NotNull
    private Integer toStopOrder;

    /** NORMAL or TATKAL */
    @Builder.Default
    private String bookingType = "NORMAL";

    @NotEmpty(message = "At least one passenger is required")
    @Valid
    @Builder.Default
    private List<PassengerRequest> passengers = new java.util.ArrayList<>();

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PassengerRequest {
        private Long passengerId; // Optional for saved passengers
        private String firstName;
        private String lastName;
        private Integer age;
        private String gender;
        private String berthPreference; // LOWER / MIDDLE / UPPER / SIDE_LOWER / SIDE_UPPER / NO_PREFERENCE
    }
}
