package bookingstore

import (
	"net/http"
	"strconv"
	"time"

	// "gorm.io/gorm"
	"github.com/mpaman/petshop/config"
	"github.com/mpaman/petshop/entity"

	// "fmt"
	"github.com/gin-gonic/gin"
)

func GetAllBookingstores(c *gin.Context) {
	var bookings []entity.Bookingstore

	if err := config.DB().
		Preload("BookerUser").
		Preload("Store").
		Preload("Service").
		Preload("Pets").
		Find(&bookings).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":   200,
		"message":  "Booking list retrieved successfully",
		"bookings": bookings,
	})
}


func GetBookingstoreByStoreID(c *gin.Context) {
	storeID := c.Param("storeId") 
	var bookings []entity.Bookingstore

	storeIDInt, err := strconv.Atoi(storeID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid store ID"})
		return
	}

	if err := config.DB().
		Preload("BookerUser").
		Preload("Store").
		Preload("Service").
		Preload("Pets"). 
		Where("store_id = ?", storeIDInt).
		Find(&bookings).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "No bookings found for this store"})
		return
	}

	// Return the list of bookings
	c.JSON(http.StatusOK, gin.H{
		"status":   200,
		"message":  "Bookings retrieved successfully",
		"bookings": bookings,
	})
}


// อัปเดตสถานะการจอง
func UpdateBookingstore(c *gin.Context) {
	id := c.Param("id")
	var booking entity.Bookingstore

	if err := config.DB().First(&booking, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Booking not found"})
		return
	}

	var payload struct {
		Status string `json:"status"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	validStatuses := map[string]bool{"pending": true, "confirmed": true, "cancelled": true, "completed": true}
	if payload.Status != "" && !validStatuses[payload.Status] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid status"})
		return
	}

	if payload.Status != "" {
		booking.Status = payload.Status
	}

	booking.UpdatedAt = time.Now()

	if err := config.DB().Save(&booking).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  200,
		"message": "Booking updated successfully",
		"booking": booking,
	})
}

func DeleteBookingstore(c *gin.Context) {
	bookingID := c.Param("id")

	// Check if Bookingstore exists
	var bookingstore entity.Bookingstore
	if err := config.DB().Where("id = ?", bookingID).First(&bookingstore).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Bookingstore not found"})
		return
	}

	// Delete associated BookingPets
	if err := config.DB().Where("booking_id = ?", bookingID).Delete(&entity.BookingPets{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete associated BookingPets"})
		return
	}

	// Delete the Bookingstore
	if err := config.DB().Delete(&bookingstore).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete Bookingstore"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":      200,
		"message":     "Bookingstore and associated BookingPets deleted successfully",
		"booking_id":  bookingID,
	})
}

