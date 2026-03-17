package com.urlshortener.service;

import com.urlshortener.dto.*;
import com.urlshortener.model.ClickEvent;
import com.urlshortener.model.Url;
import com.urlshortener.repository.ClickEventRepository;
import com.urlshortener.repository.UrlRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class UrlService {

    private final UrlRepository ur;
    private final ClickEventRepository cr;

    @Value("${app.base-url}")
    private String baseUrl;

    private static final String CHARACTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int CODE_LENGTH = 6;

    @Transactional
    public UrlResponse createShortUrl(CreateUrlRequest request) {
//        String shortCode = generateUniqueShortCode();
        Url url = Url.builder()
                .originalUrl(request.getOriginalUrl())
                .shortCode( generateUniqueShortCode())
                .createdAt(LocalDateTime.now())
                .clickCount(0L)
                .build();

        Url savedUrl = ur.save(url);

        return mapToResponse(savedUrl);
    }

    public PagedResponse<UrlResponse> getRecentUrls(int page, int size)
    {
        Pageable pageable = PageRequest.of(page, size);

        Page<Url> urlPage = ur.findAllByOrderByCreatedAtDesc(pageable);

        List<UrlResponse> responses = urlPage.getContent()
                .stream()
                .map(this::mapToResponse)
                .toList();

        return PagedResponse.<UrlResponse>builder()
                .content(responses)
                .page(urlPage.getNumber())
                .size(urlPage.getSize())
                .totalElements(urlPage.getTotalElements())
                .totalPages(urlPage.getTotalPages())
                .last(urlPage.isLast())
                .build();
    }

    @Transactional
    public String resolveAndRedirect(String shortCode)
    {
        Url url = ur.findByShortCode(shortCode)
                .orElseThrow(() -> new RuntimeException("Short URL not found: " + shortCode));

        url.setClickCount(url.getClickCount() + 1);
        url.setLastAccessedAt(LocalDateTime.now());
        ur.save(url);

        ClickEvent clickEvent = ClickEvent.builder()
                .url(url)
                .clickedAt(LocalDateTime.now())
                .build();
          cr.save(clickEvent);
        return url.getOriginalUrl();
    }

    public AnalyticsResponse getAnalytics(Long id) {
        Url url =ur.findById(id)
                .orElseThrow(() -> new RuntimeException("URL not found with id: " + id));

        List<ClickEvent> clickEvents = cr.findByUrlId(id);

        Map<String, Long> clicksByDateMap = new LinkedHashMap<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd");
        for (ClickEvent event : clickEvents)
        {
            String dateKey = event.getClickedAt().format(formatter);
            clicksByDateMap.merge(dateKey, 1L, Long::sum);
        }

        List<Map<String, Object>> clicksByDate = new ArrayList<>();
        clicksByDateMap.forEach((date, count) -> {

            Map<String, Object> entry = new HashMap<>();
            entry.put("date", date);
            entry.put("clicks", count);
            clicksByDate.add(entry);
        });

        return AnalyticsResponse.builder()
                .id(url.getId())
                .originalUrl(url.getOriginalUrl())
                .shortCode(url.getShortCode())
                .shortUrl(baseUrl + "/" + url.getShortCode())
                .createdAt(url.getCreatedAt())
                .totalClicks(url.getClickCount())
                .lastAccessedAt(url.getLastAccessedAt())
                .clicksByDate(clicksByDate)
                .build();
    }

    public StatisticsResponse getStatistics() {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);

        List<Object[]> clicksRaw = cr.findClicksGroupedByDate(thirtyDaysAgo);
        List<Map<String, Object>> clicksByDate = new ArrayList<>();
        for (Object[] row : clicksRaw) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("date", row[0].toString());
            entry.put("clicks", ((Number) row[1]).longValue());
            clicksByDate.add(entry);
        }

        List<Object[]> creationsRaw = cr.findCreationsGroupedByDate(thirtyDaysAgo);
        List<Map<String, Object>> creationsByDate = new ArrayList<>();
        for (Object[] row : creationsRaw) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("date", row[0].toString());
            entry.put("creations", ((Number) row[1]).longValue());
            creationsByDate.add(entry);
        }

        long totalUrls = ur.count();
        long totalClicks = ur.findAll().stream()
                .mapToLong(Url::getClickCount)
                .sum();

        return StatisticsResponse.builder()
                .clicksByDate(clicksByDate)
                .creationsByDate(creationsByDate)
                .totalUrls(totalUrls)
                .totalClicks(totalClicks)
                .build();
    }

    private String generateUniqueShortCode() {
        String code;
        do
        {
            code = generateShortCode();
        } while (ur.existsByShortCode(code));
        return code;
    }

    private String generateShortCode()
    {
        Random random = new Random();
        StringBuilder sb = new StringBuilder(CODE_LENGTH);
        for (int i = 0; i < CODE_LENGTH; i++)
        {
            sb.append(CHARACTERS.charAt(random.nextInt(CHARACTERS.length())));
        }
        return sb.toString();
    }

    private UrlResponse mapToResponse(Url url) {
        return UrlResponse.builder()
                .id(url.getId())
                .originalUrl(url.getOriginalUrl())
                .shortCode(url.getShortCode())
                .shortUrl(baseUrl + "/" + url.getShortCode())
                .createdAt(url.getCreatedAt())
                .clickCount(url.getClickCount())
                .lastAccessedAt(url.getLastAccessedAt())
                .build();
    }
}
