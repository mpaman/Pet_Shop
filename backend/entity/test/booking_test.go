package test

import (
	"testing"
	"time"

	"github.com/asaskevich/govalidator"
	"github.com/mpaman/petshop/entity"
	. "github.com/onsi/gomega"
)


func TestBookingstoreBookerUserIDRequired(t *testing.T) {
	g := NewGomegaWithT(t)

	booking := entity.Bookingstore{
		BookerUserID: 0, // Invalid: 
		StoreID:      1,
		ServiceID:    1,
		BookingTime:  "10:00 AM",
		Date:         time.Now().AddDate(0, 0, 1),
		Status:       "confirmed",
		Notes:        "First-time booking",
		TotalCost:    500.0,
		ContactNum:   "0812345678",
		CountPet:     2,
	}

	ok, err := govalidator.ValidateStruct(&booking)
	g.Expect(ok).To(BeFalse())
	g.Expect(err.Error()).To(ContainSubstring("BookerUserID is required"))
}

func TestBookingstoreDateRequired(t *testing.T) {
	g := NewGomegaWithT(t)

	booking := entity.Bookingstore{
		BookerUserID: 1,
		StoreID:      1,
		ServiceID:    1,
		BookingTime:  "10:00 AM",
		Date:         time.Time{}, // Invalid:
		Status:       "confirmed",
		Notes:        "First-time booking",
		TotalCost:    500.0,
		ContactNum:   "0812345678",
		CountPet:     2,
	}

	ok, err := govalidator.ValidateStruct(&booking)
	g.Expect(ok).To(BeFalse())
	g.Expect(err.Error()).To(ContainSubstring("Date is required"))
}

func TestBookingstoreCountPetRequired(t *testing.T) {
	g := NewGomegaWithT(t)

	booking := entity.Bookingstore{
		BookerUserID: 1,
		StoreID:      1,
		ServiceID:    1,
		BookingTime:  "10:00 AM",
		Date:         time.Now().AddDate(0, 0, 1),
		Status:       "confirmed",
		Notes:        "First-time booking",
		TotalCost:    500.0,
		ContactNum:   "0812345678",
		CountPet:     0, // Invalid:
	}

	ok, err := govalidator.ValidateStruct(&booking)
	g.Expect(ok).To(BeFalse())
	g.Expect(err.Error()).To(ContainSubstring("CountPet is required"))
}
