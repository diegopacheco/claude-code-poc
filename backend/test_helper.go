package main

import (
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func SetupTestDB() *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		panic("failed to connect to test database")
	}

	err = db.AutoMigrate(&Feedback{})
	if err != nil {
		panic("failed to migrate feedback table")
	}

	err = db.AutoMigrate(&TeamMember{})
	if err != nil {
		panic("failed to migrate team member table")
	}

	err = db.AutoMigrate(&Team{})
	if err != nil {
		panic("failed to migrate team table")
	}

	return db
}

func CleanupTestDB(db *gorm.DB) {
	db.Exec("DELETE FROM member_teams")
	db.Exec("DELETE FROM team_members")
	db.Exec("DELETE FROM teams")
	db.Exec("DELETE FROM feedbacks")
}