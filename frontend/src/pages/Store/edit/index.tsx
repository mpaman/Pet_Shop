import { useEffect, useState } from "react";
import {
    Form,
    Input,
    Button,
    Select,
    TimePicker,
    Upload,
    message,
    InputNumber,
    Divider,
    Spin,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { StoreInterface } from "../../../interfaces/Store";
import { StoreImageInterface } from "../../../interfaces/Storeimage";
import { ServiceInterface } from "../../../interfaces/Service";
import {
    GetStoreByID,
    GetAllStoreImage,
    GetAllService,
    UpdateStore,
    CreateStoreImage,
    DeleteStoreImage,
} from "../../../services/https";
import { useParams, useNavigate } from "react-router-dom";
import moment from "moment";

const { Option } = Select;
const { TextArea } = Input;

function StoreEdit() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [storeImages, setStoreImages] = useState<StoreImageInterface[]>([]);
    const [deletedImageIDs, setDeletedImageIDs] = useState<number[]>([]);
    const [storeData, setStoreData] = useState<StoreInterface | null>(null);
    const [messageApi, contextHolder] = message.useMessage();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStoreDetails = async () => {
            setLoading(true);
            try {
                const storeResponse = await GetStoreByID(id);
                if (storeResponse?.data) {
                    setStoreData(storeResponse.data);
                    setTimeout(() => {
                        form.setFieldsValue({
                            name: storeResponse.data.name,
                            location: storeResponse.data.location,
                            contact_info: storeResponse.data.contact_info,
                            description: storeResponse.data.description,
                            time_open: moment(storeResponse.data.time_open, "HH:mm"),
                            status: storeResponse.data.status,
                        });
                    }, 0);
                }

                const storeImagesResponse = await GetAllStoreImage();
                if (storeImagesResponse?.data?.data) {
                    const filteredImages = storeImagesResponse.data.data.filter(
                        (img) => img.store_id === parseInt(id!)
                    );
                    setStoreImages(filteredImages);
                }
            } catch (error) {
                messageApi.error("Failed to fetch store details");
            } finally {
                setLoading(false);
            }
        };

        fetchStoreDetails();
    }, [id, form, messageApi]);

    const handleBeforeUpload = (file: File) => {
        const isImage = file.type.startsWith("image/");
        if (!isImage) {
            message.error("You can only upload image files!");
        }
        return isImage || Upload.LIST_IGNORE;
    };

    const handleChangeImage = ({ fileList }: any) => {
        setStoreImages(
            fileList.map((file: any) => ({
                id: file.uid.startsWith("rc-upload-") ? undefined : file.uid,
                image_url: file.url || URL.createObjectURL(file.originFileObj),
                originFileObj: file.originFileObj,
            }))
        );
    };

    const removeImage = (index: number) => {
        const imageToRemove = storeImages[index];
        if (imageToRemove.id) {
            setDeletedImageIDs([...deletedImageIDs, imageToRemove.id]);
        }
        setStoreImages(storeImages.filter((_, i) => i !== index));
    };

    const onFinish = async (values: any) => {
        try {
            const updatedStore = { ...values, time_open: values.time_open.format("HH:mm") };
    
            // เรียกใช้ฟังก์ชัน UpdateStore
            await UpdateStore(id, updatedStore);
    
            // ลบภาพที่ถูกลบออกจากระบบ
            for (const imgID of deletedImageIDs) {
                await DeleteStoreImage(imgID);  // เรียกใช้ API DeleteStoreImage
            }
    
            // อัพโหลดภาพใหม่
            for (const image of storeImages) {
                if (!image.id) { // ตรวจสอบว่าเป็นภาพใหม่
                    if (!image.originFileObj) {
                        messageApi.error("Image file missing!");
                        return; // ถ้าไม่มีไฟล์จะไม่ทำการอัพโหลด
                    }
    
                    const formData = new FormData();
                    formData.append("store_id", id!); // ตรวจสอบว่ามี store_id
                    formData.append("image", image.originFileObj); // ตรวจสอบว่ามีไฟล์
                    const response = await CreateStoreImage(formData);  // เรียกใช้ API CreateStoreImage
                    if (response?.status === 200) {
                        messageApi.success("Image uploaded successfully");
                    } else {
                        messageApi.error("Failed to upload image");
                    }
                }
            }
    
            messageApi.success("Store updated successfully!");
            navigate(`/store`);
        } catch (error) {
            messageApi.error("Failed to update store");
        }
    };
    

    if (loading) {
        return (
            <div style={{ textAlign: "center", marginTop: "50px" }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <>
            {contextHolder}
            <Form layout="vertical" onFinish={onFinish} form={form}>
                <h2>Edit Store</h2>

                <Form.Item label="Store Name" name="name" rules={[{ required: true }]}>
                    <Input placeholder="Enter store name" />
                </Form.Item>

                <Form.Item label="Location" name="location" rules={[{ required: true }]}>
                    <Input placeholder="Enter location" />
                </Form.Item>

                <Form.Item label="Contact Info" name="contact_info" rules={[{ required: true }]}>
                    <Input placeholder="Enter contact information" />
                </Form.Item>

                <Form.Item label="Description" name="description">
                    <TextArea rows={4} placeholder="Describe the store" />
                </Form.Item>

                <Form.Item label="Opening Time" name="time_open" rules={[{ required: true }]}>
                    <TimePicker format="HH:mm" />
                </Form.Item>

                <Form.Item label="Status" name="status" rules={[{ required: true }]}>
                    <Select placeholder="Select status">
                        <Option value="open">Open</Option>
                        <Option value="close">Close</Option>
                        <Option value="full">Full</Option>
                    </Select>
                </Form.Item>

                <Divider />
                <Form.Item label="Upload Images">
                    <Upload
                        listType="picture-card"
                        fileList={storeImages.map((image) => ({
                            uid: image.id || String(Math.random()),
                            url: image.image_url,
                        }))}
                        onChange={handleChangeImage}
                        beforeUpload={handleBeforeUpload}
                        onRemove={removeImage}  // เมื่อคลิกลบ
                    >
                        {storeImages.length >= 5 ? null : (
                            <div>
                                <PlusOutlined />
                                <div style={{ marginTop: 8 }}>Upload</div>
                            </div>
                        )}
                    </Upload>
                </Form.Item>

                <Divider />
                <Form.Item>
                    <Button type="primary" htmlType="submit" block>
                        Save Changes
                    </Button>
                </Form.Item>
            </Form>
        </>
    );
}

export default StoreEdit;
