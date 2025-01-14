package bookingpets

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/mpaman/petshop/config"
	"github.com/mpaman/petshop/entity"
)

type addBookingPets struct {
	BookingID uint `json:"booking_id" binding:"required"`
	PetID     uint `json:"pet_id" binding:"required"`
}

func CreateBookingPets(c *gin.Context) {
	var payload addBookingPets
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var booking entity.Bookingstore
	if err := config.DB().First(&booking, payload.BookingID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "BookingID not found"})
		return
	}

	var pet entity.Pet
	if err := config.DB().First(&pet, payload.PetID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "PetID not found"})
		return
	}

	bookingpets := entity.BookingPets{
		BookingID: payload.BookingID,
		PetID:     payload.PetID,
	}
	if err := config.DB().Create(&bookingpets).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"status":     201,
		"message":    "BookingPets created successfully",
		"booking_id": bookingpets.BookingID,
		"pet_id":     bookingpets.PetID,
	})
}
