package service

import (
	"net/http"
	"github.com/mpaman/petshop/config"
	"github.com/mpaman/petshop/entity"
	"github.com/gin-gonic/gin"
)
type (
    addService struct {
        StoreID     uint   `json:"store_id"`
        NameService string `json:"name_service"`
        Duration    int    `json:"duration"`
        Price       int    `json:"price"`
    }
)

// CreateService handles the addition of a new service
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

// GetStoreServices: ดึงบริการทั้งหมดของร้านตาม Store ID
func GetStoreServices(c *gin.Context) {
	storeID := c.Param("store_id")
	var services []entity.Service

	if err := config.DB().Where("store_id = ?", storeID).Find(&services).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve services"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": services})
}
