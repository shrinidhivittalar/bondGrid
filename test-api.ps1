# Bond Grid API E2E Test Suite
# Run this script to test the entire application

$baseUrl = "http://localhost:3333"
$adminKey = "admin-secret"
$volunteerKey = "volunteer-secret"

# Test counters
$passed = 0
$failed = 0
$testResults = @()

# Helper function to test endpoints
function Test-Endpoint {
    param(
        [string]$method,
        [string]$endpoint,
        [string]$apiKey,
        [object]$body,
        [string[]]$expectedStatus,
        [string]$description
    )
    
    $url = "$baseUrl$endpoint"
    Write-Host "`n🧪 $description" -ForegroundColor Cyan
    Write-Host "   $method $endpoint" -ForegroundColor Gray
    
    try {
        $headers = @{
            "Content-Type" = "application/json"
        }
        
        if ($apiKey) {
            $headers["X-API-KEY"] = $apiKey
        }
        
        $params = @{
            Uri     = $url
            Method  = $method
            Headers = $headers
            ErrorAction = "Stop"
        }
        
        if ($body) {
            $params["Body"] = (ConvertTo-Json -Compress $body)
        }
        
        $response = Invoke-WebRequest @params
        $statusCode = $response.StatusCode
        $content = $response.Content
        
        if ($expectedStatus -contains $statusCode) {
            Write-Host "   ✅ PASSED (HTTP $statusCode)" -ForegroundColor Green
            Write-Host "   Response: $($content.Substring(0, [Math]::Min(100, $content.Length)))"
            $script:passed++
            return @{ success = $true; content = $content; statusCode = $statusCode }
        } else {
            Write-Host "   ❌ FAILED (Expected [$($expectedStatus -join ',')], got $statusCode)" -ForegroundColor Red
            Write-Host "   Response: $content"
            $script:failed++
            return @{ success = $false; content = $content; statusCode = $statusCode }
        }
    }
    catch {
        Write-Host "   ❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
        $script:failed++
        return @{ success = $false; error = $_.Exception.Message }
    }
}

Write-Host "`n╔════════════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║  BOND GRID API E2E TEST SUITE              ║" -ForegroundColor Blue
Write-Host "║  Testing Backend & Integration             ║" -ForegroundColor Blue
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Blue

# ===== PHASE 1: Infrastructure Tests =====
Write-Host "`n📋 PHASE 1: Infrastructure Tests" -ForegroundColor Yellow
Write-Host ("=" * 50) -ForegroundColor Yellow

$health = Test-Endpoint -method "GET" -endpoint "/api/health" -expectedStatus 200 -description "Health Check"

if ($health.success) {
    $healthData = ConvertFrom-Json $health.content
    Write-Host "   Neo4j Configured: $($healthData.neo4j.configured)" -ForegroundColor Gray
    Write-Host "   Neo4j Connected: $($healthData.neo4j.connected)" -ForegroundColor Gray
}

# ===== PHASE 2: People API Tests =====
Write-Host "`n👥 PHASE 2: People API Tests" -ForegroundColor Yellow
Write-Host ("=" * 50) -ForegroundColor Yellow

# Create Person 1
$person1Data = @{
    firstName = "John"
    lastName = "Doe"
    email = "john@example.com"
    phone = "1234567890"
    age = 35
    gender = "Male"
    occupation = "Engineer"
    role = "Volunteer"
    location = "New York"
}

$createPerson1 = Test-Endpoint -method "POST" -endpoint "/api/people" `
    -apiKey $volunteerKey -body $person1Data -expectedStatus 200,201 `
    -description "Create Person 1 (John Doe)"

$person1Id = $null
if ($createPerson1.success) {
    $personData = ConvertFrom-Json $createPerson1.content
    $person1Id = $personData.person.personId
    Write-Host "   Created Person ID: $person1Id" -ForegroundColor Gray
}

# Create Person 2
$person2Data = @{
    firstName = "Jane"
    lastName = "Smith"
    email = "jane@example.com"
    phone = "9876543210"
    age = 32
    gender = "Female"
    occupation = "Designer"
    role = "Admin"
    location = "Boston"
}

$createPerson2 = Test-Endpoint -method "POST" -endpoint "/api/people" `
    -apiKey $volunteerKey -body $person2Data -expectedStatus 200,201 `
    -description "Create Person 2 (Jane Smith)"

$person2Id = $null
if ($createPerson2.success) {
    $personData = ConvertFrom-Json $createPerson2.content
    $person2Id = $personData.person.personId
    Write-Host "   Created Person ID: $person2Id" -ForegroundColor Gray
}

# Search People
Test-Endpoint -method "GET" -endpoint "/api/people/search?q=John" `
    -apiKey $volunteerKey -expectedStatus 200 `
    -description "Search People (search for 'John')"

# Get Person Detail
if ($person1Id) {
    Test-Endpoint -method "GET" -endpoint "/api/people/$person1Id" `
        -apiKey $volunteerKey -expectedStatus 200 `
        -description "Get Person Detail"
}

# Update Person
if ($person1Id) {
    $updateData = @{
        email = "john.updated@example.com"
        location = "San Francisco"
    }
    Test-Endpoint -method "PATCH" -endpoint "/api/people/$person1Id" `
        -apiKey $volunteerKey -body $updateData -expectedStatus 200 `
        -description "Update Person"
}

# ===== PHASE 3: Relationships API Tests =====
Write-Host "`n🔗 PHASE 3: Relationships API Tests" -ForegroundColor Yellow
Write-Host ("=" * 50) -ForegroundColor Yellow

$relationshipGroupId = $null

if ($person1Id -and $person2Id) {
    # Create Relationship
    $relData = @{
        fromPersonId = $person1Id
        toPersonId = $person2Id
        relationshipType = "friend"
    }
    
    $createRel = Test-Endpoint -method "POST" -endpoint "/api/relationships" `
        -apiKey $volunteerKey -body $relData -expectedStatus 200,201 `
        -description "Create Relationship (friend)"
    
    if ($createRel.success) {
        $relDataResponse = ConvertFrom-Json $createRel.content
        $relationshipGroupId = $relDataResponse.relationshipGroupId
        Write-Host "   Created Relationship Group ID: $relationshipGroupId" -ForegroundColor Gray
    }
    
    # Get Relationships for Person
    Test-Endpoint -method "GET" -endpoint "/api/relationships/person/$person1Id" `
        -apiKey $volunteerKey -expectedStatus 200 `
        -description "Get Relationships for Person"
    
    # Update Relationship
    if ($relationshipGroupId) {
        $updateRelData = @{
            fromPersonId = $person1Id
            toPersonId = $person2Id
            relationshipType = "colleague"
        }
        Test-Endpoint -method "PATCH" -endpoint "/api/relationships/$relationshipGroupId" `
            -apiKey $volunteerKey -body $updateRelData -expectedStatus 200 `
            -description "Update Relationship (friend → colleague)"
    }
}

# ===== PHASE 4: Graph API Tests =====
Write-Host "`n📊 PHASE 4: Graph API Tests" -ForegroundColor Yellow
Write-Host ("=" * 50) -ForegroundColor Yellow

Test-Endpoint -method "GET" -endpoint "/api/graph/relationship-types" `
    -expectedStatus 200 -description "Get Relationship Types"

Test-Endpoint -method "GET" -endpoint "/api/graph/network" `
    -expectedStatus 200 -description "Get Graph Network"

# ===== PHASE 5: Merge API Tests =====
Write-Host "`n🔄 PHASE 5: Merge API Tests" -ForegroundColor Yellow
Write-Host ("=" * 50) -ForegroundColor Yellow

if ($person1Id -and $person2Id) {
    # Dry-run merge
    $mergeData = @{
        sourcePersonId = $person1Id
        targetPersonId = $person2Id
    }
    
    Test-Endpoint -method "POST" -endpoint "/api/merge/dry-run" `
        -apiKey $adminKey -body $mergeData -expectedStatus 200 `
        -description "Merge Dry-Run"
}

# ===== PHASE 6: Activity & Admin Tests =====
Write-Host "`n📋 PHASE 6: Activity & Admin Tests" -ForegroundColor Yellow
Write-Host ("=" * 50) -ForegroundColor Yellow

Test-Endpoint -method "GET" -endpoint "/api/activity?limit=10" `
    -expectedStatus 200 -description "Get Activity Log"

Test-Endpoint -method "GET" -endpoint "/api/admin/consistency-check" `
    -apiKey $adminKey -expectedStatus 200 `
    -description "Consistency Check"

Test-Endpoint -method "GET" -endpoint "/api/admin/metrics" `
    -apiKey $adminKey -expectedStatus 200 `
    -description "System Metrics"

# ===== PHASE 7: Cleanup Tests =====
Write-Host "`n🧹 PHASE 7: Cleanup Tests" -ForegroundColor Yellow
Write-Host ("=" * 50) -ForegroundColor Yellow

# Delete Relationship
if ($relationshipGroupId) {
    Test-Endpoint -method "DELETE" -endpoint "/api/relationships/$relationshipGroupId" `
        -apiKey $volunteerKey -expectedStatus 200 `
        -description "Delete Relationship"
}

# Delete People
if ($person1Id) {
    Test-Endpoint -method "DELETE" -endpoint "/api/people/$person1Id" `
        -apiKey $adminKey -expectedStatus 200,204 `
        -description "Delete Person 1"
}

if ($person2Id) {
    Test-Endpoint -method "DELETE" -endpoint "/api/people/$person2Id" `
        -apiKey $adminKey -expectedStatus 200,204 `
        -description "Delete Person 2"
}

# ===== Test Summary =====
Write-Host "`n╔════════════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║  TEST SUMMARY                              ║" -ForegroundColor Blue
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Blue

$total = $passed + $failed
$percentage = if ($total -gt 0) { ($passed / $total * 100).ToString("F1") } else { "0" }

Write-Host "`n✅ Passed:  $passed" -ForegroundColor Green
Write-Host "❌ Failed:  $failed" -ForegroundColor Red
Write-Host "📊 Total:   $total"
Write-Host "📈 Success Rate: $percentage%`n" -ForegroundColor Cyan

# Overall result
if ($failed -eq 0 -and $passed -gt 0) {
    Write-Host "🎉 ALL TESTS PASSED! Application is working properly." -ForegroundColor Green
    exit 0
} elseif ($failed -eq 0 -and $passed -eq 0) {
    Write-Host "⚠️  No tests were run. Check if the API is running at $baseUrl" -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "⚠️  Some tests failed. Review the output above for details." -ForegroundColor Yellow
    exit 1
}
