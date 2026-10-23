package com.railway.bookingservice.service;

import com.railway.bookingservice.client.TrainServiceClient;
import com.railway.bookingservice.dto.SeatAvailabilityDto;
import com.railway.bookingservice.entity.WaitlistEntry;
import com.railway.bookingservice.entity.WaitlistEntry.WaitlistStatus;
import com.railway.bookingservice.repository.WaitlistEntryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class WaitlistService {

    private final WaitlistEntryRepository waitlistEntryRepository;
    private final BookingService bookingService;
    private final TrainServiceClient trainServiceClient;

    /**
     * Called after a cancellation.
     * Picks the first WAITING entry in the queue and promotes it to CONFIRMED.
     */
    @Transactional
    public void promoteNext(Long scheduleId, Long seatClassId, String classType) {
        Optional<WaitlistEntry> nextOpt = waitlistEntryRepository
                .findFirstByScheduleIdAndSeatClassIdAndStatusOrderByQueuePositionAsc(
                        scheduleId, seatClassId, WaitlistStatus.WAITING);

        if (nextOpt.isEmpty()) {
            log.info("No waitlisted passengers to promote for scheduleId={}, seatClassId={}", scheduleId, seatClassId);
            return;
        }

        WaitlistEntry next = nextOpt.get();

        // Check seat is actually available now
        SeatAvailabilityDto avail = trainServiceClient.getSeatAvailability(scheduleId, classType);
        if (avail.getAvailableSeats() < 1) {
            log.warn("Seat count still 0 after cancel – skipping promotion for scheduleId={}", scheduleId);
            return;
        }

        // Promote the passenger
        bookingService.confirmPassenger(
                next.getTicketPassengerId(),
                scheduleId,
                classType,
                next.getFromStopOrder(),
                next.getToStopOrder()
        );

        next.setStatus(WaitlistStatus.PROMOTED);
        waitlistEntryRepository.save(next);

        log.info("Promoted waitlist entry id={} for scheduleId={}", next.getId(), scheduleId);
    }
}
