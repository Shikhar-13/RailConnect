package com.railway.adminservice.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
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
public class TrainDetailDto {
    @JsonProperty("id")
    private Long id;
    
    @JsonProperty("train_number")
    @JsonAlias("trainNumber")
    private String trainNumber;
    
    @JsonProperty("train_name")
    @JsonAlias("trainName")
    private String trainName;
    
    @JsonProperty("train_type")
    @JsonAlias("trainType")
    private String trainType;
    
    @JsonProperty("operating_days")
    @JsonAlias("operatingDays")
    private List<String> operatingDays;
    
    @JsonProperty("coach_layout")
    @JsonAlias("coachLayout")
    private Map<String, Integer> coachLayout;
    
    @JsonProperty("description")
    private String description;
    
    @JsonProperty("seat_classes")
    @JsonAlias("seatClasses")
    private List<Object> seatClasses;
}
