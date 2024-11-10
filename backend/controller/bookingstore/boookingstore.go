package bookingstore

import (
	"net/http"
	// "gorm.io/gorm"
	"github.com/mpaman/petshop/config"
	"github.com/mpaman/petshop/entity"
	// "fmt"
	"github.com/gin-gonic/gin"
)


func CreateBooking(c *gin.Context) {
	var booking entity.Bookingstore
	if err := c.ShouldBindJSON(&booking); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := config.DB().Create(&booking).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Booking created successfully", "data": booking})
}
// GetBookingByID: ดึงข้อมูลการจองตาม ID
func GetBookingByID(c *gin.Context) {
	id := c.Param("id")
	var booking entity.Bookingstore
	if err := config.DB().First(&booking, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Booking not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": booking})
}

// GetAllBookings: ดึงข้อมูลการจองทั้งหมด
func GetAllBookings(c *gin.Context) {
	var bookings []entity.Bookingstore
	if err := config.DB().Find(&bookings).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": bookings})
}

// UpdateBookingStatus: อัปเดตสถานะการจอง เช่น จาก "pending" เป็น "accepted"
func UpdateBookingStatus(c *gin.Context) {
	id := c.Param("id")
	var booking entity.Bookingstore

	// ค้นหาการจองตาม ID
	if err := config.DB().First(&booking, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Booking not found"})
		return
	}

	// รับค่าของสถานะใหม่จากคำขอ
	var input struct {
		Status string `json:"status"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// อัปเดตสถานะการจอง
	booking.Status = input.Status
	if err := config.DB().Save(&booking).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Booking status updated successfully", "data": booking})
}

// DeleteBooking: ลบการจองตาม ID
func DeleteBooking(c *gin.Context) {
	id := c.Param("id")
	if err := config.DB().Delete(&entity.Bookingstore{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Booking deleted successfully"})
}
