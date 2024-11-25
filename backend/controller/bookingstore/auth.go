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
	BookingTime  string    `json:"booking_time"` // เปลี่ยนเป็น string
	Notes        string    `json:"notes"`
	Date         time.Time `json:"date" binding:"required"`
	TotalCost    int       `json:"total_cost"`
	ContactNum   string    `json:"contact_number" binding:"-"`
	CountPet     int       `json:"count_pet" binding:"required"`
}

// CreateBookingstore handles the creation of a new booking
func CreateBookingstore(c *gin.Context) {
	var payload addBookingstore

	// Bind JSON payload to the struct
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
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

	// Parse the BookingTime to a specific format (HH:mm)
	// Convert the date to a time object (you might need the time.Date() method depending on the use case)
	if payload.BookingTime != "" {
		// Assuming booking time is in "HH:mm" format
		_, err := time.Parse("15:04", payload.BookingTime)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid time format for booking_time"})
			return
		}
	}

	// Create the booking
	bookingstore := entity.Bookingstore{
		BookerUserID: payload.BookerUserID,
		StoreID:      payload.StoreID,
		ServiceID:    payload.ServiceID,
		BookingTime:  payload.BookingTime, // Use the string format
		Status:       "pending",           // Default status
		Notes:        payload.Notes,
		Date:         payload.Date,
		TotalCost:    payload.TotalCost,
		ContactNum:   payload.ContactNum,
		CountPet:     payload.CountPet,
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
