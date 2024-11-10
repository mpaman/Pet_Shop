package service

import (
	"net/http"
	"github.com/mpaman/petshop/config"
	"github.com/mpaman/petshop/entity"
	"github.com/gin-gonic/gin"
)

// CreateService: สร้างบริการใหม่
func CreateService(c *gin.Context) {
	var service entity.Service

	// Bind JSON payload to Service struct
	if err := c.ShouldBindJSON(&service); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// ตรวจสอบว่า Store มีอยู่จริงหรือไม่
	var store entity.Store
	if err := config.DB().First(&store, service.StoreID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Store not found"})
		return
	}

	// สร้างบริการในฐานข้อมูล
	if err := config.DB().Create(&service).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add service"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Service added successfully", "service": service})
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
