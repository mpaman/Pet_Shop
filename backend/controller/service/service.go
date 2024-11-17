package service

import (
	"fmt"
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
		CategoryPet string `json:"category_pet"` // แก้ตรงนี้
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

// GetStoreServices: ดึงบริการทั้งหมดของร้านตาม Store ID
func GetServiceByStoreID(c *gin.Context) {
    storeID := c.Param("store_id")
    var services []entity.Service

    // ตรวจสอบค่า storeID
    fmt.Println("storeID:", storeID)

    // คิวรีเพื่อดึงบริการทั้งหมดของร้านที่มี store_id ตรงกับ storeID
    if err := config.DB().Where("store_id = ?", storeID).Find(&services).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve services"})
        return
    }

    fmt.Println("services:", services)

    c.JSON(http.StatusOK, gin.H{"data": services})
}


func UpdateService(c *gin.Context) {
	serviceID := c.Param("id")
	var payload entity.Service

	// Bind JSON payload to the struct
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// ค้นหาบริการจาก ID
	var service entity.Service
	if err := config.DB().First(&service, serviceID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Service not found"})
		return
	}

	// อัพเดตข้อมูลบริการ
	service.NameService = payload.NameService
	service.Duration = payload.Duration
	service.Price = payload.Price

	// บันทึกข้อมูลที่อัพเดต
	if err := config.DB().Save(&service).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update service"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Service updated successfully", "service": service})
}
