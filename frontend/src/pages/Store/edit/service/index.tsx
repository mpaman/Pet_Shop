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
    const [deletedServiceIDs, setDeletedServiceIDs] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        const fetchServices = async () => {
            setLoading(true);
            try {
                const servicesResponse = await GetAllService();
                if (servicesResponse?.data?.data) {
                    const filteredServices = servicesResponse.data.data.filter(
                        (svc: { store_id: number; }) => svc.store_id === parseInt(id!)
                    );
                    setServices(filteredServices.map((svc: any) => ({ ...svc }))); // ตรวจสอบ id
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
        setServices([...services, { id: undefined, name_service: "", price: 0, duration: 0, store_id: parseInt(id!) }]);
    };

    const removeService = (index: number) => {
        const serviceToRemove = services[index];
        if (serviceToRemove.ID) {  // Use "id" instead of "ID"
            setDeletedServiceIDs((prevDeletedServiceIDs) => [
                ...prevDeletedServiceIDs,
                serviceToRemove.ID,
            ]);
        }
        setServices(services.filter((_, i) => i !== index));
    };

    // useEffect ที่ใช้ติดตาม deletedServiceIDs
    useEffect(() => {
        const deleteServices = async () => {
            if (deletedServiceIDs.length > 0) {
                try {
                    for (const svcID of deletedServiceIDs) {
                        await DeleteService(svcID);
                    }
                    messageApi.success("Services deleted successfully!");
                } catch (error) {
                    messageApi.error("Failed to delete services");
                }
            }
        };

        deleteServices();
    }, [deletedServiceIDs, messageApi]);

    const onFinish = async () => {
        try {
            // Update or create services
            for (const service of services) {
                if (service.ID) {  // Use "id" instead of "ID"
                    console.log("Updating service with ID:", service.ID);
                    await UpdateService(service.ID, service);
                } else {
                    console.log("Creating new service:", service);
                    await CreateService({ ...service, store_id: parseInt(id!) });
                }
            }

            // Delete removed services
            console.log("Deleted Service IDs:", deletedServiceIDs);

            messageApi.success("Services updated successfully!");
            navigate(`/store`);
        } catch (error) {
            console.error("Error updating services:", error);
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
            <Form layout="vertical" onFinish={onFinish}>
                <h2>Edit Services</h2>
                {services.map((service, index) => (
                    <Row key={index} gutter={16} style={{ marginBottom: 10 }}>
                        <Col span={8}>
                            <Form.Item label={`Service Name ${index + 1}`}>
                                <Input
                                    value={service.name_service}
                                    onChange={(e) => {
                                        const updatedServices = [...services];
                                        updatedServices[index].name_service = e.target.value;
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
                    <Button style={{ background:"#954435",color: "white"}} htmlType="submit" block>
                        Save Changes
                    </Button>
                </Form.Item>
            </Form>
        </>
    );
}

export default ServiceEdit;
