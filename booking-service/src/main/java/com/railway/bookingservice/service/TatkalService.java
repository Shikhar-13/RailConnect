package com.railway.bookingservice.service;

import com.railway.bookingservice.client.TrainServiceClient;
import com.railway.bookingservice.dto.TatkalStatusDto;
import com.railway.bookingservice.entity.TatkalQueue;
import com.railway.bookingservice.entity.TatkalQueue.TatkalStatus;
import com.railway.bookingservice.exception.BookingException;
import com.railway.bookingservice.exception.TatkalWindowNotOpenException;
import com.railway.bookingservice.repository.TatkalQueueRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TatkalService {

    private final TatkalQueueRepository tatkalQueueRepository;
    private final TrainServiceClient trainServiceClient;
    private final BookingService bookingService;

    private static final Duration TATKAL_WINDOW = Duration.ofHours(24);

    // ─────────────────────────────────────────────────────────────────────────
    //  TATKAL STATUS — public endpoint, no auth needed
    // ─────────────────────────────────────────────────────────────────────────
    public TatkalStatusDto getTatkalStatus(Long scheduleId, String classType) {
        String departureDtStr = trainServiceClient.getDepartureDatetime(scheduleId);
        LocalDateTime departureDateTime = LocalDateTime.parse(departureDtStr, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        LocalDateTime opensAt = departureDateTime.minus(TATKAL_WINDOW);
        LocalDateTime now = LocalDateTime.now();

        boolean isOpen = !now.isBefore(opensAt);
        String message;
        Integer tatkalSeats = null;

        if (isOpen) {
            try {
                var availability = trainServiceClient.getSeatAvailability(scheduleId, classType);
                if (availability != null) {
                    tatkalSeats = availability.getTatkalSeats();
                }
            } catch (Exception e) {
                log.warn("Could not fetch seat availability for tatkal status: " + e.getMessage());
            }

            if (tatkalSeats != null && tatkalSeats > 0) {
                message = "Tatkal is open! " + tatkalSeats + " seats available. Book now.";
            } else {
                message = "Tatkal is open but all seats are booked! You will be placed in the Tatkal Queue.";
            }
        } else {
            Duration remaining = Duration.between(now, opensAt);
            long hours = remaining.toHours();
            long mins = remaining.toMinutesPart();
            message = String.format("Tatkal booking opens in %d hrs %d mins (at %s)",
                    hours, mins, opensAt.format(DateTimeFormatter.ofPattern("dd-MMM-yyyy HH:mm")));
        }

        return TatkalStatusDto.builder()
                .scheduleId(scheduleId)
                .classType(classType)
                .tatkalWindowOpen(isOpen)
                .tatkalSeats(tatkalSeats)
                .opensAt(opensAt)
                .message(message)
                .build();
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  JOIN TATKAL QUEUE
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional
    public String joinTatkalQueue(Long scheduleId, Long seatClassId, String classType,
                                   Long userId, Long fromStationId, Long toStationId,
                                   String passengerDetailsJson) {
        TatkalStatusDto status = getTatkalStatus(scheduleId, classType);

        if (!status.isTatkalWindowOpen()) {
            throw new TatkalWindowNotOpenException(
                    "Tatkal window is not open yet. " + status.getMessage()
                            + " | Opens at: " + status.getOpensAt());
        }

        // Prevent duplicate queuing
        tatkalQueueRepository.findByUserIdAndScheduleIdAndSeatClassIdAndStatus(
                userId, scheduleId, seatClassId, TatkalStatus.PENDING).ifPresent(e -> {
            throw new BookingException("You are already in the Tatkal queue at position " + e.getQueuePosition());
        });

        Integer currentCount = tatkalQueueRepository.countByScheduleIdAndSeatClassIdAndStatus(
                scheduleId, seatClassId, TatkalStatus.PENDING);

        TatkalQueue entry = TatkalQueue.builder()
                .scheduleId(scheduleId)
                .seatClassId(seatClassId)
                .userId(userId)
                .passengerDetailsJson(passengerDetailsJson)
                .fromStationId(fromStationId)
                .toStationId(toStationId)
                .queuePosition(currentCount + 1)
                .status(TatkalStatus.PENDING)
                .build();

        tatkalQueueRepository.save(entry);

        return String.format("You have joined the Tatkal queue at position %d. " +
                "Your booking will be processed shortly.", currentCount + 1);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  SCHEDULED: process Tatkal queue every 60 seconds
    // ─────────────────────────────────────────────────────────────────────────
    @Scheduled(fixedDelay = 60_000)
    @Transactional
    public void processTatkalQueue() {
        List<TatkalQueue> pending = tatkalQueueRepository.findByStatus(TatkalStatus.PENDING);
        for (TatkalQueue entry : pending) {
            try {
                String classType = "SL"; // Simplified; derive from seatClassId in real impl
                TatkalStatusDto status = getTatkalStatus(entry.getScheduleId(), classType);

                if (!status.isTatkalWindowOpen()) {
                    continue; // Window not open yet for this schedule
                }

                // Check departure hasn't passed
                if (LocalDateTime.now().isAfter(status.getOpensAt().plus(TATKAL_WINDOW))) {
                    entry.setStatus(TatkalStatus.EXPIRED);
                    tatkalQueueRepository.save(entry);
                    continue;
                }

                // Attempt booking via BookingService internal method
                log.info("Processing Tatkal queue entry id={} for scheduleId={}", entry.getId(), entry.getScheduleId());
                // In a full impl: parse passengerDetailsJson, call bookingService.book(...)
                // For now mark as processed
                entry.setStatus(TatkalStatus.PROCESSED);
                tatkalQueueRepository.save(entry);

            } catch (Exception e) {
                log.error("Error processing Tatkal queue entry id={}: {}", entry.getId(), e.getMessage());
            }
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  GET QUEUE POSITION
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public String getQueuePosition(Long scheduleId, Long seatClassId, Long userId) {
        return tatkalQueueRepository
                .findByUserIdAndScheduleIdAndSeatClassIdAndStatus(userId, scheduleId, seatClassId, TatkalStatus.PENDING)
                .map(e -> "You are at queue position " + e.getQueuePosition() +
                        " out of " + tatkalQueueRepository.countByScheduleIdAndSeatClassIdAndStatus(
                                scheduleId, seatClassId, TatkalStatus.PENDING) + " in the Tatkal queue.")
                .orElse("You are not in the Tatkal queue for this schedule and class.");
    }
}
