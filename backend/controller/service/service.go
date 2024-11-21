package service

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/mpaman/petshop/config"
	"github.com/mpaman/petshop/entity"
)

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

func GetAll(c *gin.Context) {
	var services []entity.Service

	if err := config.DB().Preload("Store").Find(&services).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve services"})
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
func Delete(c *gin.Context) {
	id := c.Param("id")

	db := config.DB()
	if err := db.Delete(&entity.Service{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete Service"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Service deleted successfully"})
}
