package entity

import (
	"gorm.io/gorm"
)

type Store struct {
	gorm.Model

	UserID      uint   `json:"user_id"`
	User        Users  `gorm:"foreignKey:UserID;references:ID" json:"user"`
	Name        string `json:"name"`
	Location    string `json:"location"`
	ContactInfo string `json:"contact_info"` 
	Description string `json:"description"`
	TimeOpen    string `json:"time_open"`   
	Status      string `json:"status"`        // ตัวเลือก: open / close / full
}
