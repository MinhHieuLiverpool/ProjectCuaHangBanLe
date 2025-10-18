import React, { useState } from "react";
import { Button } from "antd";
import { CameraOutlined } from "@ant-design/icons";
import BarcodeScanner from "../Orders/BarcodeScanner";

interface BarcodeCameraButtonProps {
  onScan: (barcode: string) => void;
  buttonText?: string;
  buttonSize?: "small" | "middle" | "large";
  buttonType?: "default" | "primary" | "dashed" | "link" | "text";
  block?: boolean;
  disabled?: boolean;
}

/**
 * Component nút Camera để quét barcode
 * Tái sử dụng cho CreateOrderModal và CreatePurchaseOrderModal
 */
const BarcodeCameraButton: React.FC<BarcodeCameraButtonProps> = ({
  onScan,
  buttonText = "Camera",
  buttonSize = "large",
  buttonType = "default",
  block = false,
  disabled = false,
}) => {
  const [showScanner, setShowScanner] = useState(false);

  const handleScanSuccess = (barcode: string) => {
    setShowScanner(false);
    onScan(barcode);
  };

  return (
    <>
      <Button
        onClick={() => setShowScanner(true)}
        block={block}
        type={buttonType}
        size={buttonSize}
        icon={<CameraOutlined />}
        disabled={disabled}
      >
        {buttonText}
      </Button>

      {/* Barcode Scanner Modal */}
      <BarcodeScanner
        visible={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleScanSuccess}
      />
    </>
  );
};

export default BarcodeCameraButton;
