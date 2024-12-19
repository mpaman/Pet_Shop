package entity

import (
	"gorm.io/gorm"
)

type Pet struct {
	gorm.Model

	BookingID uint         `json:"booking_id" gorm:"index"` // เชื่อมกับการจอง
	Booking   Bookingstore `gorm:"foreignKey:BookingID;references:ID" json:"booking"`

	Name       string  `json:"name" binding:"required"`   // ชื่อสัตว์เลี้ยง
	Breed      string  `json:"breed"`                     // สายพันธุ์
	Age        int     `json:"age" binding:"gte=0"`       // อายุ (ต้องเป็นเลขที่มากกว่าหรือเท่ากับ 0)
	Gender     string  `json:"gender" binding:"required"` // เพศ
	Weight     float64 `json:"weight" binding:"gte=0"`    // น้ำหนัก (ต้องเป็นเลขที่มากกว่าหรือเท่ากับ 0)
	Vaccinated string  `json:"vaccinated"`                // เปลี่ยนเป็น string

	OwnerID    uint   `json:"owner_id" gorm:"index"` // เจ้าของสัตว์
	Owner      Users  `gorm:"foreignKey:OwnerID;references:ID" json:"owner"`
	PicturePet string `gorm:"type:longtext" json:"picture_pet"` // รูปสัตว์เลี้ยง
}
