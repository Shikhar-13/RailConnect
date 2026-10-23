package com.railway.trainservice.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.railway.trainservice.dto.SeatClassDto;
import com.railway.trainservice.dto.TrainDto;
import com.railway.trainservice.entity.SeatClass;
import com.railway.trainservice.entity.Train;
import com.railway.trainservice.exception.DuplicateResourceException;
import com.railway.trainservice.exception.ResourceNotFoundException;
import com.railway.trainservice.repository.SeatClassRepository;
import com.railway.trainservice.repository.TrainRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TrainService {

    private final TrainRepository trainRepository;
    private final SeatClassRepository seatClassRepository;
    private final ObjectMapper objectMapper;

    // -------------------------------------------------------
    // CREATE TRAIN
    // -------------------------------------------------------
    @Transactional
    public TrainDto createTrain(TrainDto trainDto) {

        if (trainRepository.findByTrainNumber(trainDto.getTrainNumber()).isPresent()) {
            throw new DuplicateResourceException(
                "Train with number " + trainDto.getTrainNumber() + " already exists."
            );
        }

        Train train = Train.builder()
                .trainNumber(trainDto.getTrainNumber())
                .trainName(trainDto.getTrainName())
                .trainType(trainDto.getTrainType())
                .operatingDaysJson(writeJson(trainDto.getOperatingDays()))
                .coachLayoutJson(writeJson(trainDto.getCoachLayout()))
                .description(trainDto.getDescription())
                .build();

        Train savedTrain = trainRepository.save(train);

        // VERY IMPORTANT: Save seat classes
        // SAVE SEAT CLASSES (MANDATORY)
        if (trainDto.getSeatClasses() != null && !trainDto.getSeatClasses().isEmpty()) {

            for (SeatClassDto scDto : trainDto.getSeatClasses()) {

                SeatClass seatClass = SeatClass.builder()
                        .train(savedTrain) // VERY IMPORTANT
                        .classType(scDto.getClassType())
                        .totalSeats(scDto.getTotalSeats())
                        .farePerKm(scDto.getFarePerKm())
                        .build();

                SeatClass saved = seatClassRepository.save(seatClass);
            }
        }

        return mapToDto(savedTrain);
    }

    // -------------------------------------------------------
    // UPDATE TRAIN DETAILS
    // -------------------------------------------------------
    @Transactional
    public TrainDto updateTrainDetail(Long id, TrainDto trainDto) {
        Train train = trainRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Train not found with id: " + id));

        train.setTrainName(trainDto.getTrainName());
        train.setTrainType(trainDto.getTrainType());
        train.setDescription(trainDto.getDescription());
        train.setOperatingDaysJson(writeJson(trainDto.getOperatingDays()));
        train.setCoachLayoutJson(writeJson(trainDto.getCoachLayout()));

        Train saved = trainRepository.save(train);
        return mapToDto(saved);
    }

    // -------------------------------------------------------
    // GET BY ID
    // -------------------------------------------------------
    public TrainDto getTrainById(Long id) {
        Train train = trainRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Train not found with id: " + id));

        return mapToDto(train);
    }

    // -------------------------------------------------------
    // GET ALL TRAINS
    // -------------------------------------------------------
    @Transactional(readOnly = true)
    public List<TrainDto> getAllTrains() {
        return trainRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    // -------------------------------------------------------
    // MAPPING METHODS
    // -------------------------------------------------------
    private TrainDto mapToDto(Train train) {

        TrainDto dto = TrainDto.builder()
                .id(train.getId())
                .trainNumber(train.getTrainNumber())
                .trainName(train.getTrainName())
                .trainType(train.getTrainType())
                .description(train.getDescription())
                .build();

        // Deserialize JSON fields
        dto.setOperatingDays(readJson(train.getOperatingDaysJson(), new TypeReference<>() {}));
        dto.setCoachLayout(readJson(train.getCoachLayoutJson(), new TypeReference<>() {}));

        // Seat classes
        if (train.getSeatClasses() != null) {
            dto.setSeatClasses(
                    train.getSeatClasses().stream().map(sc ->
                            SeatClassDto.builder()
                                    .id(sc.getId())
                                    .classType(sc.getClassType())
                                    .totalSeats(sc.getTotalSeats())
                                    .farePerKm(sc.getFarePerKm())
                                    .build()
                    ).collect(Collectors.toList())
            );
        }

        return dto;
    }

    // -------------------------------------------------------
    // JSON HELPERS
    // -------------------------------------------------------
    private String writeJson(Object obj) {
        try {
            return obj != null ? objectMapper.writeValueAsString(obj) : null;
        } catch (JsonProcessingException e) {
            log.error("Error writing JSON", e);
            return null;
        }
    }

    private <T> T readJson(String json, TypeReference<T> typeRef) {
        try {
            return json != null ? objectMapper.readValue(json, typeRef) : null;
        } catch (Exception e) {
            log.warn("JSON parse error for: {}", json);
            return null;
        }
    }
}