package com.railway.trainservice.repository;

import com.railway.trainservice.entity.Route;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RouteRepository extends JpaRepository<Route, Long> {
    List<Route> findByTrainIdOrderByStopOrderAsc(Long trainId);
}
