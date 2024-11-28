package users

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/mpaman/petshop/config"

	"github.com/mpaman/petshop/entity"
)

func GetAll(c *gin.Context) {

	var users []entity.Users

	db := config.DB()

	results := db.Preload("Gender").Find(&users)

	if results.Error != nil {

		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})

		return

	}

	c.JSON(http.StatusOK, users)

}

func Get(c *gin.Context) {

	ID := c.Param("id")

	var user entity.Users

	db := config.DB()

	results := db.Preload("Gender").First(&user, ID)

	if results.Error != nil {

		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})

		return

	}

	if user.ID == 0 {

		c.JSON(http.StatusNoContent, gin.H{})

		return

	}

	c.JSON(http.StatusOK, user)

}

func Update(c *gin.Context) {
    var user entity.Users
    UserID := c.Param("id")

    db := config.DB()
    if err := db.First(&user, UserID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "id not found"})
        return
    }

    // ตรวจสอบว่าเป็น multipart form หรือ JSON
    contentType := c.ContentType()
    if contentType == "multipart/form-data" {
        file, err := c.FormFile("Profile")
        if err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Profile picture upload failed"})
            return
        }

        // เก็บไฟล์ในโฟลเดอร์
        filePath := fmt.Sprintf("uploads/profiles/%s", file.Filename)
        if err := c.SaveUploadedFile(file, filePath); err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save profile picture"})
            return
        }

        // อัปเดตเส้นทางของรูปภาพในฐานข้อมูล
        user.Profile = filePath
    } else {
        // แก้ไขข้อมูลผู้ใช้ (JSON)
        if err := c.ShouldBindJSON(&user); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request, unable to map payload"})
            return
        }
    }

    if err := db.Save(&user).Error; err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to update user"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "Updated successfully", "profile": user.Profile})
}


func Delete(c *gin.Context) {

	id := c.Param("id")

	db := config.DB()

	if tx := db.Exec("DELETE FROM users WHERE id = ?", id); tx.RowsAffected == 0 {

		c.JSON(http.StatusBadRequest, gin.H{"error": "id not found"})

		return

	}

	c.JSON(http.StatusOK, gin.H{"message": "Deleted successful"})

}

//ADD
func GetUserProfile(c *gin.Context) {
	// Extract user email from the context
	email, exists := c.Get("userEmail")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User email not found in context"})
		return
	}

	var user entity.Users
	db := config.DB()//ฟังก์ชันจะเชื่อมต่อกับฐานข้อมูลผ่านคำสั่ง config.DB() แล้วทำการค้นหาข้อมูลในตาราง Users โดยใช้เงื่อนไขค้นหาจากอีเมลของผู้ใช้ที่ดึงได้จาก context

	// Fetch user details from the database
	result := db.Where("email = ?", email).First(&user)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": result.Error.Error()})
		return
	}
	//ฟังก์ชันจะใช้คำสั่ง db.Preload("Gender").Where("email = ?", email).First(&user) 
	//เพื่อค้นหาข้อมูลผู้ใช้ในตาราง Users โดยใช้เงื่อนไขค้นหาจาก อีเมล ที่ดึงได้จาก context และ preload ความสัมพันธ์กับตาราง Gender เพื่อดึงข้อมูลเพศของผู้ใช้มาด้วย

	// Return user profile details
	c.JSON(http.StatusOK, gin.H{
		"ID":        user.ID,
		"Profile":   user.Profile,
		"FirstName": user.FirstName,
		"LastName":  user.LastName,
		"Role":  user.Role,
	})
}

// Mock function to extract user ID from the token
func extractUserIDFromToken(token string) (uint, error) {
	// Implement your token parsing and validation logic here
	// This is a placeholder function
	return 1, nil // Replace with actual implementation
}//เป็นฟังก์ชันใน Go ที่ใช้สำหรับการดึง UserID จาก JWT (JSON Web Token) ที่ได้รับจาก client