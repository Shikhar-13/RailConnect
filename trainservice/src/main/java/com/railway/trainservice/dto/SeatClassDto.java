package com.railway.trainservice.dto;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SeatClassDto {
    private Long id;
    private Long trainId;

    @JsonProperty("class_type")
    private String classType;

    @JsonProperty("total_seats")
    private Integer totalSeats;

    @JsonProperty("fare_per_km")
    private Double farePerKm;
}
