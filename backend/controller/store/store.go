package store

import (
	"net/http"
	// "strconv"

	"github.com/gin-gonic/gin"
	"github.com/mpaman/petshop/config"
	"github.com/mpaman/petshop/entity"
)

type StorePayload struct {
    Name        string `json:"name"`
    Location    string `json:"location"`
    ContactInfo string `json:"contact_info"`
    Description string `json:"description"`
    TimeOpen    string `json:"time_open"`
    Status      string `json:"status"`
}

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
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Failed to authenticate user"})
		return
	}

	// Set the UserID of the store to the authenticated user
	store.UserID = user.ID

	// Save the new Store to the database
	if err := db.Create(&store).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create store"})
		return
	}

	// Respond with the created store data including its ID
	c.JSON(http.StatusCreated, gin.H{
		"message":  "Store created successfully",
		"store_id": store.ID,
		"store":    store,
	})
}

func GetStoreByID(c *gin.Context) {
    storeID := c.Param("id")
    var store entity.Store

    // preload services และ store images
    if err := config.DB().Preload("User").First(&store, storeID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Store not found"})
        return
    }

    c.JSON(http.StatusOK, store)
}

// func GetStoreByID(c *gin.Context) {
// 	// รับ store ID จาก URL
// 	storeID := c.Param("id")
// 	var store entity.Store

// 	// ดึงข้อมูล store พร้อมกับ User, Service, และ StoreImage
// 	if err := config.DB().Preload("User").First(&store,storeID).Error; err != nil {
// 		c.JSON(http.StatusNotFound, gin.H{"error": "Store not found"})
// 		return
// 	}


// 	c.JSON(http.StatusOK, store)
// }

// GetAllStores: ดึงข้อมูลร้านทั้งหมด
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
