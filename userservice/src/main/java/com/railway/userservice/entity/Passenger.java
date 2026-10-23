package com.railway.userservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * PASSENGER ENTITY — maps to the "passengers" table.
 *
 * This is IRCTC's "Master List of Passengers" feature.
 * A user can save family members / frequent co-travellers here.
 * When booking a ticket, instead of re-entering details every time,
 * the user picks from this saved list.
 *
 * Example: Rahul saves his mother "Sunita, F, 55yrs, Aadhaar: XXXX"
 * Next booking → he just selects "Sunita" from his passenger list.
 *
 * Relationship: One USER can have many PASSENGERS (One-to-Many)
 */
@Entity
@Table(name = "passengers")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Passenger {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── Passenger personal details ────────────────────────────
    @Column(nullable = false, length = 50)
    private String firstName;

    @Column(nullable = false, length = 50)
    private String lastName;

    @Column(nullable = false)
    private LocalDate dateOfBirth;     // Age is calculated from this at booking time

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private User.Gender gender;

    @Column(nullable = false, length = 30)
    private String nationality;

    // ── ID Proof for this passenger ───────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private User.IdProofType idProofType;

    @Column(length = 50)
    private String idProofNumber;      // Stored as-is; mask it in responses

    // ── Berth preference (like IRCTC) ─────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(length = 15)
    private BerthPreference berthPreference;   // LOWER / MIDDLE / UPPER / SIDE_LOWER / SIDE_UPPER / NO_PREFERENCE

    // ── Relationship to the account owner ────────────────────
    /**
     * @ManyToOne: Many passengers belong to ONE user
     * fetch = LAZY means we don't load User data unless we explicitly ask for it
     * (prevents unnecessary DB queries — keeps it light)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // ── Enum ──────────────────────────────────────────────────
    public enum BerthPreference {
        LOWER,
        MIDDLE,
        UPPER,
        SIDE_LOWER,
        SIDE_UPPER,
        NO_PREFERENCE
    }
}
