#!/bin/bash

echo "🧪 Testing 'Assign to Team' Functionality"
echo "========================================"

# Get available members and teams first
echo "📊 Checking available data..."
MEMBERS=$(curl -s http://localhost:8080/api/v1/members)
TEAMS=$(curl -s http://localhost:8080/api/v1/teams)

MEMBERS_COUNT=$(echo $MEMBERS | jq 'length')
TEAMS_COUNT=$(echo $TEAMS | jq 'length')

echo "   📄 Available members: $MEMBERS_COUNT"
echo "   📄 Available teams: $TEAMS_COUNT"

if [ "$MEMBERS_COUNT" -eq 0 ] || [ "$TEAMS_COUNT" -eq 0 ]; then
    echo "❌ Cannot test assignment - need both members and teams"
    exit 1
fi

# Get first available member and team
FIRST_MEMBER_ID=$(echo $MEMBERS | jq -r '.[0].id')
FIRST_TEAM_ID=$(echo $TEAMS | jq -r '.[0].id')

echo ""
echo "🔄 Testing assignment of member $FIRST_MEMBER_ID to team $FIRST_TEAM_ID..."

# Test 1: Direct backend API
echo "1. ✅ Testing direct backend API..."
RESULT=$(curl -s -X POST -H "Content-Type: application/json" \
    -d "{\"team_id\": $FIRST_TEAM_ID, \"team_member_id\": $FIRST_MEMBER_ID}" \
    http://localhost:8080/api/v1/assign)

if echo $RESULT | grep -q "successfully"; then
    echo "   ✅ Direct backend assignment working"
else
    echo "   ❌ Direct backend assignment failed: $RESULT"
fi

# Test 2: Through frontend proxy
echo "2. ✅ Testing through frontend proxy..."
RESULT2=$(curl -s -X POST -H "Content-Type: application/json" \
    -d "{\"team_id\": $FIRST_TEAM_ID, \"team_member_id\": $FIRST_MEMBER_ID}" \
    http://localhost:3000/api/v1/assign)

if echo $RESULT2 | grep -q "successfully"; then
    echo "   ✅ Frontend proxy assignment working"
else
    echo "   ❌ Frontend proxy assignment failed: $RESULT2"
fi

# Test 3: Verify assignment in database
echo "3. ✅ Verifying assignment in database..."
UPDATED_TEAM=$(curl -s http://localhost:8080/api/v1/teams/$FIRST_TEAM_ID)
MEMBER_IN_TEAM=$(echo $UPDATED_TEAM | jq ".members[] | select(.id == $FIRST_MEMBER_ID)")

if [ -n "$MEMBER_IN_TEAM" ] && [ "$MEMBER_IN_TEAM" != "null" ]; then
    echo "   ✅ Member successfully assigned to team in database"
else
    echo "   ⚠️  Member assignment not reflected in database"
fi

echo ""
echo "🎉 Assignment functionality testing complete!"
echo ""
echo "📋 Frontend testing instructions:"
echo "   1. Open http://localhost:3000 in your browser"
echo "   2. Go to 'Assign to Team' page"
echo "   3. Select an unassigned member from dropdown"
echo "   4. Select a team from dropdown"
echo "   5. Click 'Assign to Team' button"
echo "   6. You should see a green toast notification saying 'Member assigned to team successfully!'"
echo "   7. Check the 'Current Teams' section below - the member should appear in the team"