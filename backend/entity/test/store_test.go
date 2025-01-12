package test

import (
	"testing"

	"github.com/asaskevich/govalidator"
	"github.com/mpaman/petshop/entity"
	. "github.com/onsi/gomega"
)

func TestValidStore(t *testing.T) {
	g := NewGomegaWithT(t)

	store := entity.Store{
		UserID:       1,
		Name:         "Test Store",
		ProfileImage: "http://example.com/image.jpg",
		Longitude:    100.0,
		Latitude:     13.0,
		District:     "Bang Kapi",
		ProvinceID:   1,
		ContactInfo:  "0812345678",
		Description:  "This is a store.",
		TimeOpen:     "09:00",
		TimeClose:    "18:00",
		Status:       "open",
	}

	ok, err := govalidator.ValidateStruct(&store)
	g.Expect(ok).To(BeTrue())
	g.Expect(err).To(BeNil())
}

func TestInvalidStoreLongitude(t *testing.T) {
	g := NewGomegaWithT(t)

	store := entity.Store{
		UserID:       1,
		Name:         "Test Store",
		ProfileImage: "http://example.com/image.jpg",
		Longitude:    200.0, // Invalid
		Latitude:     13.0,
		District:     "Bang Kapi",
		ProvinceID:   1,
		ContactInfo:  "0812345678",
		Description:  "This is a store.",
		TimeOpen:     "09:00",
		TimeClose:    "18:00",
		Status:       "open",
	}

	ok, err := govalidator.ValidateStruct(&store)
	g.Expect(ok).To(BeFalse())
	g.Expect(err.Error()).To(ContainSubstring("Longitude must be between -180 and 180"))
}

func TestInvalidStoreLatitude(t *testing.T) {
	g := NewGomegaWithT(t)

	store := entity.Store{
		UserID:       1,
		Name:         "Test Store",
		ProfileImage: "http://example.com/image.jpg",
		Longitude:    100.0,
		Latitude:     95.0, // Invalid
		District:     "Bang Kapi",
		ProvinceID:   1,
		ContactInfo:  "0812345678",
		Description:  "This is a store.",
		TimeOpen:     "09:00",
		TimeClose:    "18:00",
		Status:       "open",
	}

	ok, err := govalidator.ValidateStruct(&store)
	g.Expect(ok).To(BeFalse())
	g.Expect(err.Error()).To(ContainSubstring("Latitude must be between -90 and 90"))
}

func TestInvalidStoreStatus(t *testing.T) {
	g := NewGomegaWithT(t)

	store := entity.Store{
		UserID:       1,
		Name:         "Test Store",
		ProfileImage: "http://example.com/image.jpg",
		Longitude:    100.0,
		Latitude:     13.0,
		District:     "Bang Kapi",
		ProvinceID:   1,
		ContactInfo:  "0812345678",
		Description:  "This is a store.",
		TimeOpen:     "09:00",
		TimeClose:    "18:00",
		Status:       "busy", // Invalid
	}

	ok, err := govalidator.ValidateStruct(&store)
	g.Expect(ok).To(BeFalse())
	g.Expect(err.Error()).To(ContainSubstring("Status must be 'open', 'close', or 'full'"))
}
