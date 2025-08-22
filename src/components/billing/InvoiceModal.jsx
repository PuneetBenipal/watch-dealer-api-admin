import React from "react";
import { Modal, Descriptions, Space, Button } from "antd";
import { useDispatch } from "react-redux";
import { updateInvoiceStatus, fetchInvoices } from "../../store/slices/billing";

export default function InvoiceModal({ open, onClose, invoice }) {
    const dispatch = useDispatch();
    if (!invoice) return null;

    // const act = async (status) => {
    //     await dispatch(updateInvoiceStatus({ id: invoice._id || invoice.id, status }));
    //     dispatch(fetchInvoices());
    //     onClose?.();
    // };

    return (
        <Modal title={`Invoice #${invoice.invoiceNo

        }`} visible={open} onCancel={onClose} footer={null} destroyOnClose>
            <Descriptions bordered size="small" column={1}>
                <Descriptions.Item label="Company">{invoice.companyName}</Descriptions.Item>
                <Descriptions.Item label="Amount">{(invoice.currency || "GBP")} {invoice.amount}</Descriptions.Item>
                <Descriptions.Item label="Created">{invoice.issuedAt}</Descriptions.Item>
                <Descriptions.Item label="Due">{invoice.dueDate || "—"}</Descriptions.Item>
            </Descriptions>
            {/* <Space style={{ marginTop: 12 }}>
                <Button onClick={() => act("paid")} type="primary">Mark Paid</Button>
                <Button onClick={() => act("void")}>Void</Button>
            </Space> */}
        </Modal>
    );
}
