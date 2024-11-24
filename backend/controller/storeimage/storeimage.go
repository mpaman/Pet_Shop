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

func DeleteStoreImage(c *gin.Context) {
    id := c.Param("id")
    if err := config.DB().Delete(&entity.StoreImage{}, id).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete image"})
        return
    }
    c.JSON(http.StatusOK, gin.H{"message": "Image deleted successfully"})
}
