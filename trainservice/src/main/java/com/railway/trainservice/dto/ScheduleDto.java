package com.railway.trainservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class ScheduleDto {

    @JsonProperty("id")
    private Long id;

    @NotNull(message = "Departure date is required")
    @JsonProperty("departure_date")
    private LocalDate departureDate;

    @NotBlank(message = "Status is required")
    @JsonProperty("status")
    private String status;

    @JsonProperty("auto_generate_availability")
    private boolean autoGenerateAvailability;

    @JsonProperty("seat_availabilities")
    private List<SeatAvailabilityDto> seatAvailabilities;
}
