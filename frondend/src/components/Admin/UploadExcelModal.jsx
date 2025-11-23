import React, { useState, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { FileUpload } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import { ProgressBar } from 'primereact/progressbar';
import { bulkUploadStudents } from '../../api/admin/manageStudentService';
import axiosAdmin from '../../api/apiAdminService';

export default function UploadExcelModal({ visible, onHide, onSuccess }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentUploadingFile, setCurrentUploadingFile] = useState(null);
  const [results, setResults] = useState([]);
  const toast = useRef(null);
  const fileUploadRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFiles = e.files || [];
    
    if (selectedFiles.length === 0) return;

    const validFiles = [];
    const invalidFiles = [];

    selectedFiles.forEach((file) => {
      // Kiểm tra định dạng file
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        invalidFiles.push(file.name);
      } else {
        validFiles.push(file);
      }
    });

    if (invalidFiles.length > 0) {
      toast.current?.show({
        severity: 'error',
        summary: 'Lỗi',
        detail: `Các file sau không hợp lệ: ${invalidFiles.join(', ')}. Chỉ chấp nhận định dạng .xlsx hoặc .xls`,
        life: 5000
      });
    }

    if (validFiles.length > 0) {
      // Thêm file mới vào danh sách (tránh trùng lặp)
      setFiles(prevFiles => {
        const newFiles = [...prevFiles];
        validFiles.forEach(file => {
          // Kiểm tra xem file đã tồn tại chưa (theo tên và kích thước)
          const exists = newFiles.some(f => f.name === file.name && f.size === file.size);
          if (!exists) {
            newFiles.push(file);
          }
        });
        return newFiles;
      });
      setResults([]);
    }

    // Xóa file khỏi FileUpload component sau khi đã lưu vào state
    if (fileUploadRef.current) {
      fileUploadRef.current.clear();
    }
  };

  const handleBeforeUpload = (e) => {
    // Ngăn upload tự động, chỉ lưu file vào state
    e.options.clear();
    return false;
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Cảnh báo',
        detail: 'Vui lòng chọn ít nhất một file Excel',
        life: 3000
      });
      return;
    }

    setUploading(true);
    setResults([]);
    
    const allResults = [];
    let totalSuccess = 0;
    let totalError = 0;
    let totalStudents = 0;

    // Upload từng file một
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setCurrentUploadingFile(file.name);
      setUploadProgress(((i + 1) / files.length) * 100);

      try {
        const { data, error } = await bulkUploadStudents(file);

        if (error) {
          allResults.push({
            fileName: file.name,
            success: false,
            error: error,
            success_count: 0,
            error_count: 0,
            total: 0,
            errors: []
          });
          totalError++;
        } else if (data) {
          allResults.push({
            fileName: file.name,
            success: data.success,
            error: data.error,
            success_count: data.success_count || 0,
            error_count: data.error_count || 0,
            total: data.total || 0,
            errors: data.errors || []
          });
          totalSuccess += data.success_count || 0;
          totalError += data.error_count || 0;
          totalStudents += data.total || 0;
        }
      } catch (error) {
        console.error('Upload error:', error);
        allResults.push({
          fileName: file.name,
          success: false,
          error: 'Không thể kết nối đến server',
          success_count: 0,
          error_count: 0,
          total: 0,
          errors: []
        });
        totalError++;
      }
    }

    setResults(allResults);
    setUploading(false);
    setCurrentUploadingFile(null);
    setUploadProgress(100);

    // Hiển thị thông báo tổng kết
    if (totalSuccess > 0) {
      toast.current?.show({
        severity: 'success',
        summary: 'Thành công',
        detail: `Đã upload ${files.length} file(s). Tạo thành công ${totalSuccess}/${totalStudents} học viên`,
        life: 5000
      });
      
      // Gọi callback để refresh danh sách
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
          handleClose();
        }, 2000);
      }
    } else {
      toast.current?.show({
        severity: 'warn',
        summary: 'Cảnh báo',
        detail: 'Không có học viên nào được tạo thành công',
        life: 5000
      });
    }
  };

  const handleRemoveFile = (indexToRemove) => {
    setFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
  };

  const handleClose = () => {
    setFiles([]);
    setResults([]);
    setUploadProgress(0);
    setCurrentUploadingFile(null);
    if (fileUploadRef.current) {
      fileUploadRef.current.clear();
    }
    onHide();
  };

  const handleDownloadTemplate = async () => {
    try {
      const res = await axiosAdmin.get('/admin/student/bulk-upload/template/', {
        responseType: 'blob',
      });
      const blob = res.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'student_upload_template.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      toast.current?.show({
        severity: 'error',
        summary: 'Lỗi',
        detail: e.message || 'Không thể tải file mẫu',
        life: 3000
      });
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header="Tạo danh sách học viên lên hệ thống từ Excel"
        visible={visible}
        onHide={handleClose}
        style={{ width: '90vw', maxWidth: '800px' }}
        modal
        className="p-fluid"
      >
        <div className="space-y-4">
          {/* Hướng dẫn */}
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 shadow-sm">
            <h4 className="font-semibold mb-2">Hướng dẫn:</h4>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>File Excel phải có định dạng .xlsx hoặc .xls</li>
              <li>Các cột bắt buộc: <strong>Họ tên học viên</strong> (hoặc Họ và Tên riêng), <strong>Mật khẩu</strong>, <strong>Mã lớp</strong></li>
              <li>Các cột tùy chọn: Mã học viên, Ngày sinh, Giới tính, Địa chỉ, SĐT Phụ huynh, Email, Số điện thoại, Tên đăng nhập</li>
              <li>Dòng đầu tiên là tiêu đề cột</li>
            </ul>
            <div className="mt-3">
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="btn btn-sm btn-outline btn-primary"
              >
                Tải file mẫu .xlsx
              </button>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Chọn file Excel {files.length > 0 && `(${files.length} file đã chọn)`}
            </label>
            <FileUpload
              ref={fileUploadRef}
              name="excel_file"
              accept=".xlsx,.xls"
              maxFileSize={50000000}
              multiple
              mode="basic"
              chooseLabel="Chọn file Excel"
              className="w-full"
              chooseOptions={{
                icon: 'pi pi-upload',
                className: 'w-full justify-center p-button-rounded p-button-outlined'
              }}
              showUploadButton={false}
              showCancelButton={false}
              onSelect={handleFileSelect}
              onBeforeUpload={handleBeforeUpload}
              customUpload
              disabled={uploading}
            />
            
            {/* Danh sách file đã chọn */}
            {files.length > 0 && (
              <div className="mt-3 space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <i className="pi pi-file-excel text-blue-600 text-xl flex-shrink-0"></i>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">{file.name}</div>
                          <div className="text-sm text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                      </div>
                      <Button
                        icon="pi pi-times"
                        className="p-button-text p-button-danger p-button-rounded"
                        onClick={() => handleRemoveFile(index)}
                        disabled={uploading}
                        tooltip="Xóa file"
                        tooltipOptions={{ position: 'top' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {files.length === 0 && (
              <p className="mt-2 text-xs text-gray-500">
                Dung lượng tối đa 50MB/file. Chỉ chấp nhận định dạng .xlsx hoặc .xls. Có thể chọn nhiều file cùng lúc.
              </p>
            )}
          </div>

          {/* Progress Bar */}
          {uploading && (
            <div>
              <ProgressBar value={uploadProgress} showValue={true} />
              <p className="text-center text-sm mt-2">
                {currentUploadingFile ? `Đang xử lý: ${currentUploadingFile}` : 'Đang xử lý file...'}
              </p>
            </div>
          )}

          {/* Kết quả */}
          {results.length > 0 && !uploading && (
            <div className="mt-4">
              <h4 className="font-semibold mb-3">Kết quả upload:</h4>
              
              {/* Tổng hợp kết quả */}
              {(() => {
                const totalSuccess = results.reduce((sum, r) => sum + (r.success_count || 0), 0);
                const totalError = results.reduce((sum, r) => sum + (r.error_count || 0), 0);
                const totalStudents = results.reduce((sum, r) => sum + (r.total || 0), 0);
                
                return (
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-blue-50 p-3 rounded">
                      <div className="text-sm text-gray-600">Tổng số</div>
                      <div className="text-2xl font-bold">{totalStudents}</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded">
                      <div className="text-sm text-gray-600">Thành công</div>
                      <div className="text-2xl font-bold text-green-600">{totalSuccess}</div>
                    </div>
                    <div className="bg-red-50 p-3 rounded">
                      <div className="text-sm text-gray-600">Lỗi</div>
                      <div className="text-2xl font-bold text-red-600">{totalError}</div>
                    </div>
                  </div>
                );
              })()}

              {/* Kết quả từng file */}
              <div className="space-y-3">
                {results.map((result, fileIndex) => (
                  <div key={fileIndex} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <i className={`pi ${result.success ? 'pi-check-circle text-green-600' : 'pi-times-circle text-red-600'}`}></i>
                        <span className="font-semibold">{result.fileName}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {result.success_count || 0}/{result.total || 0} thành công
                      </div>
                    </div>
                    
                    {/* Chi tiết lỗi của file này */}
                    {result.errors && result.errors.length > 0 && (
                      <div className="mt-2">
                        <div className="text-xs font-semibold text-red-600 mb-1">Chi tiết lỗi:</div>
                        <div className="max-h-40 overflow-y-auto">
                          <table className="table table-xs w-full text-xs">
                            <thead>
                              <tr>
                                <th>Dòng</th>
                                <th>Mã học viên</th>
                                <th>Lỗi</th>
                              </tr>
                            </thead>
                            <tbody>
                              {result.errors.map((error, idx) => (
                                <tr key={idx} className="text-error">
                                  <td className="font-semibold">{error.row}</td>
                                  <td>{error.samurai_student_id || 'N/A'}</td>
                                  <td className="break-words">{error.error}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                    
                    {result.error && !result.errors && (
                      <div className="mt-2 text-sm text-red-600">{result.error}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-6 border-t pt-4">
            <Button
              label="Đóng"
              onClick={handleClose}
              className="p-button-outlined p-button-secondary"
              disabled={uploading}
            />
            {results.length === 0 && (
              <Button
                label={uploading ? 'Đang upload...' : `Upload ${files.length > 0 ? `(${files.length} file)` : ''}`}
                icon="pi pi-upload"
                onClick={handleUpload}
                loading={uploading}
                disabled={files.length === 0 || uploading}
              />
            )}
          </div>
        </div>
      </Dialog>
    </>
  );
}

