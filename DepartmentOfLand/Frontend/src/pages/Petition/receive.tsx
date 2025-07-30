import React, { useState } from "react";
import Sidebar from "../../component/sideabar/Sidebar";
import { Table, Tag, Button, Modal, Select, message } from "antd";

interface Petition {
  id: number;
  firstName: string;
  lastName: string;
  topic: string;
  date: string;
  status: string;
}

const Receive: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedPetition, setSelectedPetition] = useState<Petition | null>(null);
  const [newStatus, setNewStatus] = useState("");

  const petitions: Petition[] = [
    { id: 1, firstName: "สมชาย", lastName: "ใจดี", topic: "ขอคัดสำเนาโฉนด", date: "2025-07-27", status: "รอตรวจสอบ" },
    { id: 2, firstName: "สุนีย์", lastName: "ทองดี", topic: "โอนกรรมสิทธิ์ที่ดิน", date: "2025-07-26", status: "กำลังดำเนินการ" },
    { id: 3, firstName: "วิชัย", lastName: "บุญมา", topic: "แบ่งแยกที่ดิน", date: "2025-07-25", status: "เสร็จสิ้น" },
  ];

  const [data, setData] = useState(petitions);

  const showModal = (petition: Petition) => {
    setSelectedPetition(petition);
    setNewStatus(petition.status);
    setIsModalVisible(true);
  };

  const handleOk = () => {
    if (!selectedPetition) return;
    const updatedData = data.map((item) =>
      item.id === selectedPetition.id ? { ...item, status: newStatus } : item
    );
    setData(updatedData);
    message.success("อัปเดตสถานะสำเร็จ");
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const columns = [
    { title: "เลขคำร้อง", dataIndex: "ID", key: "ID" },
    { title: "ชื่อ",dataIndex: "first_name",key: "first_name",},
    { title: "นามสกุล",dataIndex: "last_name",key: "last_name",},
    { title: "เรื่อง",dataIndex: "topic",key: "topic",},
    { title: "เหตุผล",dataIndex: "description",key: "description",},
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        let color = "";
        if (status === "รอตรวจสอบ") color = "orange";
        else if (status === "กำลังดำเนินการ") color = "blue";
        else if (status === "เสร็จสิ้น") color = "green";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "การดำเนินการ",
      key: "action",
      render: (_: any, record: Petition) => (
        <Button type="primary" onClick={() => showModal(record)}>
          เปลี่ยนสถานะ
        </Button>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: "24px", backgroundColor: "#f9f9f9" }}>
        <h2>ตรวจสอบคำร้อง</h2>
        <Table columns={columns} dataSource={data} rowKey="id" bordered pagination={{ pageSize: 5 }} />

        {/* Modal สำหรับเปลี่ยนสถานะ */}
        <Modal
          title={`เปลี่ยนสถานะคำร้อง #${selectedPetition?.id}`}
          visible={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
          okText="ยืนยัน"
          cancelText="ยกเลิก"
        >
          <p><strong>เรื่อง:</strong> {selectedPetition?.topic}</p>
          <Select
            style={{ width: "100%" }}
            value={newStatus}
            onChange={(value) => setNewStatus(value)}
          >
            <Select.Option value="รอตรวจสอบ">รอตรวจสอบ</Select.Option>
            <Select.Option value="กำลังดำเนินการ">กำลังดำเนินการ</Select.Option>
            <Select.Option value="เสร็จสิ้น">เสร็จสิ้น</Select.Option>
          </Select>
        </Modal>
      </div>
    </div>
  );
};

export default Receive;
