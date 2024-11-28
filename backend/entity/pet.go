package entity

import (
	"gorm.io/gorm"
)

type Pet struct {
	gorm.Model

	BookingID  uint         `json:"booking_id" gorm:"index"` // เชื่อมกับการจอง
	Booking    Bookingstore `gorm:"foreignKey:BookingID;references:ID" json:"booking"`

	Name       string       `json:"name"`         // ชื่อสัตว์เลี้ยง
	Type       string       `json:"type"`         // ประเภท เช่น สุนัข, แมว
	Breed      string       `json:"breed"`        // สายพันธุ์
	Age        int          `json:"age"`          // อายุ (เป็นปี)
	Gender     string       `json:"gender"`       // เพศ เช่น ชาย/หญิง
	Weight     float64      `json:"weight"`       // น้ำหนัก (กิโลกรัม)
	Color      string       `json:"color"`        // สีของสัตว์
	HealthInfo string       `gorm:"type:text" json:"health_info"` // ข้อมูลสุขภาพ เช่น โรคประจำตัว, การแพ้ยา
	Vaccinated bool         `json:"vaccinated"`   // สถานะการฉีดวัคซีน
	OwnerID    uint         `json:"owner_id" gorm:"index"` // เจ้าของสัตว์
	Owner      Users        `gorm:"foreignKey:OwnerID;references:ID" json:"owner"`
}
