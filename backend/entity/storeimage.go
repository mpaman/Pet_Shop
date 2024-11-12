package entity

import (
	"gorm.io/gorm"
)

type StoreImage struct {
	gorm.Model

	ImageURL string `gorm:"type:longtext" json:"image_url"` // เปลี่ยนเป็น `longtext` เพื่อรองรับ URL ที่ยาว
	StoreID  uint   `json:"store_id"`                       // ชื่อ `store_id` ที่ใช้ในฐานข้อมูล
	Store    Store  `gorm:"foreignKey:StoreID;references:ID" json:"store"`
}