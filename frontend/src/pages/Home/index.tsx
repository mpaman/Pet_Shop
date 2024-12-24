
import {
    Button,
} from "antd";

import { Link, } from "react-router-dom";



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
