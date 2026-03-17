package com.urlshortener.config;

import com.urlshortener.model.ClickEvent;
import com.urlshortener.model.Url;
import com.urlshortener.repository.ClickEventRepository;
import com.urlshortener.repository.UrlRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UrlRepository urlRepository;
    private final ClickEventRepository clickEventRepository;

    @Override
    public void run(String... args) {
        if (urlRepository.count() > 0) {
            log.info("Database already has data. Skipping seed.");
            return;
        }

        log.info("Seeding database with sample data...");

        List<Object[]> seedData = List.of(
            new Object[]{"https://www.google.com", "NDQ123", 45L, 14},
            new Object[]{"https://www.github.com", "NDM456", 32L, 12},
            new Object[]{"https://www.stackoverflow.com", "NDL789", 28L, 10},
            new Object[]{"https://www.youtube.com/watch?v=dQw4w9WgXcQ", "NDK012", 67L, 8},
            new Object[]{"https://www.wikipedia.org/wiki/URL_shortening", "NDJ345", 19L, 7},
            new Object[]{"https://www.medium.com/tech-articles/spring-boot", "NDI678", 12L, 6},
            new Object[]{"https://www.twitter.com/explore", "NDH901", 8L, 5},
            new Object[]{"https://www.linkedin.com/in/johndoe", "NDG234", 5L, 4},
            new Object[]{"https://www.reddit.com/r/programming", "NDF567", 22L, 3},
            new Object[]{"https://www.npmjs.com/package/react", "NDE890", 15L, 2}
        );

        Random random = new Random();

        for (Object[] data : seedData) {
            String originalUrl = (String) data[0];
            String shortCode = (String) data[1];
            long clickCount = (Long) data[2];
            int daysAgo = (Integer) data[3];

            LocalDateTime createdAt = LocalDateTime.now().minusDays(daysAgo);

            Url url = Url.builder()
                    .originalUrl(originalUrl)
                    .shortCode(shortCode)
                    .createdAt(createdAt)
                    .clickCount(clickCount)
                    .lastAccessedAt(clickCount > 0 ? LocalDateTime.now().minusHours(random.nextInt(48)) : null)
                    .build();

            Url savedUrl = urlRepository.save(url);

            // Create click events spread over time
            List<ClickEvent> events = new ArrayList<>();
            for (int i = 0; i < clickCount; i++) {
                int randomDaysAgo = random.nextInt(daysAgo + 1);
                int randomHours = random.nextInt(24);
                ClickEvent event = ClickEvent.builder()
                        .url(savedUrl)
                        .clickedAt(LocalDateTime.now().minusDays(randomDaysAgo).minusHours(randomHours))
                        .build();
                events.add(event);
            }
            clickEventRepository.saveAll(events);
        }

        log.info("Seed data loaded successfully! {} URLs created.", seedData.size());
    }
}
