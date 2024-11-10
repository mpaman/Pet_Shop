package store

import (
	"net/http"
	"github.com/mpaman/petshop/config"
	"github.com/mpaman/petshop/entity"
	"github.com/gin-gonic/gin"
)

// CreateStore: สร้างร้านใหม่
func CreateStore(c *gin.Context) {
	var store entity.Store

	// Bind the JSON payload to the Store struct
	if err := c.ShouldBindJSON(&store); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := config.DB()

	// Retrieve the email from the context
	email, exists := c.Get("userEmail")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Find the user ID by email
	var user entity.Users
	if err := db.Where("email = ?", email).First(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to find user"})
		return
	}

	store.UserID = user.ID

	// Save the new Store to the database
	if err := db.Create(&store).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Store created successfully", "store": store})
}

// GetStoreByID: ดึงข้อมูลร้านตาม ID
func GetStoreByID(c *gin.Context) {
	id := c.Param("id")
	var store entity.Store
	if err := config.DB().Preload("User").First(&store, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Store not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": store})
}

// GetAllStores: ดึงข้อมูลร้านทั้งหมด
func GetAllStores(c *gin.Context) {
	var stores []entity.Store
	if err := config.DB().Preload("User").Find(&stores).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": stores})
}

// UpdateStore: อัปเดตร้านตาม ID
func UpdateStore(c *gin.Context) {
	id := c.Param("id")
	var store entity.Store
	if err := config.DB().First(&store, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Store not found"})
		return
	}

	if err := c.ShouldBindJSON(&store); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := config.DB().Save(&store).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Store updated successfully", "data": store})
}

// DeleteStore: ลบร้านตาม ID
func DeleteStore(c *gin.Context) {
	id := c.Param("id")
	if err := config.DB().Delete(&entity.Store{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Store deleted successfully"})
}
