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
	email, exists := c.Get("userEmail")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User email not found in context"})
		return
	}

	var user entity.Users
	db := config.DB() 
	result := db.Where("email = ?", email).First(&user)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"ID":         user.ID,
		"Profile":    user.Profile,
		"first_name": user.FirstName,
		"last_name":  user.LastName,
		"roleID":       user.RoleID,
		// "role":       user.Role,
	})
}

func extractUserIDFromToken(token string) (uint, error) {
	return 1, nil
} 
