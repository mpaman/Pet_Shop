package petstoreapplication

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/mpaman/petshop/config"
	"github.com/mpaman/petshop/entity"
)

func UpdatePetStoreApplicationStatus(c *gin.Context) {
	applicationID := c.Param("id")
	var payload struct {
		Status string `json:"status"` // รับสถานะใหม่
	}

	// Bind JSON payload to the struct
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	// Find the application by ID
	var application entity.PetStoreApplication
	db := config.DB()
	if err := db.First(&application, applicationID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Application not found"})
		return
	}

	// ตรวจสอบสถานะที่รองรับ
	validStatuses := map[string]bool{"pending": true, "approved": true, "rejected": true}
	if !validStatuses[payload.Status] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid status value"})
		return
	}

	// Update the application's status
	application.Status = payload.Status

	// หากสถานะเป็น "approved" อัปเดตบทบาทของ User เป็น Store
	if payload.Status == "approved" {
		var user entity.Users
		if err := db.First(&user, application.UserID).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "User not found for the application"})
			return
		}
		user.RoleID = 3
		if err := db.Save(&user).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user role"})
			return
		}
	}

	if err := db.Save(&application).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update application status"})
		return
	}

	// หากสถานะเป็น "rejected" และต้องการลบคำขอออกจากฐานข้อมูล
	if payload.Status == "rejected" {
		if err := db.Delete(&application).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete rejected application"})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"message": "Application rejected and deleted successfully",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     "Application status updated successfully",
		"application": application,
	})
}

// DeletePetStoreApplication ลบคำขอสมัครร้านค้า
func DeletePetStoreApplication(c *gin.Context) {
	applicationID := c.Param("id") // รับ ID จาก URL
	var application entity.PetStoreApplication

	if err := config.DB().First(&application, applicationID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Application not found"})
		return
	}

	// ตรวจสอบสถานะคำขอว่าต้องเป็น "rejected" เท่านั้น
	if application.Status != "rejected" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Only rejected applications can be deleted"})
		return
	}

	if err := config.DB().Delete(&application).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  200,
		"message": "Application deleted successfully",
	})
}

func GetAllApplications(c *gin.Context) {
	var applications []entity.PetStoreApplication

	if err := config.DB().Preload("User").Find(&applications).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch applications"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":       200,
		"message":      "Applications retrieved successfully",
		"applications": applications,
	})
}
func GetApplicationByID(c *gin.Context) {
	applicationID := c.Param("id")
	var application entity.PetStoreApplication

	if err := config.DB().Preload("User").First(&application, applicationID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Application not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":      200,
		"message":     "Application retrieved successfully",
		"application": application,
	})
}
