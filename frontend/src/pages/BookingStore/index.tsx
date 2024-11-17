import React, { useState, useEffect } from 'react';
import { Button, Card, Avatar, Space, message, Typography, Divider } from 'antd';
import { UserOutlined, PhoneOutlined, MoneyCollectOutlined, FileTextOutlined } from "@ant-design/icons";
import { useParams, useNavigate, Link } from 'react-router-dom';
import { GetServiceByStoreID, GetUserProfile } from "../../services/https/index";
import axios from 'axios';


const { Title, Paragraph } = Typography;

const BookingStore: React.FC = () => {
    const { postId } = useParams<{ postId: string }>();
    const navigate = useNavigate();
    const [store, setStore] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [messageApi, contextHolder] = message.useMessage();
    const [bookerUserId, setBookerUserId] = useState<string | null>(null);
    const [profile, setProfile] = useState<any>(null);  // Store user profile

    const fetchUserProfile = async () => {
        try {
            const profileRes = await GetUserProfile();
            setProfile(profileRes);  // Update profile state
            setBookerUserId(profileRes.ID || "No ID");
        } catch (error) {
            messageApi.open({
                type: "error",
                content: "Failed to fetch user profile",
            });
        }
    };

    const isValidURL = (urlString: string) => {
        try {
            new URL(urlString);
            return true;
        } catch {
            return false;
        }
    };

    useEffect(() => {
        if (!postId) {
            messageApi.open({
                type: "error",
                content: "Invalid post ID",
            });
            return;
        }

        fetchUserProfile();
        const fetchStoreDetails = async () => {
            try {
                const res = await GetStoreByID(postId);
                if (res.status === 200) {
                    setStore(res.data);
                } else {
                    messageApi.open({
                        type: "error",
                        content: "Failed to load store details",
                    });
                }
            } catch (error) {
                messageApi.open({
                    type: "error",
                    content: "Error fetching store details",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchStoreDetails();
    }, [postId, messageApi]);


    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <>
            {contextHolder}
            {/* Background video */}


            <div style={{ padding: '20px', display: 'flex', justifyContent: '', alignItems: 'flex-start'}}>
                <div style={{ width: '65%', padding: '20px' }}>
                    <Card>
                        <Title level={3}>{store?.Name || 'Store Name'}</Title>
                        <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
                            <FileTextOutlined style={{ marginRight: '8px' }} />
                            {store?.Description || 'No description available'}
                        </Paragraph>
                    </Card>
                </div>

                {/* Sidebar with fixed positioning */}
                <div style={{
                    width: '30%',
                    padding: '20px',
                    position: 'fixed',
                    top: '160px', // Adjust the top positioning as needed
                    right: '40px' // Ensures it’s aligned to the right
                }}>
                    <Card>
                        <Space direction="vertical" align="center">
                            <Link to={`/customer/profile/${store.User?.ID}`}>
                                <Avatar
                                    src={store?.User?.Profile || undefined}
                                    size={80}
                                    icon={<UserOutlined />}
                                />
                            </Link>
                            <Typography.Text strong>
                                {store?.User?.first_name} {store?.User?.last_name}
                            </Typography.Text>
                        </Space>
                    </Card>

                    <Card style={{ marginTop: '20px' }}>
                        <Title level={4}>
                            <PhoneOutlined /> Contact
                        </Title>
                        <Paragraph>
                            {isValidURL(store?.Contact_info) ? (
                                <a href={store.Contact_info} target="_blank" rel="noopener noreferrer">
                                    GO TO CONTACT
                                </a>
                            ) : (
                                store?.Contact_info || 'No Contact Information'
                            )}
                        </Paragraph>
                        <Divider />
                        <Title level={4}>
                            <MoneyCollectOutlined /> Wages
                        </Title>
                        <Paragraph>
                            {store?.Wages || 'No Wages Information'} บาท
                        </Paragraph>
                    </Card>

                    {profile && profile.Role === "FREELANCE" && (
                        <Button
                            type="primary"
                            size="large"
                            style={{ marginTop: '20px', width: '100%' }}
                        >
                            Book Store
                        </Button>
                    )}
                </div>
            </div>
        </>
    );
};

export default BookingStore;
function GetStoreByID(postId: string) {
    throw new Error('Function not implemented.');
}

