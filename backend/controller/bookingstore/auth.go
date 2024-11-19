package bookingstore

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/mpaman/petshop/config"
	"github.com/mpaman/petshop/entity"
)

type addBookingstore struct {
	BookerUserID uint      `json:"booker_user_id" binding:"required"`
	StoreID      uint      `json:"store_id" binding:"required"`
	ServiceID    uint      `json:"service_id" binding:"required"`
	BookingTime  time.Time `json:"booking_time" binding:"required"`
	Notes        string    `json:"notes"`
	Date         time.Time `json:"date" binding:"required"`
}

// CreateBookingstore handles the creation of a new booking
func CreateBookingstore(c *gin.Context) {
	var payload addBookingstore

	// Bind JSON payload to the struct
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate booking time
	if payload.BookingTime.Before(time.Now()) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Booking time cannot be in the past"})
		return
	}

	// Check if BookerUser exists
	var user entity.Users
	if err := config.DB().First(&user, payload.BookerUserID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Booker user not found"})
		return
	}

	// Check if Store exists
	var store entity.Store
	if err := config.DB().First(&store, payload.StoreID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Store not found"})
		return
	}

	// Check if Service exists
	var service entity.Service
	if err := config.DB().First(&service, payload.ServiceID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Service not found"})
		return
	}

	// Create the booking
	bookingstore := entity.Bookingstore{
		BookerUserID: payload.BookerUserID,
		StoreID:      payload.StoreID,
		ServiceID:    payload.ServiceID,
		BookingTime:  payload.BookingTime,
		Status:       "pending", // Default status
		Notes:        payload.Notes,
		Date:         payload.Date,
	}

	// Save the booking to the database
	if err := config.DB().Create(&bookingstore).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Return success message
	c.JSON(http.StatusCreated, gin.H{
		"status":  201,
		"message": "Booking created successfully",
		"booking": bookingstore,
	})
}
