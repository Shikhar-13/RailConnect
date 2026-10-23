package com.railway.bookingservice.service;

import com.railway.bookingservice.client.TrainServiceClient;
import com.railway.bookingservice.client.UserServiceClient;
import com.railway.bookingservice.client.PaymentServiceClient;
import com.railway.bookingservice.dto.*;
import com.railway.bookingservice.entity.*;
import com.railway.bookingservice.entity.Ticket.BookingType;
import com.railway.bookingservice.entity.Ticket.TicketStatus;
import com.railway.bookingservice.entity.TicketPassenger.PassengerStatus;
import com.railway.bookingservice.exception.BookingException;
import com.railway.bookingservice.exception.ResourceNotFoundException;
import com.railway.bookingservice.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import com.railway.bookingservice.config.RabbitConfig;
import com.railway.bookingservice.dto.NotificationEvent;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final TicketRepository ticketRepository;
    private final TicketPassengerRepository ticketPassengerRepository;
    private final WaitlistEntryRepository waitlistEntryRepository;
    private final TrainServiceClient trainServiceClient;
    private final UserServiceClient userServiceClient;
    private final PaymentServiceClient paymentServiceClient;
    private final RabbitTemplate rabbitTemplate;

    // ─────────────────────────────────────────────────────────────────────────
    //  BOOK TICKET (Normal or Tatkal)
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional
    public BookingResponse book(BookingRequest request, Long userId) {
        // 1. Fetch seat availability from train-service
        SeatAvailabilityDto availability = trainServiceClient.getSeatAvailability(
                request.getScheduleId(), resolveClassType(request.getSeatClassId()));

        int passengersCount = request.getPassengers().size();
        boolean hasSeats = availability.getAvailableSeats() >= passengersCount;

        // 2. Build Ticket
        String pnr = generatePnr();
        TicketStatus status = TicketStatus.PENDING_PAYMENT; // New bookings start as pending payment
        BookingType type = "TATKAL".equalsIgnoreCase(request.getBookingType())
                ? BookingType.TATKAL : BookingType.NORMAL;

        Ticket ticket = Ticket.builder()
                .pnrNumber(pnr)
                .userId(userId)
                .scheduleId(request.getScheduleId())
                .trainId(request.getTrainId())
                .fromStationId(request.getFromStationId())
                .toStationId(request.getToStationId())
                .bookingType(type)
                .totalFare(BigDecimal.ZERO) // calculated below
                .status(status)
                .build();
        ticket = ticketRepository.save(ticket);

        // 3. Assign berths and build TicketPassenger rows
        BigDecimal totalFare = BigDecimal.ZERO;
        List<TicketPassenger> passengers = new ArrayList<>();
        int waitlistBase = waitlistEntryRepository.countWaiting(
                request.getScheduleId(), request.getSeatClassId());

        for (int i = 0; i < request.getPassengers().size(); i++) {
            BookingRequest.PassengerRequest preq = request.getPassengers().get(i);
            
            String fName = preq.getFirstName();
            String lName = preq.getLastName();
            Integer pAge = preq.getAge();
            String pGender = preq.getGender();

            if ((fName == null || fName.trim().isEmpty()) && preq.getPassengerId() != null) {
                PassengerDto pData = userServiceClient.getPassenger(preq.getPassengerId());
                fName = pData.getFirstName();
                lName = pData.getLastName();
                pAge = pData.getAge();
                pGender = pData.getGender();
            } else if (fName == null || lName == null || pAge == null || pGender == null) {
                throw new BookingException("Incomplete inline passenger details provided.");
            }

            TicketPassenger tp = TicketPassenger.builder()
                    .ticket(ticket)
                    .passengerId(preq.getPassengerId())
                    .firstName(fName)
                    .lastName(lName)
                    .age(pAge)
                    .gender(pGender)
                    .classType(availability.getClassType())
                    .fromStopOrder(request.getFromStopOrder())
                    .toStopOrder(request.getToStopOrder())
                    .passengerStatus(hasSeats ? PassengerStatus.CONFIRMED : PassengerStatus.WAITLISTED)
                    .build();

            if (hasSeats) {
                // Try to find a berth with segment availability
                BerthAssignment assignment = assignBerth(
                        request.getScheduleId(),
                        availability.getClassType(),
                        request.getFromStopOrder(),
                        request.getToStopOrder(),
                        resolveBerthPreference(preq.getBerthPreference())
                );
                tp.setCoachNumber(assignment.coach());
                tp.setBerthNumber(assignment.berth());
                tp.setBerthType(assignment.type());
            } else {
                // Waitlist
                tp.setWaitlistPosition(waitlistBase + i + 1);
                TicketPassenger saved = ticketPassengerRepository.save(tp);

                WaitlistEntry entry = WaitlistEntry.builder()
                        .scheduleId(request.getScheduleId())
                        .seatClassId(request.getSeatClassId())
                        .ticketId(ticket.getId())
                        .ticketPassengerId(saved.getId())
                        .queuePosition(waitlistBase + i + 1)
                        .fromStationId(request.getFromStationId())
                        .toStationId(request.getToStationId())
                        .fromStopOrder(request.getFromStopOrder())
                        .toStopOrder(request.getToStopOrder())
                        .status(WaitlistEntry.WaitlistStatus.WAITING)
                        .build();
                waitlistEntryRepository.save(entry);
                passengers.add(saved);
                continue;
            }

            passengers.add(ticketPassengerRepository.save(tp));
        }

        // 4. Decrement seats in train-service if confirmed
        if (hasSeats) {
            trainServiceClient.decrementSeat(
                    request.getScheduleId(), availability.getClassType(), passengersCount, ticket.getBookingType().name());
            totalFare = BigDecimal.valueOf(passengersCount * 500L); // placeholder; real fare from train-service
        }

        ticket.setTotalFare(totalFare);
        
        // 5. Initiate Stripe Payment Intent via Payment Service
        try {
            PaymentRequest paymentRequest = PaymentRequest.builder()
                    .pnr(pnr)
                    .amount(totalFare)
                    .currency("inr")
                    .build();
            PaymentResponse paymentResponse = paymentServiceClient.createPaymentIntent(paymentRequest);
            ticket.setStripePaymentIntentId(paymentResponse.getStripePaymentIntentId());
            ticket.setStripeClientSecret(paymentResponse.getClientSecret());
        } catch (Exception e) {
            log.error("Failed to initiate payment for PNR: {}", pnr, e);
            // In a real system, you might want to handle this more gracefully
        }
        

        ticketRepository.save(ticket);
        try {
            NotificationEvent event = NotificationEvent.builder()
                    .userId(ticket.getUserId().toString())
                    .email("unknown@railway.com")
                    .pnr(ticket.getPnrNumber())
                    .message(hasSeats ? "Booking will be confirmed after payment" : "Booking WAITLISTED!")
                    .build();

            rabbitTemplate.convertAndSend(RabbitConfig.BOOKING_EVENTS, event);
        } catch (Exception ex) {
            log.error("Failed to send notification", ex);
        }

        String message = "Booking initiated! Please complete payment to confirm. PNR: " + pnr;
        BookingResponse response = buildResponse(ticket, passengers, message);
        response.setStripeClientSecret(ticket.getStripeClientSecret());
        return response;
    }

    /**
     * Called when Payment Service confirms successful transaction.
     * Moves ticket from PENDING_PAYMENT to CONFIRMED or WAITLISTED.
     */
    @Transactional
    public BookingResponse confirmPayment(String pnr, Long userId) {

        Ticket ticket = ticketRepository.findByPnrNumber(pnr)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with PNR: " + pnr));

        if (!ticket.getUserId().equals(userId))
            throw new BookingException("Access denied: ticket does not belong to this user");

        if (ticket.getStatus() != TicketStatus.PENDING_PAYMENT)
            throw new BookingException("Ticket is already " + ticket.getStatus());

        // 🔵 ONLY CHECK PAYMENT SERVICE — no Stripe direct confirm
        PaymentResponse payment = 
                paymentServiceClient.verifyPayment(pnr, ticket.getStripePaymentIntentId());

        System.out.println(payment);
        if (!"succeeded".equalsIgnoreCase(payment.getStatus())) {
            throw new BookingException(
                    "Payment not yet successful. Current status: " + payment.getStatus());
        }

        // 🔵 Re-check seat availability
        List<TicketPassenger> passengers = ticketPassengerRepository.findByTicketId(ticket.getId());
        int count = passengers.size();
        String classType = passengers.get(0).getClassType();

        SeatAvailabilityDto availability =
                trainServiceClient.getSeatAvailability(ticket.getScheduleId(), classType);

        boolean hasSeats = availability.getAvailableSeats() >= count;

        ticket.setStatus(hasSeats ? TicketStatus.CONFIRMED : TicketStatus.WAITLISTED);
        ticketRepository.save(ticket);

        try {
            NotificationEvent event = NotificationEvent.builder()
                    .userId(ticket.getUserId().toString())
                    .email("unknown@railway.com")
                    .pnr(ticket.getPnrNumber())
                    .message(hasSeats ? "Booking CONFIRMED" : "Booking WAITLISTED!")
                    .build();

            rabbitTemplate.convertAndSend(RabbitConfig.BOOKING_EVENTS, event);
        } catch (Exception ex) {
            log.error("Failed to send notification", ex);
        }

        // 🔵 Update passengers + decrement seats
        for (TicketPassenger tp : passengers) {

            if (hasSeats) {
                // Assign berth
                BerthAssignment a = assignBerth(
                        ticket.getScheduleId(), classType,
                        tp.getFromStopOrder(), tp.getToStopOrder(),
                        "NO_PREFERENCE"
                );
                tp.setPassengerStatus(PassengerStatus.CONFIRMED);
                tp.setCoachNumber(a.coach());
                tp.setBerthNumber(a.berth());
                tp.setBerthType(a.type());

            } else {
                tp.setPassengerStatus(PassengerStatus.WAITLISTED);
            }

            ticketPassengerRepository.save(tp);
        }

        if (hasSeats) {
            trainServiceClient.decrementSeat(
                    ticket.getScheduleId(), classType, count, ticket.getBookingType().name());
        }

        String msg = hasSeats 
                ? "Payment successful! Booking confirmed."
                : "Payment success, but you are waitlisted.";

        BookingResponse response = buildResponse(ticket, passengers, msg);
        response.setStripeClientSecret(ticket.getStripeClientSecret());
        return response;
    }
    // ─────────────────────────────────────────────────────────────────────────
    //  GET BY PNR
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public BookingResponse getByPnr(String pnr, Long userId) {
        Ticket ticket = ticketRepository.findByPnrNumber(pnr)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with PNR: " + pnr));
        if (!ticket.getUserId().equals(userId)) {
            throw new BookingException("Access denied: ticket does not belong to this user");
        }
        List<TicketPassenger> passengers = ticketPassengerRepository.findByTicketId(ticket.getId());
        return buildResponse(ticket, passengers, "Ticket details for PNR: " + pnr);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  GET MY BOOKINGS
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<BookingResponse> getMyBookings(Long userId) {
        return ticketRepository.findByUserId(userId).stream()
                .map(ticket -> {
                    List<TicketPassenger> passengers = ticketPassengerRepository.findByTicketId(ticket.getId());
                    return buildResponse(ticket, passengers, null);
                }).toList();
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  INTERNAL: confirm a waitlisted booking (called by WaitlistService/TatkalService)
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional
    public void confirmPassenger(Long ticketPassengerId, Long scheduleId,
                                  String classType, int fromStop, int toStop) {
        TicketPassenger tp = ticketPassengerRepository.findById(ticketPassengerId)
                .orElseThrow(() -> new ResourceNotFoundException("TicketPassenger not found: " + ticketPassengerId));

        BerthAssignment assignment = assignBerth(scheduleId, classType, fromStop, toStop, "NO_PREFERENCE");
        tp.setCoachNumber(assignment.coach());
        tp.setBerthNumber(assignment.berth());
        tp.setBerthType(assignment.type());
        tp.setPassengerStatus(PassengerStatus.CONFIRMED);
        tp.setWaitlistPosition(null);
        ticketPassengerRepository.save(tp);

        // Check if all passengers on ticket are confirmed
        Ticket ticket = tp.getTicket();
        boolean allConfirmed = ticketPassengerRepository.findByTicketId(ticket.getId()).stream()
                .allMatch(p -> p.getPassengerStatus() == PassengerStatus.CONFIRMED);
        if (allConfirmed) {
            ticket.setStatus(TicketStatus.CONFIRMED);
            ticketRepository.save(ticket);
        }

        trainServiceClient.decrementSeat(scheduleId, classType, 1, ticket.getBookingType().name());
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Finds a berth that is not already occupied for the given segment.
     * Iterates coach S1 (sleeper) berths 1-72; for real usage this would
     * query seat allocation table. Segment overlap detection via TicketPassengerRepository.
     */
    private BerthAssignment assignBerth(Long scheduleId, String classType,
                                         int fromStop, int toStop, String preference) {
        // Simplified: assign first non-conflicting berth in coach S1
        String coach = "S1";
        String[] berthTypes = {"LOWER", "MIDDLE", "UPPER", "SIDE_LOWER", "SIDE_UPPER", "LOWER"};
        for (int b = 1; b <= 72; b++) {
            List<TicketPassenger> conflicts = ticketPassengerRepository
                    .findConflictingBerthPassengers(scheduleId, classType, coach, b, fromStop, toStop);
            if (conflicts.isEmpty()) {
                return new BerthAssignment(coach, b, berthTypes[(b - 1) % 6]);
            }
        }
        throw new BookingException("No available berths for the selected segment");
    }

    private record BerthAssignment(String coach, int berth, String type) {}

    private String generatePnr() {
        return UUID.randomUUID().toString().substring(0, 10).toUpperCase().replace("-", "");
    }

    private String resolveClassType(Long seatClassId) {
        // In real impl, call train-service or cache; simplified here
        return "SLEEPER";
    }

    private String resolveBerthPreference(String pref) {
        return pref != null ? pref : "NO_PREFERENCE";
    }

    private BookingResponse buildResponse(Ticket ticket, List<TicketPassenger> passengers, String message) {
        List<BookingResponse.PassengerDetail> details = passengers.stream()
                .map(p -> BookingResponse.PassengerDetail.builder()
                        .ticketPassengerId(p.getId())
                        .passengerId(p.getPassengerId())
                        .firstName(p.getFirstName())
                        .lastName(p.getLastName())
                        .classType(p.getClassType())
                        .coachNumber(p.getCoachNumber())
                        .berthNumber(p.getBerthNumber())
                        .berthType(p.getBerthType())
                        .passengerStatus(p.getPassengerStatus().name())
                        .waitlistPosition(p.getWaitlistPosition())
                        .build())
                .toList();

        return BookingResponse.builder()
                .ticketId(ticket.getId())
                .pnrNumber(ticket.getPnrNumber())
                .status(ticket.getStatus().name())
                .bookingType(ticket.getBookingType().name())
                .totalFare(ticket.getTotalFare())
                .bookingTime(ticket.getBookingTime())
                .scheduleId(ticket.getScheduleId())
                .trainId(ticket.getTrainId())
                .fromStationId(ticket.getFromStationId())
                .toStationId(ticket.getToStationId())
                .passengers(details)
                .message(message)
                .build();
    }
}
