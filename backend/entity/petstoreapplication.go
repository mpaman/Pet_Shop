package entity

import (
	"gorm.io/gorm"
)

type PetStoreApplication struct {
	gorm.Model

	UserID uint  `json:"user_id"`           // เชื่อมโยงกับ User ที่สมัคร
	User   Users `gorm:"foreignKey:UserID"` // สร้างความสัมพันธ์กับ Users

	Email                string `json:"email"`                // อีเมลของผู้สมัคร
	Phone                string `json:"phone"`                // เบอร์โทรศัพท์ของผู้สมัคร
	Location             string `json:"location"`             // ที่ตั้งของร้าน
	StoreName            string `json:"store_name"`           // ชื่อร้าน
	LicenseDocumentURL   string `json:"license_document_url"` // URL ของเอกสารใบอนุญาต
	Status               string `json:"status"`               // สถานะการสมัคร เช่น "pending", "approved", "rejected"
}
