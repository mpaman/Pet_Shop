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

func GetBookingstoreByStoreID(c *gin.Context) {
	storeID := c.Param("storeId") // รับ storeId จาก URL
	var bookings []entity.Bookingstore

	// ตรวจสอบว่า storeID เป็นตัวเลขหรือไม่
	storeIDInt, err := strconv.Atoi(storeID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid store ID"})
		return
	}

	// ดึงข้อมูลการจองที่เกี่ยวข้องกับ StoreID
	if err := config.DB().
		Preload("BookerUser"). // โหลดข้อมูลผู้จอง
		Preload("Store").      // โหลดข้อมูลร้านค้า
		Preload("Service").    // โหลดข้อมูลบริการ
		Where("store_id = ?", storeIDInt). // กรองด้วย store_id
		Find(&bookings).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "No bookings found for this store"})
		return
	}

	// ส่งข้อมูลกลับ
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

	// ตรวจสอบว่ามี Booking ตาม ID หรือไม่
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

	// Validate status
	validStatuses := map[string]bool{"pending": true, "confirmed": true, "cancelled": true, "completed": true}
	if payload.Status != "" && !validStatuses[payload.Status] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid status"})
		return
	}

	// อัปเดตสถานะ
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
