package entity

import (


	"gorm.io/gorm"
)

type Store struct {
	gorm.Model

	UserID       uint   `json:"user_id"`
	User         Users  `gorm:"foreignKey:UserID;references:ID" json:"user"`
	Name         string `json:"name"`
	Location     string `json:"location"`//จังหวัดของร้าน
	AddressStore string `json:"address"`//ที่ตั้งหน้าร้าน
	ContactInfo  string `json:"contact_info"`
	Description  string `json:"description"`
	TimeOpen     string `json:"time_open"`
	TimeClose    string `json:"time_close"`
	Status       string `json:"status"` // ตัวเลือก: open / close / full

	Services []Service `gorm:"foreignKey:StoreID;references:ID" json:"services"`
}
