package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strconv"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
)

type IntegrationTestSuite struct {
	suite.Suite
	router *gin.Engine
}

func (suite *IntegrationTestSuite) SetupTest() {
	DB = SetupTestDB()
	suite.router = setupTestRouter()
}

func (suite *IntegrationTestSuite) TearDownTest() {
	CleanupTestDB(DB)
}

func (suite *IntegrationTestSuite) TestCompleteWorkflow() {
	member1ID := suite.createTeamMember("John Doe", "john@example.com", "photo1.jpg")
	member2ID := suite.createTeamMember("Jane Smith", "jane@example.com", "photo2.jpg")
	
	teamID := suite.createTeam("Development Team", "dev-logo.png")
	
	suite.assignMemberToTeam(member1ID, teamID)
	suite.assignMemberToTeam(member2ID, teamID)
	
	team := suite.getTeam(teamID)
	assert.Len(suite.T(), team.Members, 2)
	
	suite.createFeedback("Great teamwork!", "team", teamID)
	suite.createFeedback("Excellent individual contribution!", "person", member1ID)
	
	feedbacks := suite.getAllFeedback()
	assert.Len(suite.T(), feedbacks, 2)
	
	teamFeedbacks := suite.getFeedbackByTargetType("team")
	assert.Len(suite.T(), teamFeedbacks, 1)
	assert.Equal(suite.T(), "Great teamwork!", teamFeedbacks[0].Content)
	
	personFeedbacks := suite.getFeedbackByTargetType("person")
	assert.Len(suite.T(), personFeedbacks, 1)
	assert.Equal(suite.T(), "Excellent individual contribution!", personFeedbacks[0].Content)
}

func (suite *IntegrationTestSuite) TestTeamMemberManagement() {
	member1ID := suite.createTeamMember("Alice Johnson", "alice@example.com", "alice.jpg")
	member2ID := suite.createTeamMember("Bob Wilson", "bob@example.com", "bob.jpg")
	
	members := suite.getAllTeamMembers()
	assert.Len(suite.T(), members, 2)
	
	suite.updateTeamMember(member1ID, "Alice Brown", "alice.brown@example.com", "alice-new.jpg")
	
	updatedMember := suite.getTeamMember(member1ID)
	assert.Equal(suite.T(), "Alice Brown", updatedMember.Name)
	assert.Equal(suite.T(), "alice.brown@example.com", updatedMember.Email)
	
	suite.deleteTeamMember(member2ID)
	
	members = suite.getAllTeamMembers()
	assert.Len(suite.T(), members, 1)
	assert.Equal(suite.T(), "Alice Brown", members[0].Name)
}

func (suite *IntegrationTestSuite) TestTeamManagement() {
	team1ID := suite.createTeam("Frontend Team", "frontend-logo.png")
	team2ID := suite.createTeam("Backend Team", "backend-logo.png")
	
	teams := suite.getAllTeams()
	assert.Len(suite.T(), teams, 2)
	
	suite.updateTeam(team1ID, "UI/UX Team", "ui-logo.png")
	
	updatedTeam := suite.getTeam(team1ID)
	assert.Equal(suite.T(), "UI/UX Team", updatedTeam.Name)
	assert.Equal(suite.T(), "ui-logo.png", updatedTeam.Logo)
	
	suite.deleteTeam(team2ID)
	
	teams = suite.getAllTeams()
	assert.Len(suite.T(), teams, 1)
	assert.Equal(suite.T(), "UI/UX Team", teams[0].Name)
}

func (suite *IntegrationTestSuite) TestTeamAssignmentAndRemoval() {
	memberID := suite.createTeamMember("Developer One", "dev1@example.com", "dev1.jpg")
	team1ID := suite.createTeam("Team Alpha", "alpha-logo.png")
	team2ID := suite.createTeam("Team Beta", "beta-logo.png")
	
	suite.assignMemberToTeam(memberID, team1ID)
	suite.assignMemberToTeam(memberID, team2ID)
	
	member := suite.getTeamMember(memberID)
	assert.Len(suite.T(), member.Teams, 2)
	
	team1 := suite.getTeam(team1ID)
	assert.Len(suite.T(), team1.Members, 1)
	assert.Equal(suite.T(), "Developer One", team1.Members[0].Name)
	
	suite.removeMemberFromTeam(team1ID, memberID)
	
	updatedTeam1 := suite.getTeam(team1ID)
	assert.Len(suite.T(), updatedTeam1.Members, 0)
	
	updatedMember := suite.getTeamMember(memberID)
	assert.Len(suite.T(), updatedMember.Teams, 1)
	assert.Equal(suite.T(), "Team Beta", updatedMember.Teams[0].Name)
}

func (suite *IntegrationTestSuite) TestFeedbackManagement() {
	memberID := suite.createTeamMember("Test User", "test@example.com", "test.jpg")
	teamID := suite.createTeam("Test Team", "test-logo.png")
	
	feedback1ID := suite.createFeedback("Individual feedback", "person", memberID)
	feedback2ID := suite.createFeedback("Team feedback", "team", teamID)
	
	feedback1 := suite.getFeedbackByID(feedback1ID)
	assert.Equal(suite.T(), "Individual feedback", feedback1.Content)
	assert.Equal(suite.T(), "person", feedback1.TargetType)
	assert.Equal(suite.T(), memberID, feedback1.TargetID)
	
	memberFeedbacks := suite.getFeedbackByTargetID(memberID)
	assert.Len(suite.T(), memberFeedbacks, 1)
	assert.Equal(suite.T(), "Individual feedback", memberFeedbacks[0].Content)
	
	teamFeedbacks := suite.getFeedbackByTargetID(teamID)
	assert.Len(suite.T(), teamFeedbacks, 1)
	assert.Equal(suite.T(), "Team feedback", teamFeedbacks[0].Content)
	
	suite.deleteFeedback(feedback1ID)
	
	allFeedbacks := suite.getAllFeedback()
	assert.Len(suite.T(), allFeedbacks, 1)
	assert.Equal(suite.T(), "Team feedback", allFeedbacks[0].Content)
}

func (suite *IntegrationTestSuite) createTeamMember(name, email, picture string) uint {
	member := TeamMember{Name: name, Email: email, Picture: picture}
	jsonValue, _ := json.Marshal(member)
	
	req, _ := http.NewRequest("POST", "/api/v1/members", bytes.NewBuffer(jsonValue))
	req.Header.Set("Content-Type", "application/json")
	
	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)
	
	assert.Equal(suite.T(), http.StatusCreated, w.Code)
	
	var response TeamMember
	json.Unmarshal(w.Body.Bytes(), &response)
	return response.ID
}

func (suite *IntegrationTestSuite) createTeam(name, logo string) uint {
	team := Team{Name: name, Logo: logo}
	jsonValue, _ := json.Marshal(team)
	
	req, _ := http.NewRequest("POST", "/api/v1/teams", bytes.NewBuffer(jsonValue))
	req.Header.Set("Content-Type", "application/json")
	
	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)
	
	assert.Equal(suite.T(), http.StatusCreated, w.Code)
	
	var response Team
	json.Unmarshal(w.Body.Bytes(), &response)
	return response.ID
}

func (suite *IntegrationTestSuite) createFeedback(content, targetType string, targetID uint) uint {
	feedback := Feedback{Content: content, TargetType: targetType, TargetID: targetID}
	jsonValue, _ := json.Marshal(feedback)
	
	req, _ := http.NewRequest("POST", "/api/v1/feedback", bytes.NewBuffer(jsonValue))
	req.Header.Set("Content-Type", "application/json")
	
	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)
	
	assert.Equal(suite.T(), http.StatusCreated, w.Code)
	
	var response Feedback
	json.Unmarshal(w.Body.Bytes(), &response)
	return response.ID
}

func (suite *IntegrationTestSuite) assignMemberToTeam(memberID, teamID uint) {
	assignment := TeamAssignment{TeamID: teamID, TeamMemberID: memberID}
	jsonValue, _ := json.Marshal(assignment)
	
	req, _ := http.NewRequest("POST", "/api/v1/assign", bytes.NewBuffer(jsonValue))
	req.Header.Set("Content-Type", "application/json")
	
	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)
	
	assert.Equal(suite.T(), http.StatusOK, w.Code)
}

func (suite *IntegrationTestSuite) getAllTeamMembers() []TeamMember {
	req, _ := http.NewRequest("GET", "/api/v1/members", nil)
	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)
	
	assert.Equal(suite.T(), http.StatusOK, w.Code)
	
	var members []TeamMember
	json.Unmarshal(w.Body.Bytes(), &members)
	return members
}

func (suite *IntegrationTestSuite) getTeamMember(id uint) TeamMember {
	req, _ := http.NewRequest("GET", "/api/v1/members/"+strconv.Itoa(int(id)), nil)
	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)
	
	assert.Equal(suite.T(), http.StatusOK, w.Code)
	
	var member TeamMember
	json.Unmarshal(w.Body.Bytes(), &member)
	return member
}

func (suite *IntegrationTestSuite) updateTeamMember(id uint, name, email, picture string) {
	member := TeamMember{Name: name, Email: email, Picture: picture}
	jsonValue, _ := json.Marshal(member)
	
	req, _ := http.NewRequest("PUT", "/api/v1/members/"+strconv.Itoa(int(id)), bytes.NewBuffer(jsonValue))
	req.Header.Set("Content-Type", "application/json")
	
	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)
	
	assert.Equal(suite.T(), http.StatusOK, w.Code)
}

func (suite *IntegrationTestSuite) deleteTeamMember(id uint) {
	req, _ := http.NewRequest("DELETE", "/api/v1/members/"+strconv.Itoa(int(id)), nil)
	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)
	
	assert.Equal(suite.T(), http.StatusOK, w.Code)
}

func (suite *IntegrationTestSuite) getAllTeams() []Team {
	req, _ := http.NewRequest("GET", "/api/v1/teams", nil)
	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)
	
	assert.Equal(suite.T(), http.StatusOK, w.Code)
	
	var teams []Team
	json.Unmarshal(w.Body.Bytes(), &teams)
	return teams
}

func (suite *IntegrationTestSuite) getTeam(id uint) Team {
	req, _ := http.NewRequest("GET", "/api/v1/teams/"+strconv.Itoa(int(id)), nil)
	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)
	
	assert.Equal(suite.T(), http.StatusOK, w.Code)
	
	var team Team
	json.Unmarshal(w.Body.Bytes(), &team)
	return team
}

func (suite *IntegrationTestSuite) updateTeam(id uint, name, logo string) {
	team := Team{Name: name, Logo: logo}
	jsonValue, _ := json.Marshal(team)
	
	req, _ := http.NewRequest("PUT", "/api/v1/teams/"+strconv.Itoa(int(id)), bytes.NewBuffer(jsonValue))
	req.Header.Set("Content-Type", "application/json")
	
	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)
	
	assert.Equal(suite.T(), http.StatusOK, w.Code)
}

func (suite *IntegrationTestSuite) deleteTeam(id uint) {
	req, _ := http.NewRequest("DELETE", "/api/v1/teams/"+strconv.Itoa(int(id)), nil)
	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)
	
	assert.Equal(suite.T(), http.StatusOK, w.Code)
}

func (suite *IntegrationTestSuite) removeMemberFromTeam(teamID, memberID uint) {
	req, _ := http.NewRequest("DELETE", "/api/v1/teams/"+strconv.Itoa(int(teamID))+"/members/"+strconv.Itoa(int(memberID)), nil)
	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)
	
	assert.Equal(suite.T(), http.StatusOK, w.Code)
}

func (suite *IntegrationTestSuite) getAllFeedback() []Feedback {
	req, _ := http.NewRequest("GET", "/api/v1/feedback", nil)
	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)
	
	assert.Equal(suite.T(), http.StatusOK, w.Code)
	
	var feedbacks []Feedback
	json.Unmarshal(w.Body.Bytes(), &feedbacks)
	return feedbacks
}

func (suite *IntegrationTestSuite) getFeedbackByTargetType(targetType string) []Feedback {
	req, _ := http.NewRequest("GET", "/api/v1/feedback?target_type="+targetType, nil)
	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)
	
	assert.Equal(suite.T(), http.StatusOK, w.Code)
	
	var feedbacks []Feedback
	json.Unmarshal(w.Body.Bytes(), &feedbacks)
	return feedbacks
}

func (suite *IntegrationTestSuite) getFeedbackByTargetID(targetID uint) []Feedback {
	req, _ := http.NewRequest("GET", "/api/v1/feedback?target_id="+strconv.Itoa(int(targetID)), nil)
	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)
	
	assert.Equal(suite.T(), http.StatusOK, w.Code)
	
	var feedbacks []Feedback
	json.Unmarshal(w.Body.Bytes(), &feedbacks)
	return feedbacks
}

func (suite *IntegrationTestSuite) getFeedbackByID(id uint) Feedback {
	req, _ := http.NewRequest("GET", "/api/v1/feedback/"+strconv.Itoa(int(id)), nil)
	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)
	
	assert.Equal(suite.T(), http.StatusOK, w.Code)
	
	var feedback Feedback
	json.Unmarshal(w.Body.Bytes(), &feedback)
	return feedback
}

func (suite *IntegrationTestSuite) deleteFeedback(id uint) {
	req, _ := http.NewRequest("DELETE", "/api/v1/feedback/"+strconv.Itoa(int(id)), nil)
	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)
	
	assert.Equal(suite.T(), http.StatusOK, w.Code)
}

func TestIntegrationTestSuite(t *testing.T) {
	suite.Run(t, new(IntegrationTestSuite))
}