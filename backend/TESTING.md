# BizCore Backend - Testing Guide

## Overview

This document describes the testing strategy and test coverage for the BizCore Backend API.

## Test Categories

### 1. Unit Tests (Services)

Unit tests for services use Mockito to mock repository dependencies. These tests are fast and isolated.

#### Service Tests Created:
- **ActorServiceTest** - Tests for Actor service operations
- **BusinessServiceTest** - Tests for Business service operations (existing)
- **InvoiceServiceTest** - Tests for Invoice service operations
- **TenantServiceTest** - Tests for Tenant service operations
- **BusinessRuleServiceTest** - Tests for BusinessRule service operations
- **ServiceCatalogueServiceTest** - Tests for ServiceCatalogue service operations
- **ServiceRequestServiceTest** - Tests for ServiceRequest service operations (existing)

#### Security Tests:
- **JwtServiceTest** - Tests for JWT token generation and validation

### 2. Controller Tests (WebMvc Tests)

Controller tests use `@WebMvcTest` to test the web layer with mocked services.

#### Controller Tests Created:
- **BusinessControllerTest** - Tests for Business API endpoints
- **ActorControllerTest** - Tests for Actor API endpoints
- **InvoiceControllerTest** - Tests for Invoice API endpoints
- **ServiceRequestControllerTest** - Tests for ServiceRequest API endpoints

### 3. Integration Tests

Integration tests use `@SpringBootTest` with an in-memory H2 database for full end-to-end testing.

#### Integration Tests Created:
- **ServiceRequestIntegrationTest** - Full workflow tests for ServiceRequest
- **SecurityIntegrationTest** - Authentication and authorization tests

## Running Tests

### Run all tests:
```bash
cd backend
./mvnw test
```

### Run specific test class:
```bash
./mvnw test -Dtest=BusinessServiceTest
```

### Run tests with coverage:
```bash
./mvnw test jacoco:report
```

## Test Configuration

Tests use the `application-test.yml` configuration located at `src/test/resources/`:

```yaml
spring:
  datasource:
    url: jdbc:h2:mem:testdb
    driver-class-name: org.h2.Driver
  jpa:
    database-platform: org.hibernate.dialect.H2Dialect
    hibernate:
      ddl-auto: create-drop
  liquibase:
    enabled: false
```

## Test Dependencies

Key testing dependencies in `pom.xml`:

```xml
<!-- Spring Boot Starter Test -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>

<!-- Spring Security Test -->
<dependency>
    <groupId>org.springframework.security</groupId>
    <artifactId>spring-security-test</artifactId>
    <scope>test</scope>
</dependency>

<!-- H2 Database for Testing -->
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>test</scope>
</dependency>
```

## Test Coverage Summary

| Component | Tests | Status |
|-----------|-------|--------|
| ActorService | 10 | ✅ Passing |
| BusinessService | 8 | ✅ Passing |
| InvoiceService | 16 | ✅ Passing |
| TenantService | 9 | ✅ Passing |
| BusinessRuleService | 9 | ✅ Passing |
| ServiceCatalogueService | 12 | ✅ Passing |
| ServiceRequestService | 9 | ✅ Passing |
| JwtService | 7 | ✅ Passing |
| BusinessController | 9 | ⚠️ Needs security mock |
| ActorController | 8 | ⚠️ Needs security mock |
| InvoiceController | 11 | ⚠️ Needs security mock |
| ServiceRequestController | 13 | ⚠️ Needs security mock |

## Known Issues

1. **Controller Tests**: The WebMvcTest classes need additional security configuration mocking to work properly with Spring Security. The tests are set up but may require the full application context.

2. **Integration Tests**: Some integration tests may fail due to tenant ID conflicts. The tests use a fixed UUID for the default tenant which can cause conflicts in parallel test execution.

## Best Practices

1. **Test Naming**: Tests follow the pattern `method_shouldBehavior_whenCondition`
2. **Arrange-Act-Assert**: Each test follows the AAA pattern
3. **Mock External Dependencies**: Services mock repositories, controllers mock services
4. **Use Given/When/Then**: Comments in tests indicate the flow

## Future Improvements

1. Add Testcontainers for integration tests with PostgreSQL
2. Add API contract tests with Spring Cloud Contract
3. Add performance/load tests with JMeter
4. Add mutation testing with PITest