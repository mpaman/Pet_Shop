import { useState, useEffect } from "react";
import { Col, Row, Divider, message, Input, Typography, Select, Avatar, Pagination, Empty } from "antd";
import { GetAllStores } from "../../services/https/index";
import { StoreInterface } from "../../interfaces/Store";
import { useNavigate } from "react-router-dom";

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

function StoreList() {
    const [stores, setStores] = useState<StoreInterface[]>([]);
    const [filteredStores, setFilteredStores] = useState<StoreInterface[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [messageApi, contextHolder] = message.useMessage();
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const navigate = useNavigate();

    // Pagination state
    const [currentPage, setCurrentPage] = useState<number>(1);
    const pageSize = 5; // Number of items per page


    const handleStoreClick = (storeId: number) => {
        navigate(`/store/${storeId}`); // Navigate to StorePage with storeId
    };

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        const filtered = stores.filter(
            (store) =>
                store.Name.toLowerCase().includes(value.toLowerCase()) ||
                store.Description.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredStores(
            selectedCategory
                ? filtered.filter((store) => store.Status === selectedCategory)
                : filtered
        );
        setCurrentPage(1); // Reset to the first page after search
    };

    const handleSelectChange = (value: string | null) => {
        setSelectedCategory(value);
        const filtered = stores.filter(
            (store) =>
                (!value || store.Status === value) &&
                (!searchTerm ||
                    store.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    store.Description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredStores(filtered);
        setCurrentPage(1); // Reset to the first page after filter
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // Calculate the items for the current page
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentStores = filteredStores.slice(startIndex, endIndex);

    return (
        <>
            {contextHolder}

            <Row justify="space-between" align="middle">
                <Col>
                    <h2>Store List</h2>
                    <Select
                        placeholder="Select a status"
                        style={{ width: 200, marginTop: 10 }}
                        onChange={handleSelectChange}
                        allowClear
                        value={selectedCategory || undefined} // Ensure controlled value for select
                    >
                        {categories.map((status) => (
                            <Option key={status} value={status}>
                                {status}
                            </Option>
                        ))}
                    </Select>
                </Col>
                <Col>
                    <Input
                        placeholder="ค้นหาด้วยชื่อร้านค้า"
                        onChange={(e) => handleSearch(e.target.value)}
                        value={searchTerm}
                        style={{ width: 300 }}
                    />
                </Col>
            </Row>

            <Divider />

        

            {/* Pagination */}
            <Row justify="center" style={{ marginTop: 20 }}>
                <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={filteredStores.length}
                    onChange={handlePageChange}
                />
            </Row>
        </>
    );
}

export default StoreList;
