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

	// Bind JSON payload to the Store struct
	if err := c.ShouldBindJSON(&store); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	db := config.DB()

	// Retrieve the email from the context for authentication
	email, exists := c.Get("userEmail")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Find the user by email
	var user entity.Users
	if err := db.Where("email = ?", email).First(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to find user"})
		return
	}

	// Set the UserID of the store to the authenticated user
	store.UserID = user.ID

	// Save the new Store to the database
	if err := db.Create(&store).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to create store"})
		return
	}

	// Respond with the created store data including its ID
	c.JSON(http.StatusCreated, gin.H{
		"message":  "Store created successfully",
		"store_id": store.ID, // Explicitly return the store ID
		"store":    store,    // Return the entire store object if needed
	})
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
    db := config.DB()
    results := db.Preload("User").Find(&stores)
    if results.Error != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
        return
    }
    c.JSON(http.StatusOK, gin.H{"data": stores})
}

func UpdateStore(c *gin.Context) {
	storeID := c.Param("id")
	var payload entity.Store

	// Bind JSON payload to the struct
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// ค้นหาร้านจาก ID
	var store entity.Store
	if err := config.DB().First(&store, storeID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Store not found"})
		return
	}

	// อัพเดตข้อมูลร้าน
	store.Name = payload.Name
	store.Location = payload.Location
	store.ContactInfo = payload.ContactInfo
	store.Description = payload.Description
	store.TimeOpen = payload.TimeOpen
	store.Status = payload.Status

	// บันทึกข้อมูลที่อัพเดต
	if err := config.DB().Save(&store).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update store"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Store updated successfully", "store": store})
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
