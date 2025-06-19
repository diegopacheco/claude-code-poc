package main

import (
	"time"
)

type TeamMember struct {
	ID      uint   `json:"id" gorm:"primaryKey"`
	Name    string `json:"name" gorm:"not null"`
	Picture string `json:"picture"`
	Email   string `json:"email" gorm:"uniqueIndex;not null"`
	Teams   []Team `json:"teams" gorm:"many2many:member_teams;"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Team struct {
	ID       uint         `json:"id" gorm:"primaryKey"`
	Name     string       `json:"name" gorm:"not null"`
	Logo     string       `json:"logo"`
	Members  []TeamMember `json:"members" gorm:"many2many:member_teams;"`
	CreatedAt time.Time   `json:"created_at"`
	UpdatedAt time.Time   `json:"updated_at"`
}

type Feedback struct {
	ID           uint   `json:"id" gorm:"primaryKey"`
	Content      string `json:"content" gorm:"not null"`
	TargetType   string `json:"target_type" gorm:"not null"`
	TargetID     uint   `json:"target_id" gorm:"not null"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type TeamAssignment struct {
	TeamID       uint `json:"team_id"`
	TeamMemberID uint `json:"team_member_id"`
}