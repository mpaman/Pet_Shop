package pet

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/mpaman/petshop/config"
	"github.com/mpaman/petshop/entity"
)

type addBookingstore struct {
	BookingID   uint    `json:"booking_id" binding:"required"` // เชื่อมกับการจอง
	OwnerID     uint    `json:"owner_id" binding:"required"`   // เจ้าของสัตว์
	Name        string  `json:"name"`                          // ชื่อสัตว์เลี้ยง
	Type        string  `json:"type"`                          // ประเภท เช่น สุนัข, แมว
	Breed       string  `json:"breed"`                         // สายพันธุ์
	Age         int     `json:"age"`                           // อายุ (เป็นปี)
	Gender      string  `json:"gender"`                        // เพศ เช่น ชาย/หญิง
	Weight      float64 `json:"weight"`                        // น้ำหนัก (กิโลกรัม)
	Color       string  `json:"color"`                         // สีของสัตว์
	HealthInfo  string  ` json:"health_info"`                  // ข้อมูลสุขภาพ เช่น โรคประจำตัว, การแพ้ยา
	Vaccinated  bool    `json:"vaccinated"`                    // สถานะการฉีดวัคซีน
	Picture_pet string  `gorm:"type:longtext" json:"picture_pet"`
}
func CreatePet(c *gin.Context) {
	var payload entity.Pet

	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := config.DB().Create(&payload).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Pet created successfully", "pet": payload})
}

// func CreatePet(c *gin.Context) {
// 	var payload addBookingstore

// 	if err := c.ShouldBindJSON(&payload); err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
// 		return
// 	}

// 	var user entity.Users
// 	if err := config.DB().First(&user, payload.OwnerID).Error; err != nil {
// 		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
// 		return
// 	}

// 	var booking entity.Bookingstore
// 	if err := config.DB().First(&booking, payload.BookingID).Error; err != nil {
// 		c.JSON(http.StatusNotFound, gin.H{"error": "Booking not found"})
// 		return
// 	}

// 	pet := entity.Pet{
// 		BookingID:  payload.BookingID,
// 		Name:       payload.Name,
// 		Type:       payload.Type,
// 		Breed:      payload.Breed,
// 		Age:        payload.Age,
// 		Gender:     payload.Gender,
// 		Weight:     payload.Weight,
// 		Color:      payload.Color,
// 		HealthInfo: payload.HealthInfo,
// 		Vaccinated: payload.Vaccinated,
// 		OwnerID:    payload.OwnerID,
// 	}

// 	// Save the booking to the database
// 	if err := config.DB().Create(&pet).Error; err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
// 		return
// 	}

// 	// Return success message
// 	c.JSON(http.StatusCreated, gin.H{
// 		"status":  201,
// 		"message": "pet created successfully",
// 		"booking": pet,
// 	})
// }
