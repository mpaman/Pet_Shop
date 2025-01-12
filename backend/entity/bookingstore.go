package entity

import (
	"gorm.io/gorm"
	"time"
)

type Bookingstore struct {
	gorm.Model

	BookerUserID uint  `json:"booker_user_id" gorm:"index" binding:"required"`
	BookerUser   Users `gorm:"foreignKey:BookerUserID;references:ID"`

	StoreID uint  `json:"store_id" gorm:"index" binding:"required"`
	Store   Store `gorm:"foreignKey:StoreID;references:ID"`

	ServiceID uint    `json:"service_id" binding:"required"`
	Service   Service `gorm:"foreignKey:ServiceID;references:ID"`

	BookingTime string `json:"booking_time"`

	Date time.Time `json:"date" binding:"required"`

	Status string `json:"status"`

	Notes string `json:"notes" gorm:"type:text"`

	TotalCost float32 `json:"total_cost"`

	ContactNum string `json:"contact_number" binding:"-"`

	CountPet int `json:"count_pet" binding:"required"`

	Pets []Pet `gorm:"many2many:booking_pets;joinForeignKey:BookingID;joinReferences:PetID;" json:"pets"`

}

// type Bookingstore struct {
// 	gorm.Model

// 	BookerUserID uint    `json:"booker_user_id" gorm:"index" valid:"required~Booker User ID is required"`
// 	BookerUser   Users   `gorm:"foreignKey:BookerUserID;references:ID" json:"booker_user"`

// 	StoreID uint    `json:"store_id" gorm:"index" valid:"required~Store ID is required"`
// 	Store   Store   `gorm:"foreignKey:StoreID;references:ID" json:"store"`

// 	ServiceID uint    `json:"service_id" valid:"required~Service ID is required"`
// 	Service   Service `gorm:"foreignKey:ServiceID;references:ID" json:"service"`

// 	BookingTime string    `json:"booking_time" valid:"matches(^\\d{2}:\\d{2}$)~Invalid time format (HH:mm)"`
// 	Date        time.Time `json:"date" valid:"required~Date is required"`

// 	Status   string `json:"status" valid:"in(pending|confirmed|cancelled)~Invalid status"`
// 	Notes    string `json:"notes" gorm:"type:text"`
// 	TotalCost int   `json:"total_cost" valid:"gte=0~Total cost must be greater than or equal to 0"`

// 	ContactNum string `json:"contact_number" valid:"matches(^\\d{10}$)~Invalid contact number"`
// 	CountPet   int    `json:"count_pet" valid:"required~CountPet is required, gte=1~CountPet must be at least 1"`
// }

// // Validate performs validations on the Bookingstore struct
// func (b *Bookingstore) Validate() error {
// 	if b.CountPet < 1 {
// 		return errors.New("CountPet must be at least 1")
// 	}
// 	return nil
// }
