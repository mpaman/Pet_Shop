package storeimage

import (
	"net/http"
	"github.com/mpaman/petshop/config"
	"github.com/mpaman/petshop/entity"
	"github.com/gin-gonic/gin"
)

// GetStoreImages: ดึงรูปภาพทั้งหมดของร้านตาม Store ID
// GetStoreImagesByStoreID: ดึงรูปภาพทั้งหมดของร้านตาม Store ID
func GetStoreImagesByStoreID(c *gin.Context) {
	storeID := c.Param("store_id")
	var images []entity.StoreImage

	// คิวรีเพื่อดึงรูปภาพทั้งหมดของร้านที่มี store_id ตรงกับ storeID
	if err := config.DB().Where("store_id = ?", storeID).Find(&images).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve store images"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": images})
}


func CreateStoreImage(c *gin.Context) {
    var storeImage entity.StoreImage
    if err := c.ShouldBindJSON(&storeImage); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
        return
    }

    var store entity.Store
    if err := config.DB().First(&store, storeImage.StoreID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Store not found"})
        return
    }

    // บันทึก StoreImage ลงในฐานข้อมูล
    if err := config.DB().Create(&storeImage).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add store image"})
        return
    }

    c.JSON(http.StatusCreated, gin.H{"message": "Store image added successfully", "storeImage": storeImage})
}

func UpdateStoreImage(c *gin.Context) {
	imageID := c.Param("id")
	var payload entity.StoreImage

	// Bind JSON payload to the struct
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// ค้นหารูปภาพจาก ID
	var image entity.StoreImage
	if err := config.DB().First(&image, imageID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Image not found"})
		return
	}

	// อัพเดตรูปภาพ
	image.ImageURL = payload.ImageURL
	image.StoreID = payload.StoreID

	// บันทึกข้อมูลที่อัพเดต
	if err := config.DB().Save(&image).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update image"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Image updated successfully", "image": image})
}
