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

// GetServiceByStoreID: ดึงบริการทั้งหมดของร้านตาม Store ID
// ปรับชื่อจาก store_id เป็น id ในการรับพารามิเตอร์
func GetServiceByStoreID(c *gin.Context) {
    storeID := c.Param("id") // ใช้ id แทน store_id ใน URL

    var services []entity.Service

    if err := config.DB().
        Preload("Store"). // โหลดข้อมูลของ Store ที่สัมพันธ์กัน
        Where("store_id = ?", storeID).
        Find(&services).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve services"})
        return
    }

    // หากข้อมูลว่าง ให้แจ้งกลับไป
    if len(services) == 0 {
        c.JSON(http.StatusNotFound, gin.H{"message": "No services found for this store"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"data": services})
}


// UpdateService: อัพเดตข้อมูลของบริการ
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
	service.CategoryPet = payload.CategoryPet // เพิ่ม CategoryPet

	// บันทึกข้อมูลที่อัพเดต
	if err := config.DB().Save(&service).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update service"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Service updated successfully", "service": service})
}
