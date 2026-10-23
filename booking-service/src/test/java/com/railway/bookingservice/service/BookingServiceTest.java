package com.railway.bookingservice.service;

import com.railway.bookingservice.client.PaymentServiceClient;
import com.railway.bookingservice.client.TrainServiceClient;
import com.railway.bookingservice.client.UserServiceClient;
import com.railway.bookingservice.dto.*;
import com.railway.bookingservice.entity.*;
import com.railway.bookingservice.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class BookingServiceTest {

    @Mock private TicketRepository ticketRepository;
    @Mock private TicketPassengerRepository ticketPassengerRepository;
    @Mock private WaitlistEntryRepository waitlistEntryRepository;
    @Mock private TrainServiceClient trainServiceClient;
    @Mock private UserServiceClient userServiceClient;
    @Mock private PaymentServiceClient paymentServiceClient;
    @Mock private RabbitTemplate rabbitTemplate;

    @InjectMocks private BookingService bookingService;

    @BeforeEach
    void init() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testBookHappyPath() {

        BookingRequest req = new BookingRequest();
        req.setScheduleId(1L);
        req.setTrainId(10L);
        req.setFromStationId(100L);
        req.setToStationId(200L);
        req.setSeatClassId(1L);
        req.setBookingType("NORMAL");
        req.setFromStopOrder(1);
        req.setToStopOrder(5);

        BookingRequest.PassengerRequest p = new BookingRequest.PassengerRequest();
        p.setFirstName("John");
        p.setLastName("Doe");
        p.setGender("M");
        p.setAge(30);
        p.setBerthPreference("LOWER");

        req.setPassengers(List.of(p));

        SeatAvailabilityDto availability = new SeatAvailabilityDto();
        availability.setAvailableSeats(5);
        availability.setClassType("SLEEPER");

        when(trainServiceClient.getSeatAvailability(anyLong(), anyString()))
                .thenReturn(availability);

        Ticket savedTicket = Ticket.builder()
                .id(1L)
                .pnrNumber("ABC1234567")
                .userId(5L)
                .scheduleId(1L)
                .trainId(10L)
                .totalFare(BigDecimal.ZERO)
                .status(Ticket.TicketStatus.PENDING_PAYMENT)
                .build();

        when(ticketRepository.save(any(Ticket.class))).thenReturn(savedTicket);

        TicketPassenger savedPassenger = TicketPassenger.builder()
                .id(1L)
                .firstName("John")
                .lastName("Doe")
                .classType("SLEEPER")
                .passengerStatus(TicketPassenger.PassengerStatus.CONFIRMED)
                .build();

        when(ticketPassengerRepository.save(any(TicketPassenger.class)))
                .thenReturn(savedPassenger);

        PaymentResponse paymentResponse = new PaymentResponse();
        paymentResponse.setStripePaymentIntentId("pi-test");
        paymentResponse.setClientSecret("secret123");
        paymentResponse.setStatus("succeeded");

        when(paymentServiceClient.createPaymentIntent(any(PaymentRequest.class)))
                .thenReturn(paymentResponse);

        BookingResponse result = bookingService.book(req, 5L);

        assertNotNull(result);
        assertEquals("ABC1234567", result.getPnrNumber());
        assertEquals(1, result.getPassengers().size());

        verify(ticketRepository, atLeastOnce()).save(any(Ticket.class));
        verify(ticketPassengerRepository, atLeastOnce()).save(any(TicketPassenger.class));
        verify(trainServiceClient).decrementSeat(anyLong(), anyString(), anyInt(), anyString());
        verify(paymentServiceClient).createPaymentIntent(any(PaymentRequest.class));

        verify(rabbitTemplate, atLeastOnce())
                .convertAndSend(anyString(), any(Object.class));
    }
}
