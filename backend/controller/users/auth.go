package users

import (
	"errors"

	"net/http"

	"github.com/gin-gonic/gin"

	"golang.org/x/crypto/bcrypt"

	"gorm.io/gorm"

	"github.com/mpaman/petshop/config"
	"github.com/mpaman/petshop/entity"
	"github.com/mpaman/petshop/services"
)

type (
	Authen struct {
		Email string `json:"email"`

		Password string `json:"password"`
	}

	signUp struct {
		FirstName string `json:"first_name"`
		LastName  string `json:"last_name"`
		Email     string `json:"email"`
		Password  string `json:"password"`
		Age       uint8  `json:"age"`
		Role      string `json:"role"`
		Address   string `json:"address"`
		Profile   string `json:"profile"`
	}
)

func SignUp(c *gin.Context) {

	var payload signUp


	if err := c.ShouldBindJSON(&payload); err != nil {

		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})

		return

	}

	db := config.DB()

	var userCheck entity.Users

	result := db.Where("email = ?", payload.Email).First(&userCheck)

	if result.Error != nil && !errors.Is(result.Error, gorm.ErrRecordNotFound) {


		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})

		return

	}

	if userCheck.ID != 0 {


		c.JSON(http.StatusConflict, gin.H{"error": "Email is already registered"})

		return

	}



	hashedPassword, _ := config.HashPassword(payload.Password)



	user := entity.Users{
		FirstName: payload.FirstName,
		LastName:  payload.LastName,
		Email:     payload.Email,
		Age:       payload.Age,
		Password:  hashedPassword,
		Role:      payload.Role,
		Address:   payload.Address,
		Profile:   payload.Profile,
	}



	if err := db.Create(&user).Error; err != nil {

		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})

		return

	}

	c.JSON(http.StatusCreated, gin.H{"message": "Sign-up successful"})

}

func SignIn(c *gin.Context) {

		var payload Authen
	
		var user entity.Users
	
		if err := c.ShouldBindJSON(&payload); err != nil {

			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
	
			return
	
		}
	
		if err := config.DB().Raw("SELECT * FROM users WHERE email = ?", payload.Email).Scan(&user).Error; err != nil {
	
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
	
			return
	
		}
	
		err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(payload.Password))
	
		if err != nil {
	
			c.JSON(http.StatusBadRequest, gin.H{"error": "password is incerrect"})
	
			return
	
		}
	
		jwtWrapper := services.JwtWrapper{
	
			SecretKey: "SvNQpBN8y3qlVrsGAYYWoJJk56LtzFHx",
	
			Issuer: "AuthService",
	
			ExpirationHours: 24,
		}
		signedToken, err := jwtWrapper.GenerateToken(user.Email)
	
		if err != nil {
	
			c.JSON(http.StatusBadRequest, gin.H{"error": "error signing token"})
	
			return
	
		}
	
		c.JSON(http.StatusOK, gin.H{"token_type": "Bearer", "token": signedToken, "id": user.ID})
	}