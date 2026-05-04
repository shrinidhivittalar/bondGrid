#!/bin/bash

# Bond Grid API Test Suite
# This script tests all API endpoints end-to-end

BASE_URL="http://localhost:3333"
ADMIN_KEY="admin-secret"
VOLUNTEER_KEY="volunteer-secret"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

# Test helper functions
test_endpoint() {
  local method=$1
  local endpoint=$2
  local key=$3
  local data=$4
  local expected_status=$5
  local description=$6

  echo -e "\n${YELLOW}Testing: $description${NC}"
  echo "  $method $endpoint"

  if [ -z "$data" ]; then
    response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
      -H "Content-Type: application/json" \
      -H "X-API-KEY: $key")
  else
    response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
      -H "Content-Type: application/json" \
      -H "X-API-KEY: $key" \
      -d "$data")
  fi

  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')

  if [[ "$http_code" =~ $expected_status ]]; then
    echo -e "  ${GREEN}✓ PASSED${NC} (HTTP $http_code)"
    echo "  Response: $body"
    PASSED=$((PASSED + 1))
    echo "$body"  # Return body for further processing
  else
    echo -e "  ${RED}✗ FAILED${NC} (Expected HTTP $expected_status, got HTTP $http_code)"
    echo "  Response: $body"
    FAILED=$((FAILED + 1))
  fi
}

echo -e "${YELLOW}===== BOND GRID API TEST SUITE =====${NC}"
echo "Starting comprehensive API tests..."

# Phase 1: Health Check
echo -e "\n${YELLOW}=== Phase 1: Infrastructure Tests ===${NC}"
test_endpoint "GET" "/api/health" "" "" "200" "Health Check"

# Phase 2: People API
echo -e "\n${YELLOW}=== Phase 2: People API Tests ===${NC}"

# Create Person
PERSON_DATA='{"firstName":"John","lastName":"Doe","email":"john@example.com","phone":"1234567890"}'
test_endpoint "POST" "/api/people" "$VOLUNTEER_KEY" "$PERSON_DATA" "201|200" "Create Person"

# Get Person
test_endpoint "GET" "/api/people/search?q=John" "$VOLUNTEER_KEY" "" "200" "Search People"

# Phase 3: Summary
echo -e "\n${YELLOW}===== TEST SUMMARY =====${NC}"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo -e "Total: $((PASSED + FAILED))"

if [ $FAILED -eq 0 ]; then
  echo -e "\n${GREEN}All tests passed!${NC}"
  exit 0
else
  echo -e "\n${RED}Some tests failed!${NC}"
  exit 1
fi
