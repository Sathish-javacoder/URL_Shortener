package com.urlshortener.controller;

import com.urlshortener.dto.*;
import com.urlshortener.service.UrlService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class UrlController {

    private final UrlService urlService;

    // POST /api/urls — Create short URL
    @PostMapping("/api/urls")
    public ResponseEntity<UrlResponse> createShortUrl(@Valid @RequestBody CreateUrlRequest request) {
        return new ResponseEntity<>(urlService.createShortUrl(request), HttpStatus.CREATED);
    }

    // GET /api/urls — Get recent URLs with pagination
    @GetMapping("/api/urls")
    public ResponseEntity<PagedResponse<UrlResponse>> getRecentUrls(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return new ResponseEntity<>(urlService.getRecentUrls(page, size),HttpStatus.OK);
    }

    // GET /api/urls/{id}/analytics — Get analytics for a URL
    @GetMapping("/api/urls/{id}/analytics")
    public ResponseEntity<AnalyticsResponse> getAnalytics(@PathVariable Long id)
    {
        return new ResponseEntity<>(urlService.getAnalytics(id),HttpStatus.OK);
    }

    // GET /api/statistics — Get overall statistics
    @GetMapping("/api/statistics")
    public ResponseEntity<StatisticsResponse> getStatistics()
    {
        return new ResponseEntity<>(urlService.getStatistics(),HttpStatus.OK);
    }

    // GET /{shortCode} — Resolve and redirect
    @GetMapping("/{shortCode}")
    public void redirect(@PathVariable String shortCode, HttpServletResponse response) throws IOException {
        try
        {
            String originalUrl = urlService.resolveAndRedirect(shortCode);
            response.sendRedirect(originalUrl);
        }
        catch (RuntimeException e)
        {
            response.sendError(HttpServletResponse.SC_NOT_FOUND, "Short URL not found");
        }
    }
}
