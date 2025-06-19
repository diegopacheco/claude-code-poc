package main

import (
	"net/http"
	"strconv"
	"github.com/gin-gonic/gin"
)

func CreateTeamMember(c *gin.Context) {
	var member TeamMember
	if err := c.ShouldBindJSON(&member); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := DB.Create(&member).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, member)
}

func GetTeamMembers(c *gin.Context) {
	var members []TeamMember
	if err := DB.Preload("Teams").Find(&members).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, members)
}

func GetTeamMember(c *gin.Context) {
	id := c.Param("id")
	var member TeamMember
	if err := DB.Preload("Teams").First(&member, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Team member not found"})
		return
	}
	c.JSON(http.StatusOK, member)
}

func UpdateTeamMember(c *gin.Context) {
	id := c.Param("id")
	var member TeamMember
	if err := DB.First(&member, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Team member not found"})
		return
	}

	if err := c.ShouldBindJSON(&member); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := DB.Save(&member).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, member)
}

func DeleteTeamMember(c *gin.Context) {
	id := c.Param("id")
	if err := DB.Delete(&TeamMember{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Team member deleted"})
}

func CreateTeam(c *gin.Context) {
	var team Team
	if err := c.ShouldBindJSON(&team); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := DB.Create(&team).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, team)
}

func GetTeams(c *gin.Context) {
	var teams []Team
	if err := DB.Preload("Members").Find(&teams).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, teams)
}

func GetTeam(c *gin.Context) {
	id := c.Param("id")
	var team Team
	if err := DB.Preload("Members").First(&team, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Team not found"})
		return
	}
	c.JSON(http.StatusOK, team)
}

func UpdateTeam(c *gin.Context) {
	id := c.Param("id")
	var team Team
	if err := DB.First(&team, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Team not found"})
		return
	}

	if err := c.ShouldBindJSON(&team); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := DB.Save(&team).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, team)
}

func DeleteTeam(c *gin.Context) {
	id := c.Param("id")
	if err := DB.Delete(&Team{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Team deleted"})
}

func AssignToTeam(c *gin.Context) {
	var assignment TeamAssignment
	if err := c.ShouldBindJSON(&assignment); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var team Team
	var member TeamMember
	
	if err := DB.First(&team, assignment.TeamID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Team not found"})
		return
	}

	if err := DB.First(&member, assignment.TeamMemberID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Team member not found"})
		return
	}

	if err := DB.Model(&team).Association("Members").Append(&member); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Member assigned to team successfully"})
}

func RemoveFromTeam(c *gin.Context) {
	teamID := c.Param("teamId")
	memberID := c.Param("memberId")

	var team Team
	var member TeamMember

	if err := DB.First(&team, teamID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Team not found"})
		return
	}

	if err := DB.First(&member, memberID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Team member not found"})
		return
	}

	if err := DB.Model(&team).Association("Members").Delete(&member); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Member removed from team successfully"})
}

func CreateFeedback(c *gin.Context) {
	var feedback Feedback
	if err := c.ShouldBindJSON(&feedback); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if feedback.TargetType != "team" && feedback.TargetType != "member" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Target type must be 'team' or 'member'"})
		return
	}

	if err := DB.Create(&feedback).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, feedback)
}

func GetFeedback(c *gin.Context) {
	targetType := c.Query("target_type")
	targetID := c.Query("target_id")

	var feedbacks []Feedback
	query := DB.Model(&Feedback{})

	if targetType != "" {
		query = query.Where("target_type = ?", targetType)
	}

	if targetID != "" {
		if id, err := strconv.Atoi(targetID); err == nil {
			query = query.Where("target_id = ?", id)
		}
	}

	if err := query.Find(&feedbacks).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, feedbacks)
}

func GetFeedbackByID(c *gin.Context) {
	id := c.Param("id")
	var feedback Feedback
	if err := DB.First(&feedback, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Feedback not found"})
		return
	}
	c.JSON(http.StatusOK, feedback)
}

func DeleteFeedback(c *gin.Context) {
	id := c.Param("id")
	if err := DB.Delete(&Feedback{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Feedback deleted"})
}