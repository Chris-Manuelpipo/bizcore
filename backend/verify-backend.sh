#!/bin/bash

# =============================================================================
# BizCore Backend Verification Script
# =============================================================================
# This script validates that the backend is working correctly by:
# - Checking prerequisites (Java, Maven, Docker)
# - Compiling the project
# - Running unit tests
# - Packaging the application
# - Optionally testing startup and health endpoints
# =============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
EXPECTED_TESTS=31
APP_PORT=8080
APP_URL="http://localhost:${APP_PORT}"
STARTUP_TIMEOUT=60
HEALTH_CHECK_RETRIES=30
PROFILE="${SPRING_PROFILES_ACTIVE:-dev}"

# Maven command detection - prefer Maven Wrapper if available
#if [ -f "./mvnw" ]; then
#    MVN_CMD="./mvnw"
#    print_info "Maven Wrapper détecté: $MVN_CMD"
#else
#    MVN_CMD="mvn"
#    print_info "Maven Wrapper non trouvé, utilisation de: $MVN_CMD"
#fi

# Counters
PASSED=0
FAILED=0

# =============================================================================
# Helper Functions
# =============================================================================

print_header() {
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
}

print_step() {
    echo ""
    echo -e "${BLUE}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
    ((PASSED++))
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
    ((FAILED++))
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ $1${NC}"
}

# =============================================================================
# Prerequisites Check
# =============================================================================

check_prerequisites() {
    print_header "PRÉREQUIS SYSTÈME"
    
    # Java
    print_step "Vérification de Java..."
    if command -v java &> /dev/null; then
        JAVA_VERSION=$(java -version 2>&1 | head -n 1)
        if java -version 2>&1 | grep -q "version \"21"; then
            print_success "Java 21 installé: $JAVA_VERSION"
        else
            print_warning "Java détecté mais version attendue: 21"
            print_info "Version actuelle: $JAVA_VERSION"
        fi
    else
        print_error "Java non installé"
        print_info "Installez Java 21: https://adoptium.net/"
    fi
    
    # Maven
    print_step "Vérification de Maven..."
    if [ -f "./mvnw" ]; then
        MVN_VERSION=$($MVN_CMD -version 2>&1 | head -n 1)
        print_success "Maven Wrapper utilisé: $MVN_VERSION"
    elif command -v mvn &> /dev/null; then
        MVN_VERSION=$(mvn -version 2>&1 | head -n 1)
        print_success "Maven installé: $MVN_VERSION"
    else
        print_error "Maven non installé"
        print_info "Installez Maven: https://maven.apache.org/install.html"
    fi
    
    # Docker (optional)
    print_step "Vérification de Docker (optionnel)..."
    if command -v docker &> /dev/null; then
        DOCKER_VERSION=$(docker --version 2>&1)
        print_success "Docker installé: $DOCKER_VERSION"
        DOCKER_AVAILABLE=true
    else
        print_warning "Docker non installé (optionnel)"
        DOCKER_AVAILABLE=false
    fi
    
    # Docker Compose (optional)
    if [ "$DOCKER_AVAILABLE" = true ]; then
        if command -v docker-compose &> /dev/null; then
            print_success "Docker Compose installé"
        else
            print_warning "Docker Compose non installé"
        fi
    fi
}

# =============================================================================
# Compilation
# =============================================================================

compile_project() {
    print_header "COMPILATION DU PROJET"
    
    print_step "Exécution de '$MVN_CMD clean compile'..."
    if $MVN_CMD clean compile -q -DskipTests; then
        print_success "Compilation réussie"
        return 0
    else
        print_error "Échec de la compilation"
        print_info "Vérifiez les erreurs ci-dessus"
        return 1
    fi
}

# =============================================================================
# Tests
# =============================================================================

run_tests() {
    print_header "EXÉCUTION DES TESTS"
    
    print_step "Exécution de '$MVN_CMD test'..."
    echo ""
    
    # Run tests and capture output
    TEST_OUTPUT=$($MVN_CMD test 2>&1)
    TEST_EXIT_CODE=$?
    
    # Extract test results
    if echo "$TEST_OUTPUT" | grep -q "BUILD SUCCESS"; then
        print_success "Tous les tests passent"
        
        # Extract test counts
        TESTS_RUN=$(echo "$TEST_OUTPUT" | grep -oE "Tests run: [0-9]+" | head -1 | grep -oE "[0-9]+")
        FAILURES=$(echo "$TEST_OUTPUT" | grep -oE "Failures: [0-9]+" | head -1 | grep -oE "[0-9]+")
        ERRORS=$(echo "$TEST_OUTPUT" | grep -oE "Errors: [0-9]+" | head -1 | grep -oE "[0-9]+")
        SKIPPED=$(echo "$TEST_OUTPUT" | grep -oE "Skipped: [0-9]+" | head -1 | grep -oE "[0-9]+")
        
        echo ""
        echo -e "${GREEN}═══════════════════════════════════════════${NC}"
        echo -e "${GREEN}  RÉSULTATS DES TESTS${NC}"
        echo -e "${GREEN}═══════════════════════════════════════════${NC}"
        
        [ -n "$TESTS_RUN" ] && echo -e "  ${GREEN}Tests exécutés:${NC}    $TESTS_RUN"
        [ -n "$FAILURES" ] && echo -e "  ${GREEN}Échecs:${NC}           $FAILURES"
        [ -n "$ERRORS" ] && echo -e "  ${GREEN}Erreurs:${NC}          $ERRORS"
        [ -n "$SKIPPED" ] && echo -e "  ${YELLOW}Ignorés:${NC}          $SKIPPED"
        
        # Verify expected test count
        if [ -n "$TESTS_RUN" ] && [ "$TESTS_RUN" -eq "$EXPECTED_TESTS" ]; then
            print_success "Nombre de tests correct: $TESTS_RUN/$EXPECTED_TESTS"
        elif [ -n "$TESTS_RUN" ]; then
            print_warning "Nombre de tests: $TESTS_RUN (attendu: $EXPECTED_TESTS)"
        fi
        
        echo -e "${GREEN}═══════════════════════════════════════════${NC}"
        
        return 0
    else
        print_error "Des tests ont échoué"
        echo ""
        echo "$TEST_OUTPUT" | tail -50
        return 1
    fi
}

# =============================================================================
# Packaging
# =============================================================================

package_application() {
    print_header "PACKAGING DE L'APPLICATION"
    
    print_step "Exécution de '$MVN_CMD clean package -DskipTests'..."
    if $MVN_CMD clean package -DskipTests -q; then
        print_success "Packaging réussi"
        
        # Check JAR file
        JAR_FILE=$(find target -name "bizcore-*.jar" -not -name "*-sources.jar" -not -name "*-javadoc.jar" 2>/dev/null | head -1)
        if [ -n "$JAR_FILE" ] && [ -f "$JAR_FILE" ]; then
            JAR_SIZE=$(du -h "$JAR_FILE" | cut -f1)
            print_success "JAR créé: $(basename $JAR_FILE) ($JAR_SIZE)"
        else
            print_error "JAR non trouvé dans target/"
        fi
        
        return 0
    else
        print_error "Échec du packaging"
        return 1
    fi
}

# =============================================================================
# Startup Test (Optional)
# =============================================================================

test_startup() {
    print_header "TEST DE DÉMARRAGE (OPTIONNEL)"
    
    if [ "$1" != "--with-startup-test" ]; then
        print_warning "Test de démarrage ignoré (utilisez --with-startup-test pour l'activer)"
        return 0
    fi
    
    print_step "Démarrage de l'application..."
    print_info "Profile: $PROFILE"
    print_info "Port: $APP_PORT"
    print_info "Timeout: ${STARTUP_TIMEOUT}s"
    
    # Start application in background
    nohup java -jar target/bizcore-*.jar --spring.profiles.active=$PROFILE --server.port=$APP_PORT > target/app.log 2>&1 &
    APP_PID=$!
    
    echo -e "${CYAN}  PID: $APP_PID${NC}"
    
    # Wait for startup
    print_step "Attente du démarrage..."
    RETRIES=0
    while [ $RETRIES -lt $HEALTH_CHECK_RETRIES ]; do
        if curl -s -f "${APP_URL}/actuator/health" > /dev/null 2>&1; then
            print_success "Application démarrée avec succès"
            break
        fi
        
        # Check if process is still running
        if ! kill -0 $APP_PID 2>/dev/null; then
            print_error "L'application s'est arrêtée"
            echo ""
            print_info "Logs:"
            tail -30 target/app.log
            return 1
        fi
        
        ((RETRIES++))
        echo -ne "\r  Tentative $RETRIES/$HEALTH_CHECK_RETRIES..."
        sleep 2
    done
    echo ""
    
    if [ $RETRIES -eq $HEALTH_CHECK_RETRIES ]; then
        print_error "Timeout: l'application n'a pas démarré dans les ${STARTUP_TIMEOUT}s"
        echo ""
        print_info "Logs:"
        tail -50 target/app.log
        kill $APP_PID 2>/dev/null || true
        return 1
    fi
    
    # Test endpoints
    print_step "Test des endpoints..."
    
    # Health check
    if curl -s -f "${APP_URL}/actuator/health" > /dev/null 2>&1; then
        print_success "GET /actuator/health - OK"
    else
        print_error "GET /actuator/health - ÉCHEC"
    fi
    
    # Swagger UI
    if curl -s -f "${APP_URL}/swagger-ui/index.html" > /dev/null 2>&1; then
        print_success "GET /swagger-ui/index.html - OK"
    else
        print_warning "GET /swagger-ui/index.html - Indisponible (voir configuration OpenAPI)"
    fi
    
    # API docs
    if curl -s -f "${APP_URL}/v3/api-docs" > /dev/null 2>&1; then
        print_success "GET /v3/api-docs - OK"
    else
        print_warning "GET /v3/api-docs - Indisponible"
    fi
    
    # Stop application
    print_step "Arrêt de l'application..."
    if kill $APP_PID 2>/dev/null; then
        sleep 3
        if kill -0 $APP_PID 2>/dev/null; then
            kill -9 $APP_PID 2>/dev/null || true
        fi
        print_success "Application arrêtée"
    else
        print_warning "L'application s'est déjà arrêtée"
    fi
    
    return 0
}

# =============================================================================
# Docker Test (Optional)
# =============================================================================

test_docker() {
    print_header "TEST DOCKER (OPTIONNEL)"
    
    if [ "$DOCKER_AVAILABLE" = false ]; then
        print_warning "Docker non disponible, test ignoré"
        return 0
    fi
    
    if [ "$1" != "--with-docker-test" ]; then
        print_warning "Test Docker ignoré (utilisez --with-docker-test pour l'activer)"
        return 0
    fi
    
    # Validate docker-compose.yml
    print_step "Validation de docker-compose.yml..."
    if docker-compose config > /dev/null 2>&1; then
        print_success "docker-compose.yml valide"
    else
        print_error "docker-compose.yml invalide"
        return 1
    fi
    
    print_info "Pour tester avec Docker:"
    echo ""
    echo "  docker-compose up -d"
    echo "  docker-compose logs -f"
    echo "  docker-compose exec app curl http://localhost:8080/actuator/health"
    echo "  docker-compose down"
    echo ""
}

# =============================================================================
# Summary
# =============================================================================

print_summary() {
    print_header "RÉSUMÉ"
    
    TOTAL=$((PASSED + FAILED))
    
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════${NC}"
    echo -e "${CYAN}  VÉRIFICATION TERMINÉE${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════${NC}"
    echo ""
    echo -e "  ${GREEN}✓ Réussis:${NC}  $PASSED"
    echo -e "  ${RED}✗ Échoués:${NC}  $FAILED"
    echo -e "  ${CYAN}─────────────────────────────────${NC}"
    echo -e "  Total:     $TOTAL"
    echo ""
    
    if [ $FAILED -eq 0 ]; then
        echo -e "${GREEN}═══════════════════════════════════════════${NC}"
        echo -e "${GREEN}  🎉 TOUT EST FONCTIONNEL !${NC}"
        echo -e "${GREEN}═══════════════════════════════════════════${NC}"
        echo ""
        echo "Prochaines étapes:"
        echo "  1. Voir TESTING.md pour les tests manuels"
        echo "  2. Démarrer l'application: ./mvnw spring-boot:run"
        echo "  3. Accéder à Swagger UI: http://localhost:8080/swagger-ui/index.html"
        echo ""
        return 0
    else
        echo -e "${RED}═══════════════════════════════════════════${NC}"
        echo -e "${RED}  ❌ DES VÉRIFICATIONS ONT ÉCHOUÉ${NC}"
        echo -e "${RED}═══════════════════════════════════════════${NC}"
        echo ""
        echo "Veuillez corriger les erreurs avant de continuer."
        echo ""
        return 1
    fi
}

# =============================================================================
# Usage
# =============================================================================

show_usage() {
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --with-startup-test    Tester le démarrage de l'application"
    echo "  --with-docker-test    Afficher les instructions Docker"
    echo "  --help, -h            Afficher cette aide"
    echo ""
    echo "Exemples:"
    echo "  $0                    # Vérification standard"
    echo "  $0 --with-startup-test  # Avec test de démarrage"
    echo "  $0 --with-docker-test   # Avec instructions Docker"
    echo ""
}

# =============================================================================
# Main
# =============================================================================

main() {
    echo ""
    echo -e "${CYAN}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                                                               ║${NC}"
    echo -e "${CYAN}║          🔍 BizCore Backend Verification Script 🔍           ║${NC}"
    echo -e "${CYAN}║                                                               ║${NC}"
    echo -e "${CYAN}╚═══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    # Parse arguments
    STARTUP_TEST=false
    DOCKER_TEST=false
    
    while [ $# -gt 0 ]; do
        case "$1" in
            --with-startup-test)
                STARTUP_TEST=true
                ;;
            --with-docker-test)
                DOCKER_TEST=true
                ;;
            --help|-h)
                show_usage
                exit 0
                ;;
            *)
                print_error "Option inconnue: $1"
                show_usage
                exit 1
                ;;
        esac
        shift
    done
    
    # Run verifications
    check_prerequisites
    compile_project || exit 1
    run_tests || exit 1
    package_application || exit 1
    
    if [ "$STARTUP_TEST" = true ]; then
        test_startup --with-startup-test || exit 1
    else
        test_startup
    fi
    
    if [ "$DOCKER_TEST" = true ]; then
        test_docker --with-docker-test
    else
        test_docker
    fi
    
    print_summary
}

# Run main
main "$@"
