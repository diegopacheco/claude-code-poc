package main

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestTeamMemberModel(t *testing.T) {
	db := SetupTestDB()
	defer CleanupTestDB(db)

	t.Run("Create team member", func(t *testing.T) {
		member := TeamMember{
			Name:    "John Doe",
			Email:   "john@example.com",
			Picture: "https://example.com/photo.jpg",
		}

		result := db.Create(&member)
		assert.NoError(t, result.Error)
		assert.NotZero(t, member.ID)
		assert.NotZero(t, member.CreatedAt)
		assert.NotZero(t, member.UpdatedAt)
	})

	t.Run("Email uniqueness constraint", func(t *testing.T) {
		member1 := TeamMember{
			Name:    "John Doe",
			Email:   "duplicate@example.com",
			Picture: "photo1.jpg",
		}
		db.Create(&member1)

		member2 := TeamMember{
			Name:    "Jane Doe",
			Email:   "duplicate@example.com",
			Picture: "photo2.jpg",
		}
		result := db.Create(&member2)
		assert.Error(t, result.Error)
	})

	t.Run("Required fields validation", func(t *testing.T) {
		member := TeamMember{
			Picture: "photo.jpg",
		}
		result := db.Create(&member)
		if result.Error == nil {
			assert.Empty(t, member.Name)
			assert.Empty(t, member.Email)
		} else {
			assert.Error(t, result.Error)
		}
	})
}

func TestTeamModel(t *testing.T) {
	db := SetupTestDB()
	defer CleanupTestDB(db)

	t.Run("Create team", func(t *testing.T) {
		team := Team{
			Name: "Development Team",
			Logo: "https://example.com/logo.png",
		}

		result := db.Create(&team)
		assert.NoError(t, result.Error)
		assert.NotZero(t, team.ID)
		assert.NotZero(t, team.CreatedAt)
		assert.NotZero(t, team.UpdatedAt)
	})

	t.Run("Team with members relationship", func(t *testing.T) {
		member := TeamMember{
			Name:    "John Doe",
			Email:   "john@example.com",
			Picture: "photo.jpg",
		}
		db.Create(&member)

		team := Team{
			Name:    "Development Team",
			Logo:    "logo.png",
			Members: []TeamMember{member},
		}

		result := db.Create(&team)
		assert.NoError(t, result.Error)

		var retrievedTeam Team
		db.Preload("Members").First(&retrievedTeam, team.ID)
		assert.Len(t, retrievedTeam.Members, 1)
		assert.Equal(t, "John Doe", retrievedTeam.Members[0].Name)
	})
}

func TestFeedbackModel(t *testing.T) {
	db := SetupTestDB()
	defer CleanupTestDB(db)

	t.Run("Create feedback", func(t *testing.T) {
		feedback := Feedback{
			Content:    "Great work!",
			TargetType: "person",
			TargetID:   1,
		}

		result := db.Create(&feedback)
		assert.NoError(t, result.Error)
		assert.NotZero(t, feedback.ID)
		assert.NotZero(t, feedback.CreatedAt)
		assert.NotZero(t, feedback.UpdatedAt)
	})

	t.Run("Required fields validation", func(t *testing.T) {
		feedback := Feedback{
			TargetType: "person",
		}
		result := db.Create(&feedback)
		if result.Error == nil {
			assert.Empty(t, feedback.Content)
		} else {
			assert.Error(t, result.Error)
		}
	})

	t.Run("Query feedback by target type", func(t *testing.T) {
		feedback1 := Feedback{
			Content:    "Team feedback",
			TargetType: "team",
			TargetID:   1,
		}
		feedback2 := Feedback{
			Content:    "Person feedback",
			TargetType: "person",
			TargetID:   1,
		}

		db.Create(&feedback1)
		db.Create(&feedback2)

		var teamFeedbacks []Feedback
		db.Where("target_type = ?", "team").Find(&teamFeedbacks)
		assert.Len(t, teamFeedbacks, 1)
		assert.Equal(t, "Team feedback", teamFeedbacks[0].Content)
	})
}

func TestTeamMemberAssociation(t *testing.T) {
	db := SetupTestDB()
	defer CleanupTestDB(db)

	t.Run("Many-to-many relationship", func(t *testing.T) {
		member1 := TeamMember{
			Name:    "John Doe",
			Email:   "john@example.com",
			Picture: "photo1.jpg",
		}
		member2 := TeamMember{
			Name:    "Jane Smith",
			Email:   "jane@example.com",
			Picture: "photo2.jpg",
		}
		db.Create(&member1)
		db.Create(&member2)

		team := Team{
			Name:    "Development Team",
			Logo:    "logo.png",
			Members: []TeamMember{member1, member2},
		}
		db.Create(&team)

		var retrievedTeam Team
		db.Preload("Members").First(&retrievedTeam, team.ID)
		assert.Len(t, retrievedTeam.Members, 2)

		var retrievedMember TeamMember
		db.Preload("Teams").First(&retrievedMember, member1.ID)
		assert.Len(t, retrievedMember.Teams, 1)
		assert.Equal(t, "Development Team", retrievedMember.Teams[0].Name)
	})

	t.Run("Add member to existing team", func(t *testing.T) {
		member := TeamMember{
			Name:    "Alice Johnson",
			Email:   "alice@example.com",
			Picture: "photo.jpg",
		}
		team := Team{
			Name: "QA Team",
			Logo: "qa-logo.png",
		}
		db.Create(&member)
		db.Create(&team)

		err := db.Model(&team).Association("Members").Append(&member)
		assert.NoError(t, err)

		var updatedTeam Team
		db.Preload("Members").First(&updatedTeam, team.ID)
		assert.Len(t, updatedTeam.Members, 1)
		assert.Equal(t, "Alice Johnson", updatedTeam.Members[0].Name)
	})

	t.Run("Remove member from team", func(t *testing.T) {
		member := TeamMember{
			Name:    "Bob Wilson",
			Email:   "bob@example.com",
			Picture: "photo.jpg",
		}
		team := Team{
			Name:    "Design Team",
			Logo:    "design-logo.png",
			Members: []TeamMember{member},
		}
		db.Create(&member)
		db.Create(&team)

		err := db.Model(&team).Association("Members").Delete(&member)
		assert.NoError(t, err)

		var updatedTeam Team
		db.Preload("Members").First(&updatedTeam, team.ID)
		assert.Len(t, updatedTeam.Members, 0)
	})
}