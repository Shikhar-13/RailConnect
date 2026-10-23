package com.railway.trainservice.service;

import com.railway.trainservice.dto.StationDto;
import com.railway.trainservice.entity.Station;
import com.railway.trainservice.exception.DuplicateResourceException;
import com.railway.trainservice.exception.ResourceNotFoundException;
import com.railway.trainservice.repository.StationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StationService {

    private final StationRepository stationRepository;

    @Transactional
    public StationDto createStation(StationDto stationDto) {
        if (stationRepository.findByStationCode(stationDto.getStationCode()).isPresent()) {
            throw new DuplicateResourceException("Station with code " + stationDto.getStationCode() + " already exists.");
        }

        Station station = Station.builder()
                .name(stationDto.getName())
                .stationCode(stationDto.getStationCode())
                .city(stationDto.getCity())
                .state(stationDto.getState())
                .build();

        Station savedStation = stationRepository.save(station);
        return mapToDto(savedStation);
    }

    @Transactional(readOnly = true)
    public List<StationDto> getAllStations() {
        return stationRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public StationDto getStationById(Long id) {
        Station station = stationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Station not found with id: " + id));
        return mapToDto(station);
    }

    private StationDto mapToDto(Station station) {
        return StationDto.builder()
                .id(station.getId())
                .name(station.getName())
                .stationCode(station.getStationCode())
                .city(station.getCity())
                .state(station.getState())
                .build();
    }
}
