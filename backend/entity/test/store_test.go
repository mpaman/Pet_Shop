package test

import (
	"testing"
	"github.com/asaskevich/govalidator"
	"github.com/mpaman/petshop/entity"
	. "github.com/onsi/gomega"
)

func TestStoreNameIsRequired(t *testing.T) {
    g := NewGomegaWithT(t)

    store := entity.Store{
        Name:        "", // Invalid
        Longitude:   100.0,
        Latitude:    13.0,
        District:    "Bang Kapi",
        ProvinceID:    1,
        ContactInfo: "0812345678",
        Description: "This is a store.",
        TimeOpen:    "09:00",
        TimeClose:   "18:00",
        Status:      "open",
    } 

    ok, err := govalidator.ValidateStruct(&store)
    g.Expect(ok).To(BeFalse())
    g.Expect(err).NotTo(BeNil())
}



func TestStoreStatusValidation(t *testing.T) {
	g := NewGomegaWithT(t)

	store := entity.Store{
		Name:        "Test Store",
		Longitude:   100.0,
		Latitude:    13.0,
		District:    "Bang Kapi",
        ProvinceID:    1,
		ContactInfo: "0812345678",
		Description: "This is a store.",
		TimeOpen:    "09:00",
		TimeClose:   "18:00",
		Status:      "invalid", // Invalid
	}
	//เช็คเพิ่มเติม
	err := store.Validate()
	g.Expect(err).NotTo(BeNil())
	g.Expect(err.Error()).To(Equal("Status must be 'open', 'close', or 'full'"))
}

func TestStoreLongitudeValidation(t *testing.T) {
	g := NewGomegaWithT(t)

	store := entity.Store{
		Name:        "Test Store",
		Longitude:   200.0, // Invalid
		Latitude:    13.0,
		District:    "Bang Kapi",
        ProvinceID:    1,
		ContactInfo: "0812345678",
		TimeOpen:    "09:00",
		TimeClose:   "18:00",
		Status:      "open",
	}
	//เช็คเพิ่มเติม
	err := store.Validate()
	g.Expect(err).NotTo(BeNil())
	g.Expect(err.Error()).To(Equal("Longitude must be between -180 and 180"))
}

func TestValidStore(t *testing.T) {
    g := NewGomegaWithT(t)

    store := entity.Store{
        Name:        "Test Store",
        Longitude:   100.0,
        Latitude:    13.0,
        District:    "Bang Kapi",
        ProvinceID:    1,
        ContactInfo: "0812345678",
        Description: "This is a store.",
        TimeOpen:    "09:00",
        TimeClose:   "18:00",
        Status:      "open",
        UserID:      1,
        ProfileImage: "http://example.com/image.jpg",
    }

    ok, err := govalidator.ValidateStruct(&store)

    g.Expect(ok).To(BeTrue())
    g.Expect(err).To(BeNil())
}

