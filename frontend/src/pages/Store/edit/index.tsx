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
    Row,
    Col,
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
} from "../../../services/https";
import ImgCrop from "antd-img-crop";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";

const { Option } = Select;
const { TextArea } = Input;
const provinces = [
    "กรุงเทพมหานคร", "เชียงใหม่", "ชลบุรี", "กระบี่", "ภูเก็ต",
    "นนทบุรี", "ปทุมธานี", "สมุทรปราการ", "ขอนแก่น", "นครราชสีมา",
    "พระนครศรีอยุธยา", "อุดรธานี", "สงขลา", "ตรัง", "ลำปาง",
];

function StoreEdit() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [storeImages, setStoreImages] = useState<any[]>([]);
    const [deletedImageIDs, setDeletedImageIDs] = useState<number[]>([]);
    const [storeData, setStoreData] = useState<any | null>(null);
    const [profile, setProfile] = useState<any | null>(null);
    const [latitude, setLatitude] = useState<number>(0);
    const [longitude, setLongitude] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();
    const [fileList, setFileList] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const storeResponse = await GetStoreByID(id);
                const storeImagesResponse = await GetAllStoreImage();

                if (storeResponse?.data) {
                    setStoreData(storeResponse.data);
                    setLatitude(storeResponse.data.latitude);
                    setLongitude(storeResponse.data.longitude);
                    form.setFieldsValue({
                        ...storeResponse.data,
                        time_open: moment(storeResponse.data.time_open, "HH:mm"),
                        time_close: moment(storeResponse.data.time_close, "HH:mm"),
                    });
                }

                if (storeImagesResponse?.data?.data) {
                    const filteredImages = storeImagesResponse.data.data.filter(
                        (img: any) => img.store_id === parseInt(id!)
                    );
                    setStoreImages(filteredImages);
                }
            } catch (error) {
                messageApi.error("Failed to fetch data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, form, messageApi]);

    const handleBeforeUpload = (file: File) => {
        if (!file.type.startsWith("image/")) {
            message.error("You can only upload image files!");
            return Upload.LIST_IGNORE;
        }
        return true;
    };

    const handleChangeImage = ({ fileList }: any) => {
        const newImageList = fileList.map((file: any) => {
            if (file.originFileObj) {
                const reader = new FileReader();
                reader.readAsDataURL(file.originFileObj);
                reader.onload = () => {
                    setStoreImages((prev) => [
                        ...prev,
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
            const updatedStore = {
                ...values,
                latitude,
                longitude,
                profile_image: fileList[0]?.thumbUrl || storeData.profile_image,
                time_open: values.time_open.format("HH:mm"),
                time_close: values.time_close.format("HH:mm"),
            };

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

    const MapClickHandler = () => {
        useMapEvents({
            click: (e) => {
                setLatitude(e.latlng.lat);
                setLongitude(e.latlng.lng);
                message.success(`Updated location: Lat ${e.latlng.lat}, Lng ${e.latlng.lng}`);
            },
        });
        return null;
    };

    if (loading) {
        return (
            <div style={{ textAlign: "center", marginTop: "50px" }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
            {contextHolder}
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <Avatar
                    size={120}
                    icon={<UserOutlined />}
                    src={storeData?.profile_image || null}
                    style={{ marginBottom: "10px" }}
                />
            </div>

            <Form layout="vertical" onFinish={onFinish} form={form}>
                <h2>Edit Store</h2>
                <Form.Item label="Profile Image" name="profile_image">
                    <ImgCrop rotationSlider>
                        <Upload
                            listType="picture-card"
                            fileList={fileList}
                            onChange={({ fileList: newFileList }) => setFileList(newFileList)}
                            beforeUpload={() => false}
                            maxCount={1}
                        >
                            {fileList.length < 1 && (
                                <div>
                                    <PlusOutlined />
                                    <div style={{ marginTop: 8 }}>อัพโหลด</div>
                                </div>
                            )}
                        </Upload>
                    </ImgCrop>
                </Form.Item>
                <Form.Item label="Store Name" name="name" rules={[{ required: true }]}>
                    <Input placeholder="Enter store name" />
                </Form.Item>

                <Form.Item label="Province" name="province" rules={[{ required: true }]}>
                    <Select showSearch placeholder="Select a province">
                        {provinces.map((province) => (
                            <Option key={province} value={province}>
                                {province}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item label="District" name="district" rules={[{ required: true }]}>
                    <Input placeholder="Enter detailed district" />
                </Form.Item>

                <div style={{ height: "400px", marginBottom: "20px", border: "1px solid #d9d9d9" }}>
                    <MapContainer center={[latitude, longitude]} zoom={13} style={{ height: "100%", width: "100%" }}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution="&copy; OpenStreetMap contributors"
                        />
                        <MapClickHandler />
                        <Marker position={[latitude, longitude]} />
                    </MapContainer>
                </div>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Latitude">
                            <Input value={latitude} readOnly />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Longitude">
                            <Input value={longitude} readOnly />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item label="Contact Info" name="contact_info" rules={[{ required: true }]}>
                    <Input placeholder="Enter contact information" />
                </Form.Item>

                <Form.Item label="Description" name="description">
                    <TextArea rows={4} placeholder="Describe the store" />
                </Form.Item>

                <Form.Item label="Opening Time" name="time_open" rules={[{ required: true }]}>
                    <TimePicker format="HH:mm" />
                </Form.Item>

                <Form.Item label="Closing Time" name="time_close" rules={[{ required: true }]}>
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
                    <Button style={{borderRadius: "20px",background: "#954435", color: "white" }} htmlType="submit" block>
                        Save Changes
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}

export default StoreEdit;
