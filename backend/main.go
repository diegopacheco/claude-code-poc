package main

import (
	"log"
	"time"
	
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	InitDatabase()

	r := gin.Default()

	// CORS middleware
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost", "http://frontend"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

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

	log.Println("Server starting on port 8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}