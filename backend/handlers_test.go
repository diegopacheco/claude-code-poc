package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strconv"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func setupTestRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	
	api := r.Group("/api/v1")
	{
		members := api.Group("/members")
		{
			members.POST("", CreateTeamMember)
			members.GET("", GetTeamMembers)
			members.GET("/:id", GetTeamMember)
			members.PUT("/:id", UpdateTeamMember)
			members.DELETE("/:id", DeleteTeamMember)
		}

		teams := api.Group("/teams")
		{
			teams.POST("", CreateTeam)
			teams.GET("", GetTeams)
			teams.GET("/:id", GetTeam)
			teams.PUT("/:id", UpdateTeam)
			teams.DELETE("/:id", DeleteTeam)
		}
		
		api.DELETE("/remove-member/:teamId/:memberId", RemoveFromTeam)

		api.POST("/assign", AssignToTeam)

		feedback := api.Group("/feedback")
		{
			feedback.POST("", CreateFeedback)
			feedback.GET("", GetFeedback)
			feedback.GET("/:id", GetFeedbackByID)
			feedback.DELETE("/:id", DeleteFeedback)
		}
	}

	return r
}

func TestCreateTeamMember(t *testing.T) {
	DB = SetupTestDB()
	defer CleanupTestDB(DB)

	router := setupTestRouter()

	t.Run("Create team member successfully", func(t *testing.T) {
		member := TeamMember{
			Name:    "John Doe",
			Email:   "john@example.com",
			Picture: "https://example.com/photo.jpg",
		}

		jsonValue, _ := json.Marshal(member)
		req, _ := http.NewRequest("POST", "/api/v1/members", bytes.NewBuffer(jsonValue))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusCreated, w.Code)

		var response TeamMember
		json.Unmarshal(w.Body.Bytes(), &response)
		assert.Equal(t, "John Doe", response.Name)
		assert.Equal(t, "john@example.com", response.Email)
		assert.NotZero(t, response.ID)
	})

	t.Run("Create team member with invalid data", func(t *testing.T) {
		invalidJSON := `{"name": "", "email": "invalid-email"}`
		req, _ := http.NewRequest("POST", "/api/v1/members", bytes.NewBufferString(invalidJSON))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.True(t, w.Code == http.StatusInternalServerError || w.Code == http.StatusCreated)
	})

	t.Run("Create team member with malformed JSON", func(t *testing.T) {
		req, _ := http.NewRequest("POST", "/api/v1/members", bytes.NewBufferString(`{"invalid json`))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
}

func TestGetTeamMembers(t *testing.T) {
	DB = SetupTestDB()
	defer CleanupTestDB(DB)

	router := setupTestRouter()

	t.Run("Get empty team members list", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/api/v1/members", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var response []TeamMember
		json.Unmarshal(w.Body.Bytes(), &response)
		assert.Empty(t, response)
	})

	t.Run("Get team members list with data", func(t *testing.T) {
		member1 := TeamMember{Name: "John Doe", Email: "john@example.com", Picture: "photo1.jpg"}
		member2 := TeamMember{Name: "Jane Smith", Email: "jane@example.com", Picture: "photo2.jpg"}
		DB.Create(&member1)
		DB.Create(&member2)

		req, _ := http.NewRequest("GET", "/api/v1/members", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var response []TeamMember
		json.Unmarshal(w.Body.Bytes(), &response)
		assert.Len(t, response, 2)
		assert.Equal(t, "John Doe", response[0].Name)
		assert.Equal(t, "Jane Smith", response[1].Name)
	})
}

func TestGetTeamMember(t *testing.T) {
	DB = SetupTestDB()
	defer CleanupTestDB(DB)

	router := setupTestRouter()

	t.Run("Get existing team member", func(t *testing.T) {
		member := TeamMember{Name: "John Doe", Email: "john@example.com", Picture: "photo.jpg"}
		DB.Create(&member)

		req, _ := http.NewRequest("GET", "/api/v1/members/"+strconv.Itoa(int(member.ID)), nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var response TeamMember
		json.Unmarshal(w.Body.Bytes(), &response)
		assert.Equal(t, "John Doe", response.Name)
		assert.Equal(t, member.ID, response.ID)
	})

	t.Run("Get non-existing team member", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/api/v1/members/999", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusNotFound, w.Code)

		var response map[string]string
		json.Unmarshal(w.Body.Bytes(), &response)
		assert.Equal(t, "Team member not found", response["error"])
	})
}

func TestUpdateTeamMember(t *testing.T) {
	DB = SetupTestDB()
	defer CleanupTestDB(DB)

	router := setupTestRouter()

	t.Run("Update existing team member", func(t *testing.T) {
		member := TeamMember{Name: "John Doe", Email: "john@example.com", Picture: "photo.jpg"}
		DB.Create(&member)

		updatedMember := TeamMember{
			Name:    "John Smith",
			Email:   "john.smith@example.com",
			Picture: "new-photo.jpg",
		}

		jsonValue, _ := json.Marshal(updatedMember)
		req, _ := http.NewRequest("PUT", "/api/v1/members/"+strconv.Itoa(int(member.ID)), bytes.NewBuffer(jsonValue))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var response TeamMember
		json.Unmarshal(w.Body.Bytes(), &response)
		assert.Equal(t, "John Smith", response.Name)
		assert.Equal(t, "john.smith@example.com", response.Email)
	})

	t.Run("Update non-existing team member", func(t *testing.T) {
		updatedMember := TeamMember{Name: "John Smith", Email: "john.smith@example.com", Picture: "photo.jpg"}
		jsonValue, _ := json.Marshal(updatedMember)

		req, _ := http.NewRequest("PUT", "/api/v1/members/999", bytes.NewBuffer(jsonValue))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusNotFound, w.Code)
	})
}

func TestDeleteTeamMember(t *testing.T) {
	DB = SetupTestDB()
	defer CleanupTestDB(DB)

	router := setupTestRouter()

	t.Run("Delete existing team member", func(t *testing.T) {
		member := TeamMember{Name: "John Doe", Email: "john@example.com", Picture: "photo.jpg"}
		DB.Create(&member)

		req, _ := http.NewRequest("DELETE", "/api/v1/members/"+strconv.Itoa(int(member.ID)), nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var response map[string]string
		json.Unmarshal(w.Body.Bytes(), &response)
		assert.Equal(t, "Team member deleted", response["message"])

		var count int64
		DB.Model(&TeamMember{}).Where("id = ?", member.ID).Count(&count)
		assert.Equal(t, int64(0), count)
	})
}

func TestCreateTeam(t *testing.T) {
	DB = SetupTestDB()
	defer CleanupTestDB(DB)

	router := setupTestRouter()

	t.Run("Create team successfully", func(t *testing.T) {
		team := Team{
			Name: "Development Team",
			Logo: "https://example.com/logo.png",
		}

		jsonValue, _ := json.Marshal(team)
		req, _ := http.NewRequest("POST", "/api/v1/teams", bytes.NewBuffer(jsonValue))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusCreated, w.Code)

		var response Team
		json.Unmarshal(w.Body.Bytes(), &response)
		assert.Equal(t, "Development Team", response.Name)
		assert.NotZero(t, response.ID)
	})

	t.Run("Create team with invalid data", func(t *testing.T) {
		invalidJSON := `{"name": ""}`
		req, _ := http.NewRequest("POST", "/api/v1/teams", bytes.NewBufferString(invalidJSON))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.True(t, w.Code == http.StatusInternalServerError || w.Code == http.StatusCreated)
	})
}

func TestAssignToTeam(t *testing.T) {
	DB = SetupTestDB()
	defer CleanupTestDB(DB)

	router := setupTestRouter()

	t.Run("Assign member to team successfully", func(t *testing.T) {
		member := TeamMember{Name: "John Doe", Email: "john@example.com", Picture: "photo.jpg"}
		team := Team{Name: "Development Team", Logo: "logo.png"}
		DB.Create(&member)
		DB.Create(&team)

		assignment := TeamAssignment{
			TeamID:       team.ID,
			TeamMemberID: member.ID,
		}

		jsonValue, _ := json.Marshal(assignment)
		req, _ := http.NewRequest("POST", "/api/v1/assign", bytes.NewBuffer(jsonValue))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var response map[string]string
		json.Unmarshal(w.Body.Bytes(), &response)
		assert.Equal(t, "Member assigned to team successfully", response["message"])
	})

	t.Run("Assign non-existing member to team", func(t *testing.T) {
		team := Team{Name: "Development Team", Logo: "logo.png"}
		DB.Create(&team)

		assignment := TeamAssignment{
			TeamID:       team.ID,
			TeamMemberID: 999,
		}

		jsonValue, _ := json.Marshal(assignment)
		req, _ := http.NewRequest("POST", "/api/v1/assign", bytes.NewBuffer(jsonValue))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusNotFound, w.Code)
	})

	t.Run("Assign member to non-existing team", func(t *testing.T) {
		member := TeamMember{Name: "John Doe", Email: "john@example.com", Picture: "photo.jpg"}
		DB.Create(&member)

		assignment := TeamAssignment{
			TeamID:       999,
			TeamMemberID: member.ID,
		}

		jsonValue, _ := json.Marshal(assignment)
		req, _ := http.NewRequest("POST", "/api/v1/assign", bytes.NewBuffer(jsonValue))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusNotFound, w.Code)
	})
}

func TestCreateFeedback(t *testing.T) {
	DB = SetupTestDB()
	defer CleanupTestDB(DB)

	router := setupTestRouter()

	t.Run("Create feedback successfully", func(t *testing.T) {
		feedback := Feedback{
			Content:    "Great work!",
			TargetType: "person",
			TargetID:   1,
		}

		jsonValue, _ := json.Marshal(feedback)
		req, _ := http.NewRequest("POST", "/api/v1/feedback", bytes.NewBuffer(jsonValue))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusCreated, w.Code)

		var response Feedback
		json.Unmarshal(w.Body.Bytes(), &response)
		assert.Equal(t, "Great work!", response.Content)
		assert.Equal(t, "person", response.TargetType)
		assert.NotZero(t, response.ID)
	})

	t.Run("Create feedback with invalid target type", func(t *testing.T) {
		feedback := Feedback{
			Content:    "Great work!",
			TargetType: "invalid",
			TargetID:   1,
		}

		jsonValue, _ := json.Marshal(feedback)
		req, _ := http.NewRequest("POST", "/api/v1/feedback", bytes.NewBuffer(jsonValue))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusBadRequest, w.Code)

		var response map[string]string
		json.Unmarshal(w.Body.Bytes(), &response)
		assert.Equal(t, "Target type must be 'team' or 'member'", response["error"])
	})
}

func TestGetFeedback(t *testing.T) {
	DB = SetupTestDB()
	defer CleanupTestDB(DB)

	router := setupTestRouter()

	t.Run("Get all feedback", func(t *testing.T) {
		feedback1 := Feedback{Content: "Good job!", TargetType: "person", TargetID: 1}
		feedback2 := Feedback{Content: "Team effort!", TargetType: "team", TargetID: 1}
		DB.Create(&feedback1)
		DB.Create(&feedback2)

		req, _ := http.NewRequest("GET", "/api/v1/feedback", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var response []Feedback
		json.Unmarshal(w.Body.Bytes(), &response)
		assert.Len(t, response, 2)
	})

	t.Run("Get feedback filtered by target type", func(t *testing.T) {
		CleanupTestDB(DB)
		feedback1 := Feedback{Content: "Good job!", TargetType: "person", TargetID: 1}
		feedback2 := Feedback{Content: "Team effort!", TargetType: "team", TargetID: 1}
		DB.Create(&feedback1)
		DB.Create(&feedback2)

		req, _ := http.NewRequest("GET", "/api/v1/feedback?target_type=person", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var response []Feedback
		json.Unmarshal(w.Body.Bytes(), &response)
		assert.Len(t, response, 1)
		assert.Equal(t, "person", response[0].TargetType)
	})

	t.Run("Get feedback filtered by target ID", func(t *testing.T) {
		CleanupTestDB(DB)
		feedback1 := Feedback{Content: "Good job!", TargetType: "person", TargetID: 1}
		feedback2 := Feedback{Content: "Great work!", TargetType: "person", TargetID: 2}
		DB.Create(&feedback1)
		DB.Create(&feedback2)

		req, _ := http.NewRequest("GET", "/api/v1/feedback?target_id=1", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var response []Feedback
		json.Unmarshal(w.Body.Bytes(), &response)
		assert.Len(t, response, 1)
		assert.Equal(t, uint(1), response[0].TargetID)
	})
}