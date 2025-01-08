package pettype

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/mpaman/petshop/config"
	"github.com/mpaman/petshop/entity"
)
func GetAllPettype(c *gin.Context) {
	var Pettype []entity.Pettype

	// Query all roles from the database
	if err := config.DB().Find(&Pettype).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch Pettype"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"Pettype": Pettype})
}