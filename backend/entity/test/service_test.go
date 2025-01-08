package test

import (
	"testing"

	"github.com/asaskevich/govalidator"
	"github.com/mpaman/petshop/entity"
	. "github.com/onsi/gomega"
)

func TestServiceNameIsRequired(t *testing.T) {
	g := NewGomegaWithT(t)

	service := entity.Service{
		NameService:   "1", // Invalid
		CategoryPetID: 1,
		Duration:      30,
		Price:         100,
	}

	ok, err := govalidator.ValidateStruct(&service)
	g.Expect(ok).To(BeFalse())
	g.Expect(err).NotTo(BeNil())
	g.Expect(err.Error()).To(ContainSubstring("Service name is required"))
}

// func TestCategoryPetIsRequired(t *testing.T) {
// 	g := NewGomegaWithT(t)

// 	service := entity.Service{
// 		NameService: "Grooming",
// 		CategoryPet: "", // Invalid
// 		Duration:    30,
// 		Price:       100,
// 	}

// 	ok, err := govalidator.ValidateStruct(&service)
// 	g.Expect(ok).To(BeFalse())
// 	g.Expect(err).NotTo(BeNil())
// 	g.Expect(err.Error()).To(ContainSubstring("Category of pet is required"))
// }

// func TestDurationMustBeGreaterThanZero(t *testing.T) {
//     g := NewGomegaWithT(t)

//     service := entity.Service{
//         StoreID:     1,
//         NameService: "Grooming",
//         CategoryPet: "Cat",
//         Duration:    0, // Invalid
//         Price:       100,
//     }

//     err := service.Validate()
//     g.Expect(err).NotTo(BeNil())
//     g.Expect(err.Error()).To(Equal("Duration must be at least 1 minute"))
// }

// func TestPriceMustBeGreaterThanZero(t *testing.T) {
//     g := NewGomegaWithT(t)

//     service := entity.Service{
//         StoreID:     1,
//         NameService: "Grooming",
//         CategoryPet: "Cat",
//         Duration:    30,
//         Price:       0, // Invalid
//     }

//     err := service.Validate()
//     g.Expect(err).NotTo(BeNil())
//     g.Expect(err.Error()).To(Equal("Price must be greater than 0"))
// }

// func TestValidService(t *testing.T) {
//     g := NewGomegaWithT(t)

//     service := entity.Service{
//         StoreID:     1,
//         NameService: "Grooming",
//         CategoryPet: "Dog",
//         Duration:    30,
//         Price:       100,
//     }

//     err := service.Validate()
//     g.Expect(err).To(BeNil())
// }
