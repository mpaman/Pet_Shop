package service

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/mpaman/petshop/config"
	"github.com/mpaman/petshop/entity"
)

type (
	addService struct {
		StoreID       uint    `json:"store_id"`
		NameService   string  `json:"name_service"`
		Duration      int     `json:"duration"`
		Price         float32 `json:"price"`
		CategoryPetID uint    `json:"categorypet_id"`
	}
)

func CreateService(c *gin.Context) {
	var payload addService

	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if payload.StoreID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Store ID is required"})
		return
	}

	var store entity.Store
	if err := config.DB().First(&store, payload.StoreID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Store not found"})
		return
	}

	service := entity.Service{
		StoreID:       payload.StoreID,
		NameService:   payload.NameService,
		Duration:      payload.Duration,
		Price:         payload.Price,
		CategoryPetID: payload.CategoryPetID,
	}

	if err := config.DB().Create(&service).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"status":  201,
		"message": "Service added successfully",
		"service": service,
	})
}
