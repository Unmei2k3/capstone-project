import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Switch, Typography, Space, Divider, message } from "antd";
import {
    DndContext,
    PointerSensor,
    useSensor,
    useSensors,
    closestCenter,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DragOutlined } from "@ant-design/icons";
import { updateServiceSteps } from "../../../services/medicalServiceService";
import { useDispatch } from "react-redux";
import { setMessage } from "../../../redux/slices/messageSlice";

const { Text } = Typography;

function SortableStepItem({ step, onToggle }) {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id: step.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        background: "#f5f5f5",
        padding: "12px 16px",
        marginBottom: 10,
        borderRadius: 8,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            <Space>
                <DragOutlined {...listeners} style={{ cursor: "grab", color: "#999" }} />
                <Text>{step?.steps?.name || "Chưa có tên bước"}</Text>
            </Space>
            <Switch checked={step.status} onChange={() => onToggle(step.id)} />
        </div>
    );
}

export default function ServiceFlowModal({ open, onCancel, onSave, flowData }) {
    const dispatch = useDispatch();
    const [form] = Form.useForm();
    const [steps, setSteps] = useState(flowData?.flow || []);
    const sensors = useSensors(useSensor(PointerSensor));

    useEffect(() => {
        form.setFieldsValue({ name: flowData?.name });

        const sortedSteps = [...(flowData?.flow || [])].sort((a, b) => a.stepOrder - b.stepOrder);
        setSteps(sortedSteps);
    }, [flowData]);

    const handleDragEnd = (event) => {
        // const { active, over } = event;
        // if (!over || active.id === over.id) return;

        // const activeStep = steps.find((s) => s.id === active.id);
        // const overIndex = steps.findIndex((s) => s.id === over.id);

        // if (activeStep.steps.name === "Chọn Phương Thức Thanh Toán" && overIndex === 0) {
        //     dispatch(setMessage({ type: 'error', content: `Không thể đặt bước 'Thanh toán' lên đầu quy trình.` }));

        //     return;
        // }

        // const oldIndex = steps.findIndex((s) => s.id === active.id);
        // const newIndex = overIndex;
        // setSteps((prev) => arrayMove(prev, oldIndex, newIndex));
        return;
    };

    const handleToggleStep = (id) => {
        const index = steps.findIndex((s) => s.id === id);

        if (index >= steps.length - 2) {
            dispatch(setMessage({ type: 'error', content: "Không thể thay đổi trạng thái 2 bước cuối cùng" }));
            return;
        }
        setSteps((prev) =>
            prev.map((s) => (s.id === id ? { ...s, status: !s.status } : s))
        );
    };

    const handleSubmit = async () => {
        try {
            await form.validateFields();
            await updateServiceSteps(flowData.id, steps);

            message.success("Cập nhật luồng dịch vụ thành công");

            onSave({
                id: flowData.id,
                name: form.getFieldValue("name"),
                flow: steps,
            });
        } catch (error) {
            message.error("Cập nhật luồng thất bại");
            console.error("Update flow error:", error);
        }
    };
    return (
        <Modal
            open={open}
            title="Sửa luồng dịch vụ"
            onCancel={onCancel}
            onOk={handleSubmit}
            width={700}
            okText="Lưu luồng"
            cancelText="Hủy"
        >
            <Form form={form} layout="vertical">
                <Form.Item label="Tên dịch vụ" name="name">
                    <Input disabled />
                </Form.Item>

                <Divider orientation="left">Thứ tự và trạng thái các bước</Divider>

                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={steps.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                        {steps.map((step) => (
                            <SortableStepItem key={step.id} step={step} onToggle={handleToggleStep} />
                        ))}
                    </SortableContext>
                </DndContext>
            </Form>
        </Modal>
    );
}
