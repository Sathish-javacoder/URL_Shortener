package com.urlshortener.repository;

import com.urlshortener.model.ClickEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ClickEventRepository extends JpaRepository<ClickEvent, Long> {

    List<ClickEvent> findByUrlId(Long urlId);

    @Query("SELECT DATE(c.clickedAt) as date, " +
            "COUNT(c) as count " +
            "FROM ClickEvent c" +
            " WHERE c.clickedAt >= :since GROUP BY DATE(c.clickedAt) " +
            "ORDER BY DATE(c.clickedAt)")
    List<Object[]> findClicksGroupedByDate(@Param("since") LocalDateTime since);

    @Query("SELECT DATE(u.createdAt) as date," +
            " COUNT(u) as count FROM Url u " +
            "WHERE u.createdAt >= :since GROUP BY DATE(u.createdAt)" +
            " ORDER BY DATE(u.createdAt)")
    List<Object[]> findCreationsGroupedByDate(@Param("since") LocalDateTime since);
}
