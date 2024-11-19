package storeimage

import (
	"net/http"
	"github.com/mpaman/petshop/config"
	"github.com/mpaman/petshop/entity"
	"github.com/gin-gonic/gin"
)
type StoreImage struct {
	ImageURL string `gorm:"type:longtext" json:"image_url"` 
	StoreID  uint   `json:"store_id"`                      
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