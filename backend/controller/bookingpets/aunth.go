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

	// Check if BookingID exists
	var booking entity.Bookingstore
	if err := config.DB().First(&booking, payload.BookingID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "BookingID not found"})
		return
	}

	// Check if PetID exists
	var pet entity.Pet
	if err := config.DB().First(&pet, payload.PetID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "PetID not found"})
		return
	}

	// Check for duplicate entry
	// var existingBookingPets entity.BookingPets
	// if err := config.DB().
	// 	Where("booking_id = ? AND pet_id = ?", payload.BookingID, payload.PetID).
	// 	First(&existingBookingPets).Error; err == nil {
	// 	c.JSON(http.StatusConflict, gin.H{"error": "This pet is already associated with the booking"})
	// 	return
	// }

	// Create the BookingPets record
	bookingpets := entity.BookingPets{
		BookingID: payload.BookingID,
		PetID:     payload.PetID,
	}
	if err := config.DB().Create(&bookingpets).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Return success response
	c.JSON(http.StatusCreated, gin.H{
		"status":     201,
		"message":    "BookingPets created successfully",
		"booking_id": bookingpets.BookingID,
		"pet_id":     bookingpets.PetID,
	})
}
