package entity

import (
	"gorm.io/gorm"
)

type Store struct {
	gorm.Model

	UserID       uint   `json:"user_id"`
	User         Users  `gorm:"foreignKey:UserID;references:ID" json:"user"`
	Name         string `json:"name"`
	ProfileImage string `gorm:"type:longtext" json:"profile_image"`

	Street      string `json:"street"`       // บ้านเลขที่ / ชื่อถนน
	SubDistrict string `json:"sub_district"` // ตำบล
	District    string `json:"district"`     // อำเภอ
	Province    string `json:"province"`     // จังหวัด
	Country     string `json:"country"`      // ประเทศ

	ContactInfo string `json:"contact_info"`
	Description string `json:"description"`
	TimeOpen    string `json:"time_open"`
	TimeClose   string `json:"time_close"`
	Status      string `json:"status"` // ตัวเลือก: open / close / full

	Services []Service `gorm:"foreignKey:StoreID;references:ID" json:"services"`
}
