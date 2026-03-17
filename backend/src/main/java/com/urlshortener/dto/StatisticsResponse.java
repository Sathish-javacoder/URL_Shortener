package com.urlshortener.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatisticsResponse {
    private List<Map<String, Object>> clicksByDate;
    private List<Map<String, Object>> creationsByDate;
    private long totalUrls;
    private long totalClicks;
}
