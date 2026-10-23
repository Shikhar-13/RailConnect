package com.railway.trainservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RouteDto {
    @JsonProperty("id")
    private Long id;

    @JsonProperty("train_id")
    private Long trainId;

    @JsonProperty("station_id")
    private Long stationId;

    @JsonProperty("station_name")
    private String stationName;

    @JsonProperty("station_code")
    private String stationCode;

    @JsonProperty("stop_order")
    private Integer stopOrder;

    @JsonProperty("arrival_time")
    private LocalTime arrivalTime;

    @JsonProperty("departure_time")
    private LocalTime departureTime;

    @JsonProperty("distance_from_source")
    private Double distanceFromSource;
}
