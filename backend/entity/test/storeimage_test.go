package test

import (
	"testing"
	// "fmt"
	"github.com/mpaman/petshop/entity"
	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
)

func TestStoreImage(t *testing.T){
	g := NewGomegaWithT(t)

	t.Run("test-Url",func(t *testing.T){
		image := entity.StoreImage{
			ImageURL: "",
			StoreID: 1,
		}
		ok,err := govalidator.ValidateStruct(image)
		// fmt.Println(err)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())

		g.Expect(err.Error()).To(ContainSubstring("Image URL is required"))
	})

	t.Run("test-storeid",func(t *testing.T){
		image := entity.StoreImage{
			ImageURL: "https://example",
			StoreID: 0,
		}
		ok,err := govalidator.ValidateStruct(image)
		// fmt.Println(err)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())

		g.Expect(err.Error()).To(ContainSubstring("Store ID is required"))
	})
}

