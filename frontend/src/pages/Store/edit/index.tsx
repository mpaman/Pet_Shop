import { useEffect, useState } from "react";
import {
    Form,
    Input,
    Button,
    Select,
    TimePicker,
    Upload,
    Avatar,
    message,
    Divider,
    Spin,
} from "antd";
import { PlusOutlined, UserOutlined } from "@ant-design/icons";
import moment from "moment";
import { useParams, useNavigate } from "react-router-dom";
import {
    GetStoreByID,
    GetAllStoreImage,
    UpdateStore,
    CreateStoreImage,
    DeleteStoreImage,
    GetUserProfile,
    UpdateUsersById,
} from "../../../services/https";

const { Option } = Select;
const { TextArea } = Input;
const provinces = [
    "กรุงเทพมหานคร", "เชียงใหม่", "เชียงราย", "ชลบุรี", "กระบี่", "ภูเก็ต",
    "นนทบุรี", "ปทุมธานี", "สมุทรปราการ", "ขอนแก่น", "สุราษฎร์ธานี",
    "ระยอง", "นครราชสีมา", "พระนครศรีอยุธยา", "อุดรธานี", "สงขลา",
    "ตรัง", "ลำปาง", "ราชบุรี", "ประจวบคีรีขันธ์", "นราธิวาส"
];
function StoreEdit() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [storeImages, setStoreImages] = useState<any[]>([]);
    const [deletedImageIDs, setDeletedImageIDs] = useState<number[]>([]);
    const [storeData, setStoreData] = useState<any | null>(null);
    const [profile, setProfile] = useState<any | null>(null);
    const [uploadingProfile, setUploadingProfile] = useState(false);
    const [loading, setLoading] = useState(true);
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        const fetchData = async () => {
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
                        address: storeResponse.data.address,
                        time_close: moment(storeResponse.data.time_close, "HH:mm"),
                    });
                }

                const storeImagesResponse = await GetAllStoreImage();
                if (storeImagesResponse?.data?.data) {
                    const filteredImages = storeImagesResponse.data.data.filter(
                        (img: any) => img.store_id === parseInt(id!)
                    );
                    setStoreImages(filteredImages);
                }

                const profileResponse = await GetUserProfile();
                setProfile(profileResponse.Profile);

            } catch (error) {
                messageApi.error("Failed to fetch data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
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

            await UpdateStore(id, updatedStore);

            for (const imgID of deletedImageIDs) {
                await DeleteStoreImage(imgID);
            }

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
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <Avatar
                    size={120}
                    icon={<UserOutlined />}
                    src={profile}
                    style={{ marginBottom: "10px" }}
                />
                <h4>{`${profile?.FirstName || ""} ${profile?.LastName || ""}`}</h4>
            </div>

            <Form layout="vertical" onFinish={onFinish} form={form}>
                <h2>Edit Store</h2>
                <Form.Item label="Store Name" name="name" rules={[{ required: true }]}>
                    <Input placeholder="Enter store name" />
                </Form.Item>

                <Form.Item label="Location" name="location" rules={[{ required: true, message: 'Please select the location!' }]}>
                <Select
                    showSearch
                    placeholder="Select a province"
                    filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                >
                    {provinces.map((province) => (
                        <Option key={province} value={province}>{province}</Option>
                    ))}
                </Select>
            </Form.Item>


                <Form.Item label="Address" name="address" rules={[{ required: true, message: 'Please input the address!' }]}>
                <Input placeholder="Enter detailed address" />
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


                <Form.Item label="Closing Time" name="time_close" rules={[{ required: true, message: 'Please select closing time!' }]}>
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
                    <Button style={{ background: "#954435", color: "white" }} htmlType="submit" block>
                        Save Changes
                    </Button>
                </Form.Item>
            </Form>

        </>
    );
}

export default StoreEdit;
