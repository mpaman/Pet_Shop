package service

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/mpaman/petshop/config"
	"github.com/mpaman/petshop/entity"
)

type (
	addService struct {
		StoreID     uint   `json:"store_id"`
		NameService string `json:"name_service"`
		Duration    int    `json:"duration"`
		Price       int    `json:"price"`
		CategoryPet string `json:"category_pet"` // เพิ่ม CategoryPet
	}
)

func CreateService(c *gin.Context) {
	var payload addService

	// Bind JSON payload to the struct
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if StoreID is provided
	if payload.StoreID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Store ID is required"})
		return
	}

	// Check if store exists in the database
	var store entity.Store
	if err := config.DB().First(&store, payload.StoreID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Store not found"})
		return
	}

	// Create the new service
	service := entity.Service{
		StoreID:     payload.StoreID,
		NameService: payload.NameService,
		Duration:    payload.Duration,
		Price:       payload.Price,
		CategoryPet: payload.CategoryPet,
	}

	// Save the service to the database
	if err := config.DB().Create(&service).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Return a success message
	c.JSON(http.StatusCreated, gin.H{
		"status":  201,
		"message": "Service added successfully",
		"service": service,
	})
}
