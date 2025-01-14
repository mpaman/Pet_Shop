package test

import (
	"testing"
	"fmt"
	"github.com/mpaman/petshop/entity"
	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
)

func TestStoreImage(t *testing.T){
	g := NewGomegaWithT(t)

	t.Run("testUrl",func(t *testing.T){
		image := entity.StoreImage{
			ImageURL: "",
			StoreID: 1,
		}
		ok,err := govalidator.ValidateStruct(image)
		fmt.Println(err)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())

		g.Expect(err.Error()).To(ContainSubstring("Image URL is required"))
	})
}

// func TestStoreImageURLIsRequired(t *testing.T) {
//     g := NewGomegaWithT(t)
//     mockStore := entity.Store{
//         Name: "Mock Store",
//     }

//     storeImage := entity.StoreImage{
//         ImageURL: "", 
//         Store:    mockStore,
//     }

//     err := storeImage.Validate()
//     g.Expect(err).NotTo(BeNil())
//     g.Expect(err.Error()).To(Equal("Image URL is required"))
// }

// func TestStoreImageURLInvalidFormat(t *testing.T) {
// 	g := NewGomegaWithT(t)

// 	mockStore := entity.Store{
// 		Name: "Mock Store",
// 	}

// 	storeImage := entity.StoreImage{
// 		ImageURL: "invalid-url", // Invalid
// 		Store:    mockStore,
// 	}

// 	err := storeImage.Validate()
// 	g.Expect(err).NotTo(BeNil())
// 	g.Expect(err.Error()).To(Equal("Invalid URL format"))
// }

// func TestStoreImageValidURL(t *testing.T) {
// 	g := NewGomegaWithT(t)

// 	mockStore := entity.Store{
// 		Name: "Mock Store",
// 	}

// 	storeImage := entity.StoreImage{
// 		ImageURL: "https://example.com/image.jpg", // Valid
// 		Store:    mockStore,
// 	}

// 	err := storeImage.Validate()
// 	g.Expect(err).To(BeNil())
// }
