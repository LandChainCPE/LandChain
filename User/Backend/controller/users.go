package controller

import (
	// "errors" // เพิ่ม import สำหรับ package errors
	// "fmt"
	"net/http"
	// "os"


	"backend/config"
	"backend/entity"
	"github.com/gin-gonic/gin"
	// "gorm.io/gorm" // เพิ่ม import สำหรับ gorm
)

// GET /users
func ListUsers(c *gin.Context) {

	// Define a slice to hold user records
	var users []entity.Users

	// Get the database connection
	db := config.DB()

	// Query the user table for basic user data
	results := db.Select("id, name, password, land, role_id").Find(&users)

	// Check for errors in the query
	if results.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
		return
	}

	// Return the results as JSON
	c.JSON(http.StatusOK, users)
}

// PUT update User by id
