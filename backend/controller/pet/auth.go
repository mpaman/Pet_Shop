package pet

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/mpaman/petshop/config"
	"github.com/mpaman/petshop/entity"
)

type addpet struct {
	OwnerID     uint    `json:"owner_id" binding:"required"`   // เจ้าของสัตว์

	Name        string  `json:"name"`                          // ชื่อสัตว์เลี้ยง
	Breed       string  `json:"breed"`                         // สายพันธุ์
	Age         int     `json:"age"`                           // อายุ (เป็นปี)
	Gender      string  `json:"gender"`                        // เพศ เช่น ชาย/หญิง
	Weight      float64 `json:"weight"`                        // น้ำหนัก (กิโลกรัม)
	Vaccinated  string  `json:"vaccinated"` 

	PicturePet string  `gorm:"type:longtext" json:"picture_pet"`
}

func CreatePet(c *gin.Context) {
	var payload addpet

	// Bind JSON payload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// ตรวจสอบว่า OwnerID มีอยู่ใน Users หรือไม่
	var user entity.Users
	if err := config.DB().First(&user, payload.OwnerID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}


	// สร้าง Pet entity
	pet := entity.Pet{

		Name:       payload.Name,
		Breed:      payload.Breed,
		Age:        payload.Age,
		Gender:     payload.Gender,
		Weight:     payload.Weight,
		Vaccinated: payload.Vaccinated,

		PicturePet: payload.PicturePet,
		OwnerID:    payload.OwnerID,
	}

	// ตรวจสอบข้อผิดพลาดในการบันทึก Pet
	if err := config.DB().Create(&pet).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to create pet: %v", err)})
		return
	}

	// ส่งผลลัพธ์กลับ
	c.JSON(http.StatusCreated, gin.H{
		"status":  201,
		"message": "Pet created successfully",
		"pet":     pet,
	})
}
// func CreatePet(c *gin.Context) {
// 	var payload entity.Pet

// 	if err := c.ShouldBindJSON(&payload); err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
// 		return
// 	}

// 	if err := config.DB().Create(&payload).Error; err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
// 		return
// 	}

// 	c.JSON(http.StatusCreated, gin.H{"message": "Pet created successfully", "pet": payload})
// }

