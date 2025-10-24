import React, { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../contexts/DashboardContext';

const UploadPage: React.FC = () => {
  const [previousYearFile, setPreviousYearFile] = useState<File | null>(null);
  const [currentYearFile, setCurrentYearFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { updateDashboardData } = useDashboard();

  const validateFile = (file: File): string | null => {
    // Check file type
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!validTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return 'Please upload a valid Excel file (.xlsx or .xls)';
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return 'File size must be less than 10MB';
    }

    return null;
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>, type: 'previous' | 'current') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validationError = validateFile(file);

      if (validationError) {
        setError(validationError);
        return;
      }

      setError(null);
      if (type === 'previous') {
        setPreviousYearFile(file);
      } else {
        setCurrentYearFile(file);
      }
    }
  };

  const handleUpload = async () => {
    if (!previousYearFile || !currentYearFile) {
      setError('Please upload both previous year and current year files');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Create FormData with both files
      const formData = new FormData();
      formData.append('previousYearFile', previousYearFile);
      formData.append('currentYearFile', currentYearFile);

      // Call the API to parse both files
      const response = await fetch('/api/parse-sales-data', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const result = await response.json();

      // Update the dashboard data in context
      if (result.data) {
        updateDashboardData(result.data);
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const FileUploadCard: React.FC<{
    title: string;
    subtitle: string;
    file: File | null;
    type: 'previous' | 'current';
    icon: React.ReactNode;
  }> = ({ title, subtitle, file, type, icon }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{subtitle}</p>
        </div>
      </div>

      {!file ? (
        <label className="block">
          <input
            type="file"
            className="hidden"
            accept=".xlsx,.xls"
            onChange={(e) => handleFileInput(e, type)}
          />
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer">
            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-900 mb-1">Click to upload</p>
            <p className="text-xs text-gray-500">or drag and drop</p>
          </div>
        </label>
      ) : (
        <div className="border-2 border-green-200 bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-8 h-8 text-green-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{file.name}</p>
              <p className="text-sm text-gray-600">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          </div>
          <button
            onClick={() => type === 'previous' ? setPreviousYearFile(null) : setCurrentYearFile(null)}
            className="mt-3 w-full text-sm text-gray-600 hover:text-gray-900 font-medium"
          >
            Remove file
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Upload YOY Comparison Files</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload both your previous year and current year YOY analysis files to unlock detailed brand-level insights and customer drill-downs
          </p>
        </div>

        {/* Upload Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <FileUploadCard
            title="Previous Year YOY"
            subtitle="e.g., 2024 YOY Analysis"
            file={previousYearFile}
            type="previous"
            icon={<Calendar className="w-6 h-6 text-blue-600" />}
          />
          <FileUploadCard
            title="Current Year YOY"
            subtitle="e.g., 2025 YOY Analysis"
            file={currentYearFile}
            type="current"
            icon={<Calendar className="w-6 h-6 text-green-600" />}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800">
              Files processed successfully! Redirecting to dashboard...
            </p>
          </div>
        )}

        {/* Upload Button */}
        {previousYearFile && currentYearFile && !success && (
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full px-6 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg shadow-lg shadow-blue-500/30"
          >
            {uploading ? (
              <>
                <Loader className="w-6 h-6 animate-spin" />
                Processing files and generating insights...
              </>
            ) : (
              <>
                <Upload className="w-6 h-6" />
                Process & View Dashboard
              </>
            )}
          </button>
        )}

        {/* Instructions */}
        <div className="mt-12 bg-blue-50 rounded-xl p-8 border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Why Two Files?</h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">✓</span>
              <span><strong>Brand-Level Insights:</strong> Compare customer purchases by brand (Modern Art, G.V.X., Modern Times, etc.) year-over-year</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">✓</span>
              <span><strong>Color Group Drill-Down:</strong> Click on any frame color category to see exactly which customers stopped buying that color</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">✓</span>
              <span><strong>Lost Opportunity Analysis:</strong> Identify customers who bought specific brands last year but didn't this year</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">✓</span>
              <span><strong>Actionable Targets:</strong> Get a prioritized list of customers to contact about re-introducing specific frame colors</span>
            </li>
          </ul>
        </div>

        {/* Expected Format */}
        <div className="mt-8 bg-gray-50 rounded-xl p-8 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Expected File Format</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-gray-400 mt-1">•</span>
              <span>Excel files (.xlsx or .xls) with YOY sales data</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-400 mt-1">•</span>
              <span>Summary section in rows 0-23 with overall sales metrics and frame categories</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-400 mt-1">•</span>
              <span>Account details starting at row 24 with brand columns (MODERN ART, G.V.X., MODZ TITANIUM, etc.)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-400 mt-1">•</span>
              <span>Both files should have the same structure, just different time periods</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
