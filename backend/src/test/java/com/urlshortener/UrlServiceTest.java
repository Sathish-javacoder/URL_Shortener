package com.urlshortener;

import com.urlshortener.dto.CreateUrlRequest;
import com.urlshortener.dto.UrlResponse;
import com.urlshortener.model.Url;
import com.urlshortener.repository.ClickEventRepository;
import com.urlshortener.repository.UrlRepository;
import com.urlshortener.service.UrlService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UrlServiceTest {

    @Mock
    private UrlRepository urlRepository;

    @Mock
    private ClickEventRepository clickEventRepository;

    @InjectMocks
    private UrlService urlService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(urlService, "baseUrl", "http://localhost:8080");
    }

    @Test
    void createShortUrl_ShouldReturnValidResponse() {
        CreateUrlRequest request = new CreateUrlRequest();
        request.setOriginalUrl("https://www.google.com");

        Url savedUrl = Url.builder()
                .id(1L)
                .originalUrl("https://www.google.com")
                .shortCode("abc123")
                .createdAt(LocalDateTime.now())
                .clickCount(0L)
                .build();

        when(urlRepository.existsByShortCode(anyString())).thenReturn(false);
        when(urlRepository.save(any(Url.class))).thenReturn(savedUrl);

        UrlResponse response = urlService.createShortUrl(request);

        assertThat(response).isNotNull();
        assertThat(response.getOriginalUrl()).isEqualTo("https://www.google.com");
        assertThat(response.getShortCode()).isEqualTo("abc123");
        assertThat(response.getShortUrl()).contains("abc123");
        assertThat(response.getClickCount()).isEqualTo(0L);
    }

    @Test
    void resolveAndRedirect_ShouldIncrementClickCount() {
        Url url = Url.builder()
                .id(1L)
                .originalUrl("https://www.google.com")
                .shortCode("abc123")
                .createdAt(LocalDateTime.now())
                .clickCount(5L)
                .build();

        when(urlRepository.findByShortCode("abc123")).thenReturn(Optional.of(url));
        when(urlRepository.save(any(Url.class))).thenReturn(url);
        when(clickEventRepository.save(any())).thenReturn(null);

        String originalUrl = urlService.resolveAndRedirect("abc123");

        assertThat(originalUrl).isEqualTo("https://www.google.com");
        assertThat(url.getClickCount()).isEqualTo(6L);
        verify(urlRepository, times(1)).save(url);
        verify(clickEventRepository, times(1)).save(any());
    }

    @Test
    void resolveAndRedirect_WithInvalidCode_ShouldThrowException() {
        when(urlRepository.findByShortCode("invalid")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> urlService.resolveAndRedirect("invalid"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Short URL not found");
    }

    @Test
    void createShortUrl_WithDuplicateCode_ShouldRetryWithNewCode() {
        CreateUrlRequest request = new CreateUrlRequest();
        request.setOriginalUrl("https://www.example.com");

        Url savedUrl = Url.builder()
                .id(1L)
                .originalUrl("https://www.example.com")
                .shortCode("xyz789")
                .createdAt(LocalDateTime.now())
                .clickCount(0L)
                .build();

        // First code is duplicate, second is unique
        when(urlRepository.existsByShortCode(anyString()))
                .thenReturn(true)
                .thenReturn(false);
        when(urlRepository.save(any(Url.class))).thenReturn(savedUrl);

        UrlResponse response = urlService.createShortUrl(request);

        assertThat(response).isNotNull();
        verify(urlRepository, times(2)).existsByShortCode(anyString());
    }
}
