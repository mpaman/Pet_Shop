package store

import (
	"net/http"
	"github.com/gin-gonic/gin"
	"github.com/mpaman/petshop/config"
	"github.com/mpaman/petshop/entity"
)

type StorePayload struct {
	Name         string  `json:"name"`
	ContactInfo  string  `json:"contact_info"`
	ProfileImage string  `json:"profile_image"`
	Latitude     float64 `json:"latitude"`
	Longitude    float64 `json:"longitude"`
	District     string  `json:"district"`
	ProvinceID   uint    `json:"province_id"`
	Description  string  `json:"description"`
	TimeOpen     string  `json:"time_open"`
	TimeClose    string  `json:"time_close"`
	Status       string  `json:"status"`
}

func CreateStore(c *gin.Context) {
	var payload StorePayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	db := config.DB()
	email, exists := c.Get("userEmail")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var user entity.Users
	if err := db.Where("email = ?", email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Failed to authenticate user"})
		return
	}

	store := entity.Store{
		UserID:       user.ID,
		Name:         payload.Name,
		ProfileImage: payload.ProfileImage,
		Latitude:     payload.Latitude,
		Longitude:    payload.Longitude,
		District:     payload.District,
		ProvinceID:   payload.ProvinceID,
		ContactInfo:  payload.ContactInfo,
		Description:  payload.Description,
		TimeOpen:     payload.TimeOpen,
		TimeClose:    payload.TimeClose,
		Status:       payload.Status,
	}

	if err := db.Create(&store).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create store"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":  "Store created successfully",
		"store_id": store.ID,
		"store":    store,
	})
}
