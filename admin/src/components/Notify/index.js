import { Badge, Button, Dropdown } from "antd";
import { BellOutlined } from '@ant-design/icons';
import "./Notify.css";
function Notify() {
    const items = [
        {
            label: (
                <div>
                    <div>
                        <div href="https://www.antgroup.com" target="_blank" rel="noopener noreferrer">
                            1st menu item
                        </div>
                    </div>
                    <div>
                        <span>8 phut truoc</span>
                    </div>

                </div>

            ),
            key: '0',
        },
        {
            label: (
                <a href="https://www.aliyun.com" target="_blank" rel="noopener noreferrer">
                    2nd menu item
                </a>
            ),
            key: '1',
        },
        {
            label: (
                <a href="https://www.aliyun.com" target="_blank" rel="noopener noreferrer">
                    3rd menu item
                </a>
            ),
            key: '2',
        },
        {
            label: (
                <a href="https://www.aliyun.com" target="_blank" rel="noopener noreferrer">
                    4 menu item
                </a>
            ),
            key: '4',
        },
        {
            label: (
                <a href="https://www.aliyun.com" target="_blank" rel="noopener noreferrer">
                    5 menu item
                </a>
            ),
            key: '5',
        },
        {
            label: (
                <a href="https://www.aliyun.com" target="_blank" rel="noopener noreferrer">
                    6 menu item
                </a>
            ),
            key: '6',
        },
        {
            label: (
                <a href="https://www.aliyun.com" target="_blank" rel="noopener noreferrer">
                    7 menu item
                </a>
            ),
            key: '7',
        },
        {
            label: (
                <a href="https://www.aliyun.com" target="_blank" rel="noopener noreferrer">
                    8 menu item
                </a>
            ),
            key: '8',
        },
        {
            type: 'divider',
        },
        {
            label: '6 menu item',
            key: '3',
        },
    ];
    return (
        <>
            <Dropdown
                menu={{ items }}
                trigger={['click']}
                dropdownRender={(menu) => (
                    <>
                        <div className="notify__dropdown">
                            <div className="notify__header">
                                <div className="notify__header-title">
                                    <BellOutlined /> Notification
                                </div>
                                <Button type="link"> View All</Button>
                            </div>
                            <div className="notify__body">
                                {menu}
                            </div>
                        </div>
                    </>
                )}
            >
                <Badge dot={true}>
                    <Button type="text" icon={<BellOutlined />} /> 
                    </Badge>

            </Dropdown>
        </>
    )
}

export default Notify;