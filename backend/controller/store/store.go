package store

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/mpaman/petshop/config"
	"github.com/mpaman/petshop/entity"
)

func GetStoreByID(c *gin.Context) {
	storeID := c.Param("id")
	var store entity.Store

	if err := config.DB().
		Preload("User").
		Preload("Province").
		Preload("Services").
		First(&store, storeID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Store not found"})
		return
	}

	c.JSON(http.StatusOK, store)
}

func GetAllStores(c *gin.Context) {
	var stores []entity.Store
	db := config.DB()
	if err := db.
		Preload("User").
		Preload("Province").
		Preload("Services").
		Find(&stores).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve stores"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": stores})
}

func UpdateStore(c *gin.Context) {
	storeID := c.Param("id")
	var payload StorePayload

	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	var store entity.Store
	db := config.DB()
	if err := db.First(&store, storeID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Store not found"})
		return
	}

	store.Name = payload.Name
	store.ProfileImage = payload.ProfileImage
	store.Longitude = payload.Longitude
	store.Latitude = payload.Latitude
	store.District = payload.District
	store.ProvinceID = payload.ProvinceID
	store.ContactInfo = payload.ContactInfo
	store.Description = payload.Description
	store.TimeOpen = payload.TimeOpen
	store.TimeClose = payload.TimeClose
	store.Status = payload.Status

	if err := db.Save(&store).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update store"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Store updated successfully", "store": store})
}

func DeleteStore(c *gin.Context) {
	id := c.Param("id")
	db := config.DB()
	tx := db.Begin()

	if err := tx.Where("store_id = ?", id).Delete(&entity.Bookingstore{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete related bookingstore data"})
		return
	}

	if err := tx.Where("store_id = ?", id).Delete(&entity.Service{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete related service data"})
		return
	}

	if err := tx.Where("store_id = ?", id).Delete(&entity.StoreImage{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete related store images"})
		return
	}

	if err := tx.Delete(&entity.Store{}, id).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete store"})
		return
	}

	tx.Commit()
	c.JSON(http.StatusOK, gin.H{"message": "Store and related data deleted successfully"})
}

func UpdateStoreStatus(c *gin.Context) {
	storeID := c.Param("id")
	var payload struct {
		Status string `json:"status"`
	}

	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	var store entity.Store
	db := config.DB()
	if err := db.First(&store, storeID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Store not found"})
		return
	}

	store.Status = payload.Status

	if err := db.Save(&store).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update store status"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Store status updated successfully", "store": store})
}
