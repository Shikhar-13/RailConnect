package com.railway.trainservice.service;

import com.railway.trainservice.dto.TrainSearchDto;
import com.railway.trainservice.entity.Route;

import com.railway.trainservice.exception.ResourceNotFoundException;
import com.railway.trainservice.repository.RouteRepository;
import com.railway.trainservice.repository.ScheduleRepository;
import com.railway.trainservice.repository.StationRepository;
import com.railway.trainservice.repository.TrainRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrainSearchService {

        private final RouteRepository routeRepository;
        private final ScheduleRepository scheduleRepository;
        private final StationRepository stationRepository;
        private final TrainRepository trainRepository;

    @Transactional(readOnly = true)
    public TrainSearchDto searchTrains(String fromStationCode, String toStationCode, LocalDate date) {
        // Find stations by station code
        var sourceStation = stationRepository.findByStationCode(fromStationCode.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Source station not found with code: " + fromStationCode));
        var destStation = stationRepository.findByStationCode(toStationCode.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Destination station not found with code: " + toStationCode));

        Long sourceId = sourceStation.getId();
        Long destId = destStation.getId();

        TrainSearchDto response = TrainSearchDto.builder()
                .sourceStation(sourceStation.getStationCode())
                .destinationStation(destStation.getStationCode())
                .searchDate(date)
                .availableTrains(new ArrayList<>())
                .build();

        // 1. Get all routes for source and destination
        List<Route> allRoutes = routeRepository.findAll();
        
        // 2. Group routes by train
        var routesByTrain = allRoutes.stream()
                .collect(Collectors.groupingBy(route -> route.getTrain().getId()));

        for (Long trainId : routesByTrain.keySet()) {
            List<Route> trainRoutes = routesByTrain.get(trainId);
            
            Route sourceRoute = trainRoutes.stream()
                    .filter(r -> r.getStation().getId().equals(sourceId))
                    .findFirst().orElse(null);
                    
            Route destRoute = trainRoutes.stream()
                    .filter(r -> r.getStation().getId().equals(destId))
                    .findFirst().orElse(null);

            // 3. Ensure both stations exist in the route AND source is before destination
            if (sourceRoute != null && destRoute != null && sourceRoute.getStopOrder() < destRoute.getStopOrder()) {
                
                // 4. Check if the train has a schedule for that date
                LocalDate departureDate = date; // Simplified day calculation
                scheduleRepository.findByTrainIdAndDepartureDate(trainId, departureDate).ifPresent(schedule -> {

                    Double distance = destRoute.getDistanceFromSource() - sourceRoute.getDistanceFromSource();

                    TrainSearchDto.TrainSummaryDto trainSummary = TrainSearchDto.TrainSummaryDto.builder()
                            .trainId(trainId)
                            .trainNumber(sourceRoute.getTrain().getTrainNumber())
                            .trainName(sourceRoute.getTrain().getTrainName())
                            .departureTime(sourceRoute.getDepartureTime() != null ? sourceRoute.getDepartureTime().toString() : "N/A")
                            .arrivalTime(destRoute.getArrivalTime() != null ? destRoute.getArrivalTime().toString() : "N/A")
                            .totalDistance(distance)
                            .seatAvailabilities(new ArrayList<>())
                            .build();

                    if (schedule.getSeatAvailabilities() != null) {
                        schedule.getSeatAvailabilities().forEach(sa -> {
                            double fare = distance * sa.getSeatClass().getFarePerKm();
                            trainSummary.getSeatAvailabilities().add(TrainSearchDto.SeatAvailabilitySummaryDto.builder()
                                    .classType(sa.getSeatClass().getClassType())
                                    .availableSeats(sa.getAvailableSeats())
                                    .estimatedFare(Math.round(fare * 100.0) / 100.0)
                                    .build());
                        });
                    }
                    response.getAvailableTrains().add(trainSummary);
                });
            }
        }
        return response;
    }

    @Transactional(readOnly = true)
    public List<TrainSearchDto.TrainSummaryDto> getAllTrains() {
        return trainRepository.findAll().stream()
                .map(train -> TrainSearchDto.TrainSummaryDto.builder()
                        .trainId(train.getId())
                        .trainNumber(train.getTrainNumber())
                        .trainName(train.getTrainName())
                        .departureTime("08:00") // Placeholder
                        .arrivalTime("16:00") // Placeholder
                        .totalDistance(450.0) // Placeholder
                        .seatAvailabilities(train.getSeatClasses().stream()
                                .map(sc -> TrainSearchDto.SeatAvailabilitySummaryDto
                                        .builder()
                                        .classType(sc.getClassType())
                                        .availableSeats(sc.getTotalSeats())
                                        .estimatedFare(450.0) // Placeholder
                                        .build())
                                .collect(Collectors.toList()))
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TrainSearchDto.TrainSummaryDto> getFeaturedTrains() {
        return getAllTrains().stream()
                .limit(5)
                .collect(Collectors.toList());
    }
}
