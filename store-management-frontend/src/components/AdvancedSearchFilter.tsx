import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Input,
  Select,
  Button,
  Space,
  DatePicker,
  InputNumber,
  Divider,
} from "antd";
import dayjs from "dayjs";
import {
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

const { RangePicker } = DatePicker;

export interface AdvancedSearchFilterProps {
  // Basic search
  searchText: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;

  // Category/Type filter
  categories?: Array<{ id: number; name: string }>;
  selectedCategory?: number | null;
  onCategoryChange?: (value: number | null) => void;
  categoryLabel?: string;

  // Status filter
  statuses?: Array<{ value: string; label: string }>;
  selectedStatus?: string | null;
  onStatusChange?: (value: string | null) => void;
  statusLabel?: string;

  // Date range filter
  showDateFilter?: boolean;
  dateRange?: [string, string] | null;
  onDateRangeChange?: (dates: [string, string] | null) => void;
  dateLabel?: string;

  // Price/Amount range filter
  showPriceFilter?: boolean;
  priceRange?: [number, number] | null;
  onPriceRangeChange?: (range: [number, number] | null) => void;
  priceLabel?: string;

  // Reset filters
  onReset?: () => void;

  // Custom filters (children)
  children?: React.ReactNode;
}

const AdvancedSearchFilter: React.FC<AdvancedSearchFilterProps> = ({
  searchText,
  onSearchChange,
  searchPlaceholder = "Tìm kiếm...",
  categories,
  selectedCategory,
  onCategoryChange,
  categoryLabel = "Danh mục",
  statuses,
  selectedStatus,
  onStatusChange,
  statusLabel = "Trạng thái",
  showDateFilter = false,
  dateRange,
  onDateRangeChange,
  dateLabel = "Khoảng thời gian",
  showPriceFilter = false,
  priceRange,
  onPriceRangeChange,
  priceLabel = "Khoảng giá",
  onReset,
  children,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const hasAdvancedFilters = showDateFilter || showPriceFilter;

  const handleReset = () => {
    if (onReset) {
      onReset();
    }
  };

  return (
    <>
      {/* Header with buttons */}
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "flex-end",
          gap: 8,
        }}
      >
        {onReset && (
          <Button
            icon={<ReloadOutlined />}
            onClick={handleReset}
            title="Reset tất cả bộ lọc"
          >
            Reset
          </Button>
        )}
        {hasAdvancedFilters && (
          <Button
            icon={<FilterOutlined />}
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? "Ẩn bộ lọc" : "Bộ lọc nâng cao"}
          </Button>
        )}
      </div>

      {/* Filters Card */}
      <Card style={{ marginBottom: 16 }}>
        {/* Basic filters row */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder={searchPlaceholder}
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => onSearchChange(e.target.value)}
              allowClear
            />
          </Col>
          {categories && onCategoryChange && (
            <Col xs={24} sm={12} md={8}>
              <Select
                placeholder={categoryLabel}
                style={{ width: "100%" }}
                value={selectedCategory}
                onChange={onCategoryChange}
                allowClear
              >
                {categories.map((cat) => (
                  <Select.Option key={cat.id} value={cat.id}>
                    {cat.name}
                  </Select.Option>
                ))}
              </Select>
            </Col>
          )}
          {statuses && onStatusChange && (
            <Col xs={24} sm={12} md={8}>
              <Select
                placeholder={statusLabel}
                style={{ width: "100%" }}
                value={selectedStatus}
                onChange={onStatusChange}
                allowClear
              >
                {statuses.map((status) => (
                  <Select.Option key={status.value} value={status.value}>
                    {status.label}
                  </Select.Option>
                ))}
              </Select>
            </Col>
          )}
          {children}
        </Row>

        {/* Advanced filters section */}
        {showAdvanced && hasAdvancedFilters && (
          <>
            <Divider style={{ margin: "16px 0" }} />
            <Row gutter={[16, 16]}>
              {showDateFilter && onDateRangeChange && (
                <Col xs={24} sm={12}>
                  <label style={{ display: "block", marginBottom: 8 }}>
                    {dateLabel}:
                  </label>
                  <RangePicker
                    style={{ width: "100%" }}
                    format="DD/MM/YYYY"
                    placeholder={["Từ ngày", "Đến ngày"]}
                    value={
                      dateRange
                        ? [dayjs(dateRange[0]), dayjs(dateRange[1])]
                        : null
                    }
                    onChange={(dates) => {
                      if (dates && dates[0] && dates[1]) {
                        onDateRangeChange([
                          dates[0].format("YYYY-MM-DD"),
                          dates[1].format("YYYY-MM-DD"),
                        ]);
                      } else {
                        onDateRangeChange(null);
                      }
                    }}
                  />
                </Col>
              )}

              {showPriceFilter && onPriceRangeChange && (
                <Col xs={24} sm={12}>
                  <label style={{ display: "block", marginBottom: 8 }}>
                    {priceLabel}:
                  </label>
                  <Space.Compact style={{ width: "100%" }}>
                    <InputNumber
                      style={{ width: "50%" }}
                      placeholder="Từ"
                      min={0}
                      value={priceRange?.[0]}
                      onChange={(value) => {
                        if (value !== null) {
                          onPriceRangeChange([
                            value,
                            priceRange?.[1] || 999999999,
                          ]);
                        } else {
                          onPriceRangeChange(null);
                        }
                      }}
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                    />
                    <InputNumber
                      style={{ width: "50%" }}
                      placeholder="Đến"
                      min={0}
                      value={priceRange?.[1]}
                      onChange={(value) => {
                        if (value !== null) {
                          onPriceRangeChange([priceRange?.[0] || 0, value]);
                        } else {
                          onPriceRangeChange(null);
                        }
                      }}
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                    />
                  </Space.Compact>
                </Col>
              )}
            </Row>
          </>
        )}
      </Card>
    </>
  );
};

export default AdvancedSearchFilter;
