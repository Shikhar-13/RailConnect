package com.railway.trainservice.repository;

import com.railway.trainservice.entity.SeatClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SeatClassRepository extends JpaRepository<SeatClass, Long> {
    List<SeatClass> findByTrainId(Long trainId);
}
