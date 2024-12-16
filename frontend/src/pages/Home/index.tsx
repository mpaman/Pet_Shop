import { useState, useEffect } from "react";
import {
    Col, Row, Divider, message, Input, Typography, Select, Avatar, Pagination, Card, Space, Button, Tooltip
} from "antd";

import { Link, useNavigate } from "react-router-dom";
import { EnvironmentOutlined, SearchOutlined } from "@ant-design/icons"; // เพิ่ม นอกจาก ant

const { Search } = Input;
const { Option } = Select;

function Home() {

    return (
        <>
                                            <Link to={`/stores`}>
                                                <Button
                                                >
                                                    Book Now
                                                </Button>
                                            </Link>
        </>
    );
}

export default Home;
