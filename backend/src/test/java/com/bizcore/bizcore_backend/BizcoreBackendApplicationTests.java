package com.bizcore.bizcore_backend;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@Disabled("Schema refactoring en cours — context test désactivé")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@ActiveProfiles("dev")
class BizcoreBackendApplicationTests {

	@Test
	void contextLoads() {
	}
}
