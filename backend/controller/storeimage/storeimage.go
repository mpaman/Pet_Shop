package storeimage

import (
	"net/http"
	"github.com/mpaman/petshop/config"
	"github.com/mpaman/petshop/entity"
	"github.com/gin-gonic/gin"
)

func GetStoreImages(c *gin.Context) {
    storeId := c.Param("storeId")
    var images []entity.StoreImage

    // ดึงข้อมูล StoreImage ที่เกี่ยวข้องกับ storeId ที่เลือก
    if err := config.DB().Preload("Store").Where("store_id = ?", storeId).Find(&images).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve images"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"data": images})
}

func GetAll(c *gin.Context) {
    var images []entity.StoreImage

    if err := config.DB().Preload("Store").Find(&images).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve images"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"data": images})
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

func Delete(c *gin.Context) {
	id := c.Param("id")

	db := config.DB()
	if err := db.Delete(&entity.StoreImage{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete StoreImage"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "StoreImage deleted successfully"})
}
