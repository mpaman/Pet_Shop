package entity

import (
	"gorm.io/gorm"
)

type Service struct {
	gorm.Model

	StoreID     uint   `json:"store_id"`
	Store       Store  `gorm:"foreignKey:StoreID;references:ID" json:"store"`
	NameService string `json:"name_service"` // ชื่อของบริการ
	Duration    int    `json:"duration"`
	Price       string `json:"price"`
}
