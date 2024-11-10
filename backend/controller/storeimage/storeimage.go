package storeimage

import (
	"net/http"
	"github.com/mpaman/petshop/config"
	"github.com/mpaman/petshop/entity"
	"github.com/gin-gonic/gin"
)

// GetStoreImages: ดึงรูปภาพทั้งหมดของร้านตาม Store ID
func GetStoreImages(c *gin.Context) {
	storeID := c.Param("store_id")
	var images []entity.StoreImage

	if err := config.DB().Where("store_id = ?", storeID).Find(&images).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve images"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": images})
}

// CreateStoreImage: เพิ่มรูปภาพให้ร้าน
func CreateStoreImage(c *gin.Context) {
	var image entity.StoreImage

	// Bind JSON payload to Storeimage struct
	if err := c.ShouldBindJSON(&image); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// ตรวจสอบว่า Store มีอยู่จริงหรือไม่
	var store entity.Store
	if err := config.DB().First(&store, image.StoreID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Store not found"})
		return
	}

	// เพิ่มรูปภาพในฐานข้อมูล
	if err := config.DB().Create(&image).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add image"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Image added successfully", "image": image})
}
