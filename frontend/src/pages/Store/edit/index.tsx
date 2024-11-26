import { useEffect, useState } from "react";
import {
    Form,
    Input,
    Button,
    Select,
    TimePicker,
    Upload,
    message,
    Divider,
    Spin,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import moment from "moment";
import { useParams, useNavigate } from "react-router-dom";
import {
    GetStoreByID,
    GetAllStoreImage,
    UpdateStore,
    CreateStoreImage,
    DeleteStoreImage,
} from "../../../services/https";

const { Option } = Select;
const { TextArea } = Input;

function StoreEdit() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [storeImages, setStoreImages] = useState<any[]>([]);
    const [deletedImageIDs, setDeletedImageIDs] = useState<number[]>([]);
    const [storeData, setStoreData] = useState<any | null>(null);
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
                    form.setFieldsValue({
                        name: storeResponse.data.name,
                        location: storeResponse.data.location,
                        contact_info: storeResponse.data.contact_info,
                        description: storeResponse.data.description,
                        time_open: moment(storeResponse.data.time_open, "HH:mm"),
                        status: storeResponse.data.status,
                    });
                }

                const storeImagesResponse = await GetAllStoreImage();
                if (storeImagesResponse?.data?.data) {
                    const filteredImages = storeImagesResponse.data.data.filter(
                        (img: any) => img.store_id === parseInt(id!)
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
        const newImageList = fileList.map((file: any) => {
            if (file.originFileObj) {
                const reader = new FileReader();
                reader.readAsDataURL(file.originFileObj);
                reader.onload = () => {
                    setStoreImages((prevImages) => [
                        ...prevImages,
                        { image_url: reader.result as string, store_id: parseInt(id!) },
                    ]);
                };
            }
            return file;
        });
    };
    

    const onRemoveImage = (file: any) => {
        if (file.uid && !file.uid.startsWith("rc-upload-")) {
            setDeletedImageIDs((prev) => [...prev, parseInt(file.uid)]);
        }
        setStoreImages((prev) => prev.filter((img) => img.ID !== parseInt(file.uid)));
    };

    const onFinish = async (values: any) => {
        try {
            const updatedStore = { ...values, time_open: values.time_open.format("HH:mm") };
    
            // อัปเดตร้านค้า
            await UpdateStore(id, updatedStore);
    
            // ลบภาพที่ถูกเลือกให้ลบ
            for (const imgID of deletedImageIDs) {
                await DeleteStoreImage(imgID);
            }
    
            // อัปโหลดภาพใหม่
            for (const image of storeImages) {
                if (!image.ID) {
                    await CreateStoreImage({
                        image_url: image.image_url,
                        store_id: parseInt(id!),
                    });
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
                            uid: image.ID?.toString() || String(Math.random()),
                            url: image.image_url,
                        }))}
                        onChange={handleChangeImage}
                        onRemove={onRemoveImage}
                        beforeUpload={handleBeforeUpload}
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
                    <Button style={{ background:"#954435",color: "white"}} htmlType="submit" block>
                        Save Changes
                    </Button>
                </Form.Item>
            </Form>
        </>
    );
}

export default StoreEdit;
