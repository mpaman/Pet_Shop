package pet

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/mpaman/petshop/config"
	"github.com/mpaman/petshop/entity"
)


// GetAllPets - ดึงข้อมูลสัตว์เลี้ยงทั้งหมด
func GetAllPets(c *gin.Context) {
	var pets []entity.Pet

	if err := config.DB().Preload("Owner").Preload("Booking").Find(&pets).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": pets})
}

// UpdatePet - อัปเดตข้อมูลสัตว์เลี้ยง
func UpdatePet(c *gin.Context) {
	petID := c.Param("id")
	var pet entity.Pet

	if err := config.DB().First(&pet, petID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pet not found"})
		return
	}

	if err := c.ShouldBindJSON(&pet); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := config.DB().Save(&pet).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update pet"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Pet updated successfully", "pet": pet})
}

// DeletePet - ลบข้อมูลสัตว์เลี้ยง
func DeletePet(c *gin.Context) {
	petID := c.Param("id")
	var pet entity.Pet

	if err := config.DB().First(&pet, petID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pet not found"})
		return
	}

	if err := config.DB().Delete(&pet).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete pet"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Pet deleted successfully"})
}
