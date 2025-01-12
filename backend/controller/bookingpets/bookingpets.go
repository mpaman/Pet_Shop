package bookingpets

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/mpaman/petshop/config"
	"github.com/mpaman/petshop/entity"
)

func ListAllBookingPets(c *gin.Context) {
	var bookingPets []entity.BookingPets

	if err := config.DB().
		Preload("Pet").
		Preload("Booking").
		Find(&bookingPets).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": 200,
		"data":   bookingPets,
	})
}
func GetPetsByBookingID(c *gin.Context) {
	bookingID := c.Param("booking_id")

	// Validate BookingID exists
	var booking entity.Bookingstore
	if err := config.DB().First(&booking, bookingID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "BookingID not found"})
		return
	}

	// Retrieve Pets for the given BookingID
	var bookingPets []entity.BookingPets
	if err := config.DB().
		Preload("Pet"). // Preload associated Pet details
		Where("booking_id = ?", bookingID).
		Find(&bookingPets).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":     200,
		"booking_id": bookingID,
		"pets":       bookingPets,
		"total_pets": len(bookingPets),
	})
}

type updateBookingPets struct {
	PetID uint `json:"pet_id" binding:"required"`
}

func UpdateBookingPet(c *gin.Context) {
	bookingID := c.Param("booking_id")
	petID := c.Param("pet_id")

	var payload updateBookingPets
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Find existing record
	var bookingPet entity.BookingPets
	if err := config.DB().
		Where("booking_id = ? AND pet_id = ?", bookingID, petID).
		First(&bookingPet).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "No record found for this BookingID and PetID"})
		return
	}

	// Update the PetID
	bookingPet.PetID = payload.PetID
	if err := config.DB().Save(&bookingPet).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":     200,
		"message":    "BookingPets updated successfully",
		"booking_id": bookingPet.BookingID,
		"pet_id":     bookingPet.PetID,
	})
}
func DeletePetFromBooking(c *gin.Context) {
	bookingID := c.Param("booking_id")
	petID := c.Param("pet_id")

	// Check if BookingPets exists
	var bookingPet entity.BookingPets
	if err := config.DB().
		Where("booking_id = ? AND pet_id = ?", bookingID, petID).
		First(&bookingPet).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "No record found for this BookingID and PetID"})
		return
	}

	// Delete the record
	if err := config.DB().Delete(&bookingPet).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":     200,
		"message":    "Pet removed from booking successfully",
		"booking_id": bookingID,
		"pet_id":     petID,
	})
}
