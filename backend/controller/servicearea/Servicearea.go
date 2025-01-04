package servicearea

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/mpaman/petshop/config"
	"github.com/mpaman/petshop/entity"

)

// Function to get all service areas
func GetAll(c *gin.Context) {

	var servicearea []entity.Servicearea

	db := config.DB()

	results := db.Find(&servicearea)

	if results.Error != nil {

		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})

		return

	}

	c.JSON(http.StatusOK, servicearea)

}
