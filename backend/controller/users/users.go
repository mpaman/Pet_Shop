package users

import (
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

	result := db.First(&user, UserID)

	if result.Error != nil {

		c.JSON(http.StatusNotFound, gin.H{"error": "id not found"})

		return

	}

	if err := c.ShouldBindJSON(&user); err != nil {

		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request, unable to map payload"})

		return

	}

	result = db.Save(&user)

	if result.Error != nil {

		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request"})

		return

	}

	c.JSON(http.StatusOK, gin.H{"message": "Updated successful"})

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