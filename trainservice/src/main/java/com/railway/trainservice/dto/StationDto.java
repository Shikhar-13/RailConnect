package com.railway.trainservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StationDto {
    private Long id;

    @NotBlank(message = "Station name is required")
    @JsonProperty("name")
    private String name;

    @NotBlank(message = "Station code is required")
    @JsonProperty("stationCode")
    private String stationCode;

    @NotBlank(message = "City is required")
    @JsonProperty("city")
    private String city;

    @NotBlank(message = "State is required")
    @JsonProperty("state")
    private String state;
}
