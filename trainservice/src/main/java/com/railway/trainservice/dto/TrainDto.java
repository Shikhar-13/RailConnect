package com.railway.trainservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TrainDto {

    private Long id;

    @JsonProperty("train_number")
    private String trainNumber;

    @JsonProperty("train_name")
    private String trainName;

    @JsonProperty("train_type")
    private String trainType;

    @JsonProperty("operating_days")
    private List<String> operatingDays;

    @JsonProperty("coach_layout")
    private Map<String, Integer> coachLayout;

    @JsonProperty("description")
    private String description;

    private List<RouteDto> routes;

    @JsonProperty("seat_classes")
    private List<SeatClassDto> seatClasses;
}