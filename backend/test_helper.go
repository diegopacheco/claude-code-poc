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

	err = db.AutoMigrate(&TeamMember{}, &Team{}, &Feedback{})
	if err != nil {
		panic("failed to migrate test database")
	}

	return db
}

func CleanupTestDB(db *gorm.DB) {
	db.Exec("DELETE FROM team_members")
	db.Exec("DELETE FROM teams")
	db.Exec("DELETE FROM feedbacks")
}