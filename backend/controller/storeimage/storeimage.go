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

func CreateStoreImage(c *gin.Context) {
    var storeImage entity.StoreImage
    if err := c.ShouldBindJSON(&storeImage); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
        return
    }

    // ตรวจสอบว่า StoreID และ ImageURL ถูกต้อง
    // if storeImage.StoreID == 0 || storeImage.ImageURL == "" {
    //     c.JSON(http.StatusBadRequest, gin.H{"error": "Store ID and Image URL are required"})
    //     return
    // }
	//ติด ตรง url ไม่ถูก

    // ค้นหา store จาก StoreID
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
