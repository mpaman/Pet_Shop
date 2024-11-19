package bookingstore

import (
	"net/http"
	// "gorm.io/gorm"
	"github.com/mpaman/petshop/config"
	"github.com/mpaman/petshop/entity"
	// "fmt"
	"github.com/gin-gonic/gin"
)


func GetAllBookingstores(c *gin.Context) {
	var bookings []entity.Bookingstore

	// Retrieve all bookings from the database
	if err := config.DB().Preload("BookerUser").Preload("Store").Preload("Service").Find(&bookings).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Return the list of bookings
	c.JSON(http.StatusOK, gin.H{
		"status":   200,
		"message":  "Booking list retrieved successfully",
		"bookings": bookings,
	})
}

// GetBookingstoreByID retrieves a booking by its ID
func GetBookingstoreByID(c *gin.Context) {
	id := c.Param("id")
	var booking entity.Bookingstore

	// Find the booking by ID
	if err := config.DB().Preload("BookerUser").Preload("Store").Preload("Service").First(&booking, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Booking not found"})
		return
	}

	// Return the booking
	c.JSON(http.StatusOK, gin.H{
		"status":  200,
		"message": "Booking retrieved successfully",
		"booking": booking,
	})
}

// UpdateBookingstore updates the status or notes of a booking
func UpdateBookingstore(c *gin.Context) {
	id := c.Param("id")
	var booking entity.Bookingstore

	// Find the booking by ID
	if err := config.DB().First(&booking, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Booking not found"})
		return
	}

	// Bind updated data to the booking
	if err := c.ShouldBindJSON(&booking); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Save the updated booking
	if err := config.DB().Save(&booking).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Return the updated booking
	c.JSON(http.StatusOK, gin.H{
		"status":  200,
		"message": "Booking updated successfully",
		"booking": booking,
	})
}

// DeleteBookingstore deletes a booking by ID
func DeleteBookingstore(c *gin.Context) {
	id := c.Param("id")
	var booking entity.Bookingstore

	// Find the booking by ID
	if err := config.DB().First(&booking, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Booking not found"})
		return
	}

	// Delete the booking
	if err := config.DB().Delete(&booking).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Return success message
	c.JSON(http.StatusOK, gin.H{
		"status":  200,
		"message": "Booking deleted successfully",
	})
}
