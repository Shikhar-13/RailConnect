package com.railway.trainservice.service;

import com.railway.trainservice.dto.RouteDto;
import com.railway.trainservice.entity.Route;
import com.railway.trainservice.entity.Station;
import com.railway.trainservice.entity.Train;
import com.railway.trainservice.exception.ResourceNotFoundException;
import com.railway.trainservice.repository.RouteRepository;
import com.railway.trainservice.repository.StationRepository;
import com.railway.trainservice.repository.TrainRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RouteService {

    private final RouteRepository routeRepository;
    private final TrainRepository trainRepository;
    private final StationRepository stationRepository;

    @Transactional
    public RouteDto addRoute(Long trainId, RouteDto routeDto) {
        Train train = trainRepository.findById(trainId)
                .orElseThrow(() -> new ResourceNotFoundException("Train not found with id: " + trainId));

        Station station = stationRepository.findById(routeDto.getStationId())
                .orElseThrow(() -> new ResourceNotFoundException("Station not found with id: " + routeDto.getStationId()));

        Route route = Route.builder()
                .train(train)
                .station(station)
                .stopOrder(routeDto.getStopOrder())
                .arrivalTime(routeDto.getArrivalTime())
                .departureTime(routeDto.getDepartureTime())
                .distanceFromSource(routeDto.getDistanceFromSource())
                .build();

        Route savedRoute = routeRepository.save(route);
        return mapToDto(savedRoute);
    }

    @Transactional(readOnly = true)
    public List<RouteDto> getRoutesByTrainId(Long trainId) {
        return routeRepository.findByTrainIdOrderByStopOrderAsc(trainId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private RouteDto mapToDto(Route route) {
        return RouteDto.builder()
                .id(route.getId())
                .trainId(route.getTrain().getId())
                .stationId(route.getStation().getId())
                .stationName(route.getStation().getName())
                .stationCode(route.getStation().getStationCode())
                .stopOrder(route.getStopOrder())
                .arrivalTime(route.getArrivalTime())
                .departureTime(route.getDepartureTime())
                .distanceFromSource(route.getDistanceFromSource())
                .build();
    }
}
