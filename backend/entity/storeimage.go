package entity

import (
	"gorm.io/gorm"
)

type StoreImage struct {
	gorm.Model

	ImageURL string `gorm:"type:longtext" json:"image_url" valid:"required~Image URL is required,url~Invalid URL format"`
	StoreID  uint   `json:"store_id" valid:"required~Store ID is required"`
	Store    Store  `gorm:"foreignKey:StoreID;references:ID" json:"store"`
}

