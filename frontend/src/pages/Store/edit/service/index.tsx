import { useEffect, useState } from "react";
import {
    Form,
    Input,
    Button,
    Select,
    InputNumber,
    Divider,
    Row,
    Col,
    Spin,
    message,
    Modal,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { ServiceInterface } from "../../../../interfaces/Service";
import {
    GetAllService,
    UpdateService,
    DeleteService,
    CreateService,
} from "../../../../services/https";
import { useParams, useNavigate } from "react-router-dom";

const { Option } = Select;

function ServiceEdit() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [services, setServices] = useState<ServiceInterface[]>([]);
    const [loading, setLoading] = useState(true);
    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        const fetchServices = async () => {
            setLoading(true);
            try {
                const servicesResponse = await GetAllService();
                if (servicesResponse?.data?.data) {
                    const filteredServices = servicesResponse.data.data.filter(
                        (svc: { store_id: number }) => svc.store_id === parseInt(id!)
                    );
                    setServices(filteredServices.map((svc: any) => ({ ...svc })));
                }
            } catch (error) {
                messageApi.error("Failed to fetch services");
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, [id, messageApi]);

    const addService = () => {
        setServices([
            ...services,
            {
                ID: undefined,  // Use 'ID' instead of 'id' here
                name_service: "",
                price: 0,
                duration: 0,
                store_id: parseInt(id!),
                category_pet: "",  // Assuming default value for category_pet
            },
        ]);
    };
    
    const removeService = (index: number) => {
        const serviceToRemove = services[index];
    
        // ใช้ non-null assertion (serviceToRemove.ID!) เพื่อบอก TypeScript ว่า ID จะมีค่าเสมอ
        if (serviceToRemove.ID != null) {
            Modal.confirm({
                title: "Are you sure you want to delete this service?",
                content: `This will also delete any related bookings.`,
                onOk: async () => {
                    try {
                        // ใช้ serviceToRemove.ID! เพื่อหลีกเลี่ยงการตรวจสอบ null/undefined
                        await DeleteService(serviceToRemove.ID!.toString());
                        messageApi.success("Service and related bookings deleted successfully!");
                    } catch (error) {
                        messageApi.error("Failed to delete service and related bookings");
                    }
                    setServices(services.filter((_, i) => i !== index));
                },
            });
        } else {
            messageApi.error("Service ID is not available for deletion.");
        }
    };
    

    const onFinish = async () => {
        try {
            for (const service of services) {
                if (service.ID) {
                    // แปลง ID เป็น string ก่อนส่งไปยัง UpdateService
                    await UpdateService(service.ID.toString(), service); 
                } else {
                    await CreateService({ ...service, store_id: parseInt(id!) });
                }
            }
            messageApi.success("Services updated successfully!");
            navigate(`/store`);
        } catch (error) {
            messageApi.error("Failed to update services");
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
            <div
                style={{
                    maxWidth: "800px",
                    margin: "0 auto",
                    padding: "20px",
                    border: "1px solid #d9d9d9",
                    borderRadius: "8px",
                    background: "#ffffff",
                }}
            >
                <Form layout="vertical" onFinish={onFinish}>
                    <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Edit Services</h2>
                    {services.map((service, index) => (
                        <Row key={index} gutter={16} style={{ marginBottom: 10 }}>
                            <Col span={8}>
                                <Form.Item label={`Service Name ${index + 1}`}>
                                    <Input
                                        value={service.name_service}
                                        onChange={(e) => {
                                            const updatedServices = [...services];
                                            updatedServices[index].name_service =
                                                e.target.value;
                                            setServices(updatedServices);
                                        }}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item label="Pet Category">
                                    <Select
                                        value={service.category_pet}
                                        onChange={(value) => {
                                            const updatedServices = [...services];
                                            updatedServices[index].category_pet = value;
                                            setServices(updatedServices);
                                        }}
                                    >
                                        <Option value="dog">Dog</Option>
                                        <Option value="cat">Cat</Option>
                                        <Option value="bird">Bird</Option>
                                        <Option value="other">Other</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item label="Price">
                                    <InputNumber
                                        min={0}
                                        value={service.price}
                                        onChange={(value) => {
                                            const updatedServices = [...services];
                                            updatedServices[index].price = value || 0;
                                            setServices(updatedServices);
                                        }}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item label="Duration (minutes)">
                                    <InputNumber
                                        min={1}
                                        value={service.duration}
                                        onChange={(value) => {
                                            const updatedServices = [...services];
                                            updatedServices[index].duration = value || 0;
                                            setServices(updatedServices);
                                        }}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={2}>
                                <Button
                                    danger
                                    type="dashed"
                                    onClick={() => removeService(index)}
                                    style={{ marginTop: "28px" }}
                                >
                                    Remove
                                </Button>
                            </Col>
                        </Row>
                    ))}

                    <Button type="dashed" onClick={addService} block>
                        <PlusOutlined /> Add Service
                    </Button>

                    <Divider />
                    <Form.Item>
                        <Button
                            style={{borderRadius: "20px",background: "#954435", color: "white" }}
                            htmlType="submit"
                            
                            block
                        >
                            Save Changes
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </>
    );
}

export default ServiceEdit;
