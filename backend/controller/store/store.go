package store

import (
	"net/http"
	// "strconv"

	"github.com/gin-gonic/gin"
	"github.com/mpaman/petshop/config"
	"github.com/mpaman/petshop/entity"
)


func GetStoreByID(c *gin.Context) {
    storeID := c.Param("id")
    var store entity.Store

    if err := config.DB().Preload("User").First(&store, storeID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Store not found"})
        return
    }

    c.JSON(http.StatusOK, store)
}


func GetAllStores(c *gin.Context) {
	var stores []entity.Store
	db := config.DB()
	if err := db.Preload("User").Find(&stores).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve stores"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": stores})
}

// UpdateStore: อัพเดตร้านตาม ID
func UpdateStore(c *gin.Context) {
	storeID := c.Param("id")
	var payload entity.Store

	// Bind JSON payload to the struct
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	// Find the store by ID
	var store entity.Store
	db := config.DB()
	if err := db.First(&store, storeID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Store not found"})
		return
	}

	// Update store fields
	store.Name = payload.Name
	store.Location = payload.Location
	store.ContactInfo = payload.ContactInfo
	store.Description = payload.Description
	store.TimeOpen = payload.TimeOpen
	store.Status = payload.Status

	// Save the updated store
	if err := db.Save(&store).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update store"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Store updated successfully", "store": store})
}

// DeleteStore: ลบร้านตาม ID
func DeleteStore(c *gin.Context) {
	id := c.Param("id")

	db := config.DB()
	if err := db.Delete(&entity.Store{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete store"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Store deleted successfully"})
}
