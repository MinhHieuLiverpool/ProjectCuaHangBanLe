import React, { useEffect, useRef, useState } from "react";
import { Modal, Button, Space, message, Input } from "antd";
import {
  CameraOutlined,
  CloseOutlined,
  PictureOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import jsQR from "jsqr";
import Quagga from "@ericblade/quagga2";

interface BarcodeScannerProps {
  visible: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  visible,
  onClose,
  onScan,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null); // Canvas để hiển thị vùng quét
  const scanIntervalRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isScannedRef = useRef<boolean>(false); // Flag để ngăn quét nhiều lần
  const [hasCamera, setHasCamera] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [manualInput, setManualInput] = useState("");
  const [pastedImage, setPastedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanningInfo, setScanningInfo] = useState<string>(
    "Đang tìm barcode..."
  );

  // Tạo âm thanh beep khi quét thành công
  useEffect(() => {
    // Tạo audio context và oscillator cho âm thanh beep
    const createBeepSound = () => {
      try {
        const audioContext = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800; // Tần số 800Hz (âm thanh beep)
        oscillator.type = "sine";

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.2
        );

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
      } catch (error) {
        console.log("Audio not supported");
      }
    };

    // Lưu function vào ref để có thể gọi từ bất kỳ đâu
    (audioRef as any).current = createBeepSound;
  }, []);

  // Hàm phát âm thanh thành công
  const playSuccessSound = () => {
    if ((audioRef as any).current) {
      (audioRef as any).current();
    }
  };

  // Xử lý paste ảnh từ clipboard
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      if (!visible) return;

      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          e.preventDefault();
          const blob = items[i].getAsFile();
          if (blob) {
            await processImageFile(blob);
          }
          break;
        }
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => {
      document.removeEventListener("paste", handlePaste);
    };
  }, [visible]);

  useEffect(() => {
    if (visible) {
      startCamera();
      isScannedRef.current = false; // Reset flag khi mở modal
    } else {
      stopCamera();
      setPastedImage(null);
    }

    return () => {
      stopCamera();
    };
    // eslint-disable-next-line
  }, [visible]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setHasCamera(true);
        message.info("Camera đã sẵn sàng!");

        // Bắt đầu quét liên tục
        videoRef.current.addEventListener("loadedmetadata", () => {
          startContinuousScanning();
        });
      }
    } catch (error) {
      console.error("Lỗi khi truy cập camera:", error);
      setHasCamera(false);
      message.error("Không thể truy cập camera. Bạn có thể nhập mã thủ công.");
    }
  };

  const stopCamera = () => {
    // Dừng Quagga và cleanup tất cả listeners
    try {
      Quagga.stop();
      Quagga.offDetected();
      Quagga.offProcessed();
    } catch (error) {
      console.log("Quagga already stopped");
    }

    // Dừng quét liên tục
    if (scanIntervalRef.current) {
      cancelAnimationFrame(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }

    // Reset flag
    isScannedRef.current = false;
  };

  // Hàm quét liên tục từ camera với Quagga2
  const startContinuousScanning = () => {
    if (!videoRef.current) return;

    Quagga.init(
      {
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: videoRef.current,
          constraints: {
            width: { min: 640 },
            height: { min: 480 },
            facingMode: "environment",
          },
        },
        locator: {
          patchSize: "large",
          halfSample: false,
        },
        decoder: {
          readers: [
            "ean_reader", // EAN-13 (8900000000001-8900000000050)
            "ean_8_reader",
            "code_128_reader",
            "code_39_reader",
            "upc_reader",
            "upc_e_reader",
          ],
        },
        locate: true,
        frequency: 10, // Quét 10 lần mỗi giây
      },
      (err) => {
        if (err) {
          console.error("Lỗi khởi tạo Quagga:", err);
          setScanningInfo("❌ Lỗi khởi động camera");
          return;
        }

        console.log("Quagga khởi động thành công!");
        setScanningInfo("🔍 Đang tìm barcode...");
        Quagga.start();

        // Vẽ overlay
        drawScanningOverlay();
      }
    );

    // Lắng nghe sự kiện phát hiện
    Quagga.onDetected((result) => {
      // Kiểm tra xem đã quét rồi chưa
      if (isScannedRef.current) {
        return; // Đã quét rồi, bỏ qua
      }

      if (result && result.codeResult && result.codeResult.code) {
        const barcode = result.codeResult.code;
        console.log("Phát hiện barcode:", barcode);

        // Đánh dấu đã quét - NGĂN QUÉT TIẾP
        isScannedRef.current = true;

        // DỪNG QUAGGA NGAY LẬP TỨC
        try {
          Quagga.stop();
          Quagga.offDetected();
          Quagga.offProcessed();
        } catch (error) {
          console.log("Lỗi dừng Quagga:", error);
        }

        // Dừng animation frame
        if (scanIntervalRef.current) {
          cancelAnimationFrame(scanIntervalRef.current);
          scanIntervalRef.current = null;
        }

        // Vẽ box xanh xung quanh barcode
        drawDetectionBox(result);

        // Cập nhật trạng thái
        setScanningInfo(`✅ Phát hiện: ${barcode}`);

        // Phát âm thanh
        playSuccessSound();

        // Delay nhỏ để người dùng thấy box xanh và nghe beep
        setTimeout(() => {
          message.success(`✅ Đã quét được: ${barcode}`);
          onScan(barcode);
          handleClose();
        }, 800);
      }
    });

    // Lắng nghe quá trình xử lý để vẽ overlay
    Quagga.onProcessed((result) => {
      drawProcessingOverlay(result);
    });
  };

  // Vẽ overlay vùng đang quét
  const drawScanningOverlay = () => {
    const drawOverlay = () => {
      if (!overlayCanvasRef.current || !videoRef.current) return;

      const video = videoRef.current;
      const overlayCanvas = overlayCanvasRef.current;
      const overlayCtx = overlayCanvas.getContext("2d");

      if (!overlayCtx || video.readyState !== video.HAVE_ENOUGH_DATA) {
        scanIntervalRef.current = requestAnimationFrame(drawOverlay);
        return;
      }

      // Set canvas size
      overlayCanvas.width = video.videoWidth;
      overlayCanvas.height = video.videoHeight;

      // Clear
      overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

      // Vẽ vùng quét (85% x 45%)
      const scanWidth = overlayCanvas.width * 0.85;
      const scanHeight = overlayCanvas.height * 0.45;
      const scanX = (overlayCanvas.width - scanWidth) / 2;
      const scanY = (overlayCanvas.height - scanHeight) / 2;

      // Viền đỏ
      overlayCtx.strokeStyle = "#ff4d4f";
      overlayCtx.lineWidth = 3;
      overlayCtx.strokeRect(scanX, scanY, scanWidth, scanHeight);

      // Đường quét ngang
      overlayCtx.strokeStyle = "rgba(255, 77, 79, 0.5)";
      overlayCtx.lineWidth = 2;
      for (let i = 0; i <= 5; i++) {
        const y = scanY + (scanHeight / 5) * i;
        overlayCtx.beginPath();
        overlayCtx.moveTo(scanX, y);
        overlayCtx.lineTo(scanX + scanWidth, y);
        overlayCtx.stroke();
      }

      scanIntervalRef.current = requestAnimationFrame(drawOverlay);
    };

    drawOverlay();
  };

  // Vẽ overlay khi đang xử lý
  const drawProcessingOverlay = (result: any) => {
    if (!overlayCanvasRef.current) return;

    const overlayCanvas = overlayCanvasRef.current;
    const overlayCtx = overlayCanvas.getContext("2d");
    if (!overlayCtx) return;

    // Vẽ các điểm phát hiện nếu có
    if (result && result.boxes) {
      overlayCtx.strokeStyle = "rgba(255, 255, 0, 0.5)";
      overlayCtx.lineWidth = 2;

      result.boxes.forEach((box: any) => {
        if (box !== result.box) {
          overlayCtx.strokeRect(
            box[0].x,
            box[0].y,
            box[1].x - box[0].x,
            box[1].y - box[0].y
          );
        }
      });
    }

    // Vẽ box chính nếu có
    if (result && result.box) {
      overlayCtx.strokeStyle = "rgba(255, 165, 0, 0.8)";
      overlayCtx.lineWidth = 3;
      const box = result.box;
      overlayCtx.strokeRect(
        box[0].x,
        box[0].y,
        box[1].x - box[0].x,
        box[1].y - box[0].y
      );
    }
  };

  // Vẽ box xanh khi phát hiện thành công
  const drawDetectionBox = (result: any) => {
    if (!overlayCanvasRef.current) return;

    const overlayCanvas = overlayCanvasRef.current;
    const overlayCtx = overlayCanvas.getContext("2d");
    if (!overlayCtx || !result.line) return;

    // Vẽ box xanh
    overlayCtx.strokeStyle = "#52c41a";
    overlayCtx.lineWidth = 5;
    overlayCtx.beginPath();

    if (result.box) {
      const box = result.box;
      overlayCtx.moveTo(box[0].x, box[0].y);
      overlayCtx.lineTo(box[1].x, box[1].y);
      overlayCtx.lineTo(box[2].x, box[2].y);
      overlayCtx.lineTo(box[3].x, box[3].y);
      overlayCtx.closePath();
      overlayCtx.stroke();
    }

    // Hiển thị mã
    if (result.codeResult && result.box) {
      overlayCtx.fillStyle = "#52c41a";
      overlayCtx.font = "bold 24px Arial";
      overlayCtx.fillText(
        `✓ ${result.codeResult.code}`,
        result.box[0].x,
        result.box[0].y - 10
      );
    }
  };

  const processImageFile = async (file: File | Blob) => {
    setIsProcessing(true);
    try {
      const imageUrl = URL.createObjectURL(file);
      setPastedImage(imageUrl);

      message.info("Đang xử lý ảnh... Vui lòng đợi!");

      // Thử đọc với Quagga2 với cấu hình tối ưu cho ảnh nghiêng/mờ
      Quagga.decodeSingle(
        {
          src: imageUrl,
          numOfWorkers: 0,
          locate: true,
          locator: {
            patchSize: "large", // Tăng kích thước patch để đọc tốt hơn với ảnh khó
            halfSample: false, // Không giảm chất lượng ảnh
          },
          decoder: {
            readers: [
              "ean_reader", // EAN-13 (8900000000001-8900000000050)
              "ean_8_reader",
              "code_128_reader",
              "code_39_reader",
              "upc_reader",
              "upc_e_reader",
            ],
            multiple: false, // Chỉ đọc 1 mã
          },
          inputStream: {
            size: 1600, // Tăng kích thước xử lý để bảo toàn chi tiết
          },
          frequency: 10, // Số lần thử đọc
        },
        (result) => {
          if (result && result.codeResult && result.codeResult.code) {
            const barcode = result.codeResult.code;
            playSuccessSound(); // Phát âm thanh thành công
            message.success(`✅ Đã đọc được mã: ${barcode}`);
            onScan(barcode);
            handleClose();
            setIsProcessing(false);
            URL.revokeObjectURL(imageUrl);
          } else {
            message.warning("⚠️ Quagga không đọc được. Thử jsQR...");
            // Nếu Quagga không đọc được, thử jsQR (cho QR code)
            tryJsQR(imageUrl);
          }
        }
      );
    } catch (error) {
      console.error("Lỗi khi xử lý ảnh:", error);
      message.error("Có lỗi xảy ra khi xử lý ảnh!");
      setIsProcessing(false);
    }
  };

  const tryJsQR = (imageUrl: string) => {
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        message.error("Không thể xử lý ảnh!");
        setIsProcessing(false);
        URL.revokeObjectURL(imageUrl);
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        message.error("Không thể khởi tạo canvas!");
        setIsProcessing(false);
        URL.revokeObjectURL(imageUrl);
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        playSuccessSound(); // Phát âm thanh thành công
        message.success(`Đã đọc được QR code: ${code.data}`);
        onScan(code.data);
        handleClose();
      } else {
        message.warning(
          "Không tìm thấy mã trong ảnh. Vui lòng thử ảnh rõ hơn hoặc nhập thủ công."
        );
      }

      setIsProcessing(false);
      URL.revokeObjectURL(imageUrl);
    };

    img.onerror = () => {
      message.error("Không thể tải ảnh!");
      setIsProcessing(false);
      URL.revokeObjectURL(imageUrl);
    };

    img.src = imageUrl;
  };

  const handleClose = () => {
    stopCamera();
    setManualInput("");
    setPastedImage(null);
    onClose();
  };

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      onScan(manualInput.trim());
      setManualInput("");
      handleClose();
    } else {
      message.warning("Vui lòng nhập mã barcode!");
    }
  };

  return (
    <Modal
      title={
        <Space>
          <CameraOutlined />
          <span>Quét mã Barcode</span>
        </Space>
      }
      open={visible}
      onCancel={handleClose}
      footer={[
        <Button key="close" onClick={handleClose} icon={<CloseOutlined />}>
          Đóng
        </Button>,
      ]}
      width={700}
      centered
      destroyOnClose
    >
      <div style={{ textAlign: "center" }}>
        {/* Canvas ẩn để xử lý ảnh */}
        <canvas ref={canvasRef} style={{ display: "none" }} />

        {/* Hiển thị ảnh đã paste */}
        {pastedImage && (
          <div
            style={{
              marginBottom: 20,
              padding: 10,
              border: "2px dashed #52c41a",
              borderRadius: 8,
              backgroundColor: "#f6ffed",
            }}
          >
            <p
              style={{ marginBottom: 10, color: "#52c41a", fontWeight: "bold" }}
            >
              <CopyOutlined /> Ảnh vừa paste:
            </p>
            <img
              src={pastedImage}
              alt="Pasted barcode"
              style={{
                maxWidth: "100%",
                maxHeight: "300px",
                border: "1px solid #d9d9d9",
                borderRadius: 4,
              }}
            />
          </div>
        )}

        {hasCamera && (
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "300px",
              margin: "0 auto 20px",
              backgroundColor: "#000",
              borderRadius: "10px",
              overflow: "hidden",
              border: "4px solid #ff4d4f", // Viền đỏ ngoài cùng
              boxShadow:
                "0 0 20px rgba(255, 77, 79, 0.6), inset 0 0 20px rgba(255, 77, 79, 0.3)", // Hiệu ứng phát sáng đỏ
            }}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{
                width: "100%",
                height: "auto",
                display: "block",
              }}
            />

            {/* Canvas overlay để hiển thị vùng quét và barcode phát hiện được */}
            <canvas
              ref={overlayCanvasRef}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
              }}
            />

            {/* Viền đỏ nhấp nháy - cho biết camera đang hoạt động */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                border: "3px solid #ff4d4f",
                borderRadius: "6px",
                animation: "pulse-red 2s infinite",
                pointerEvents: "none",
              }}
            />

            <style>
              {`
                @keyframes pulse-red {
                  0%, 100% {
                    opacity: 1;
                    box-shadow: 0 0 10px rgba(255, 77, 79, 0.8);
                  }
                  50% {
                    opacity: 0.5;
                    box-shadow: 0 0 30px rgba(255, 77, 79, 1);
                  }
                }
              `}
            </style>

            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "85%",
                height: "45%",
                border: "3px solid #52c41a",
                borderRadius: "10px",
                boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "30px",
                  height: "30px",
                  borderTop: "5px solid #52c41a",
                  borderLeft: "5px solid #52c41a",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: "30px",
                  height: "30px",
                  borderTop: "5px solid #52c41a",
                  borderRight: "5px solid #52c41a",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  width: "30px",
                  height: "30px",
                  borderBottom: "5px solid #52c41a",
                  borderLeft: "5px solid #52c41a",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: "30px",
                  height: "30px",
                  borderBottom: "5px solid #52c41a",
                  borderRight: "5px solid #52c41a",
                }}
              />

              {/* Text hướng dẫn */}
              <div
                style={{
                  position: "absolute",
                  bottom: "-40px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  color: "#52c41a",
                  fontSize: "14px",
                  fontWeight: "bold",
                  textAlign: "center",
                  textShadow: "0 0 5px rgba(0,0,0,0.8)",
                  whiteSpace: "nowrap",
                }}
              >
                📱 Đặt barcode vào khung màu xanh
              </div>
            </div>

            {/* Chỉ báo camera đang hoạt động */}
            <div
              style={{
                position: "absolute",
                top: "10px",
                left: "10px",
                backgroundColor: "rgba(255, 77, 79, 0.9)",
                color: "#fff",
                padding: "6px 12px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
              }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "#fff",
                  animation: "blink 1s infinite",
                }}
              />
              {scanningInfo}
            </div>

            <style>
              {`
                @keyframes blink {
                  0%, 100% { opacity: 1; }
                  50% { opacity: 0.3; }
                }
              `}
            </style>
          </div>
        )}

        <div style={{ marginTop: 20 }}>
          <Space.Compact style={{ width: "100%" }}>
            <Input
              placeholder="Nhập mã barcode, dùng máy quét, hoặc nhấn Ctrl+V để paste ảnh..."
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              onPressEnter={handleManualSubmit}
              size="large"
              autoFocus
              prefix={<PictureOutlined style={{ color: "#1890ff" }} />}
              disabled={isProcessing}
            />
            <Button
              type="primary"
              onClick={handleManualSubmit}
              size="large"
              loading={isProcessing}
            >
              Xác nhận
            </Button>
          </Space.Compact>

          <div style={{ marginTop: 10, color: "#8c8c8c", fontSize: "12px" }}>
            💡 Mẹo: Copy ảnh barcode (Ctrl+C) và paste vào đây (Ctrl+V) để tự
            động đọc mã
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default BarcodeScanner;
