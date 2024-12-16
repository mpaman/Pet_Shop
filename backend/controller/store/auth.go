package store

import (
	"net/http"
	// "strconv"

	"github.com/gin-gonic/gin"
	"github.com/mpaman/petshop/config"
	"github.com/mpaman/petshop/entity"
)

type StorePayload struct {
	Name         string `json:"name"`
	ContactInfo  string `json:"contact_info"`
	ProfileImage string `gorm:"type:longtext"` // URL รูปโปรไฟล์ร้านค้า
	Street       string `json:"street"`        // บ้านเลขที่ / ชื่อถนน
	SubDistrict  string `json:"sub_district"`  // ตำบล
	District     string `json:"district"`      // อำเภอ
	Province     string `json:"province"`      // จังหวัด
	Country      string `json:"country"`       // ประเทศ
	Description  string `json:"description"`
	TimeOpen     string `json:"time_open"`
	TimeClose    string `json:"time_close"`
	Status       string `json:"status"`
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
