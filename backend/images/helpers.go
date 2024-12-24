package images

import (
	"encoding/base64"
	"os"
	"log"
)

// ฟังก์ชันสำหรับแปลงไฟล์รูปภาพเป็น Base64
func EncodeImageToBase64(filePath string) string {
	// อ่านไฟล์รูปภาพ
	imageBytes, err := os.ReadFile(filePath) // ใช้ os.ReadFile แทน ioutil.ReadFile
	if err != nil {
		log.Printf("Error reading file %s: %v", filePath, err)
		return ""
	}

	// แปลงเป็น Base64
	base64Str := base64.StdEncoding.EncodeToString(imageBytes)

	// เพิ่มคำนำหน้า MIME type
	return "data:image/jpeg;base64," + base64Str
}
