package entity

import (
	// "errors"
	"gorm.io/gorm"
	// "github.com/asaskevich/govalidator"
)

type StoreImage struct {
	gorm.Model

	ImageURL string `gorm:"type:longtext" json:"image_url" valid:"required~Image URL is required,url~Invalid URL format"`
	StoreID  uint   `json:"store_id" `
	Store    Store  `gorm:"foreignKey:StoreID;references:ID" json:"store"`
}

//เช็คเงื่อนไขเพิ่มเติม
// func (s *StoreImage) Validate() error {
// 	if s.ImageURL == "" {
// 		return errors.New("Image URL is required")
// 	}
// 	if !govalidator.IsURL(s.ImageURL) {
// 		return errors.New("Invalid URL format")
// 	}

// 	return nil
// }
