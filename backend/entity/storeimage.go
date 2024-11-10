package entity

import (
	"gorm.io/gorm"
)

type StoreImage struct {
	gorm.Model

	ImageURL string `json:"image_url"`
	StoreID  uint   `json:"store_id"`
	Store    Store  `gorm:"foreignKey:StoreID;references:ID" json:"store"`
}
