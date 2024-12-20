package petstoreapplication

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/mpaman/petshop/config"
	"github.com/mpaman/petshop/entity"
)

// Struct สำหรับ Payload
type AddPetStoreApplication struct {
	UserID              uint   `json:"user_id"`
	Email               string `json:"email"`
	Phone               string `json:"phone"`
	Location            string `json:"location"`
	StoreName           string `json:"store_name"`
	LicenseDocumentURL  string `json:"license_document_url"`
}

// สร้างคำขอสมัครเป็นร้านค้า
func CreatePetStoreApplication(c *gin.Context) {
	var payload AddPetStoreApplication

	// Bind JSON payload to the struct
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// ตรวจสอบว่าผู้ใช้มีอยู่หรือไม่
	var user entity.Users
	if err := config.DB().First(&user, payload.UserID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// ตรวจสอบว่าผู้ใช้เคยสมัครไปแล้วหรือไม่
	var existingApplication entity.PetStoreApplication
	if err := config.DB().Where("user_id = ? AND status = ?", payload.UserID, "pending").First(&existingApplication).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Application already pending approval"})
		return
	}

	// สร้างคำขอสมัคร
	application := entity.PetStoreApplication{
		UserID:             payload.UserID,
		Email:              payload.Email,
		Phone:              payload.Phone,
		Location:           payload.Location,
		StoreName:          payload.StoreName,
		LicenseDocumentURL: payload.LicenseDocumentURL,
		Status:             "pending", // ตั้งค่าเริ่มต้นเป็น pending
	}

	// บันทึกคำขอในฐานข้อมูล
	if err := config.DB().Create(&application).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// ส่งข้อมูลกลับ
	c.JSON(http.StatusCreated, gin.H{
		"status":       201,
		"message":      "Pet store application created successfully",
		"application":  application,
	})
}
