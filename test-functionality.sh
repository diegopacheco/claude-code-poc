#!/bin/bash

echo "🧪 Testing Frontend-Backend Integration"
echo "====================================="

# Test 1: Check if services are running
echo "1. ✅ Checking services..."
docker-compose ps --services --filter "status=running" | wc -l | grep -q "3" && echo "   ✅ All 3 services running" || echo "   ❌ Not all services running"

# Test 2: Test backend API
echo "2. ✅ Testing backend API..."
MEMBERS_COUNT=$(curl -s http://localhost:8080/api/v1/members | jq 'length')
echo "   📊 Found $MEMBERS_COUNT members in database"

TEAMS_COUNT=$(curl -s http://localhost:8080/api/v1/teams | jq 'length')
echo "   📊 Found $TEAMS_COUNT teams in database"

# Test 3: Test CORS
echo "3. ✅ Testing CORS..."
curl -s -H "Origin: http://localhost:3000" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: Content-Type" -X OPTIONS http://localhost:8080/api/v1/members | grep -q "Access-Control-Allow-Origin" && echo "   ✅ CORS working" || echo "   ⚠️  CORS headers not found"

# Test 4: Test creating a member
echo "4. ✅ Testing member creation..."
NEW_MEMBER=$(curl -s -X POST -H "Content-Type: application/json" -H "Origin: http://localhost:3000" -d '{"name":"Integration Test User","email":"integration-test@example.com","picture":"http://test.jpg"}' http://localhost:8080/api/v1/members)
NEW_MEMBER_NAME=$(echo $NEW_MEMBER | jq -r '.name')
if [ "$NEW_MEMBER_NAME" = "Integration Test User" ]; then
    echo "   ✅ Member creation working"
else
    echo "   ❌ Member creation failed"
fi

# Test 5: Test creating a team
echo "5. ✅ Testing team creation..."
NEW_TEAM=$(curl -s -X POST -H "Content-Type: application/json" -H "Origin: http://localhost:3000" -d '{"name":"Integration Test Team","logo":"http://logo.jpg"}' http://localhost:8080/api/v1/teams)
NEW_TEAM_NAME=$(echo $NEW_TEAM | jq -r '.name')
if [ "$NEW_TEAM_NAME" = "Integration Test Team" ]; then
    echo "   ✅ Team creation working"
else
    echo "   ❌ Team creation failed"
fi

# Test 6: Test frontend accessibility
echo "6. ✅ Testing frontend..."
curl -s http://localhost:3000 | grep -q "Coaching App" && echo "   ✅ Frontend accessible and title found" || echo "   ❌ Frontend not accessible"

# Test 7: Test logo accessibility
echo "7. ✅ Testing logo..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/logo-app.png | grep -q "200" && echo "   ✅ Logo accessible" || echo "   ⚠️  Logo not accessible (may need refresh)"

echo ""
echo "🎉 Integration testing complete!"
echo ""
echo "📋 Manual testing recommendations:"
echo "   1. Open http://localhost:3000 in browser"
echo "   2. Try creating a team member"
echo "   3. Try creating a team"  
echo "   4. Try assigning a member to a team"
echo "   5. Try giving feedback"
echo "   6. Check if logo appears in header"
echo "   7. Verify toast notifications appear on success"