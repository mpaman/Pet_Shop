package service

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/mpaman/petshop/config"
	"github.com/mpaman/petshop/entity"
)

func GetAll(c *gin.Context) {
    var services []entity.Service

    if err := config.DB().Preload("Store").Preload("CategoryPet").Find(&services).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve services"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"data": services})
}

func GetServiceByStoreID(c *gin.Context) {
	storeID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid store ID"})
		return
	}

	var services []entity.Service

	if err := config.DB().Preload("Store").
		Preload("CategoryPet").
		Where("store_id = ?", storeID).
		Find(&services).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve services"})
		return
	}

	if len(services) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"message": "No services found for this store"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": services})
}

func UpdateService(c *gin.Context) {
	serviceID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid service ID"})
		return
	}

	var payload entity.Service

	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var service entity.Service
	if err := config.DB().First(&service, serviceID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Service not found"})
		return
	}

	service.NameService = payload.NameService
	service.Duration = payload.Duration
	service.Price = payload.Price
	service.CategoryPetID = payload.CategoryPetID

	if err := config.DB().Save(&service).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update service"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Service updated successfully", "service": service})
}

// DeleteService: ลบบริการ
func DeleteService(c *gin.Context) {
	serviceID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid service ID"})
		return
	}

	var service entity.Service
	if err := config.DB().First(&service, serviceID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Service not found"})
		return
	}

	// ลบ Booking ที่เกี่ยวข้อง
	if err := config.DB().Where("service_id = ?", serviceID).Delete(&entity.Bookingstore{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete related bookings"})
		return
	}

	if err := config.DB().Delete(&service).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete service"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Service and related bookings deleted successfully"})
}
