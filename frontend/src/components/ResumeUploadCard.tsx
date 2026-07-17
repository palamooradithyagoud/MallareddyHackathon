import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, Play } from 'lucide-react';
import { resumeService } from '../services/api';

interface ResumeUploadCardProps {
  currentResumeUrl: string | null;
  onUploadSuccess: (url: string) => void;
  onParseStart: () => void;
  onParseSuccess: (data: any) => void;
  onParseError: (err: string) => void;
}

const ResumeUploadCard: React.FC<ResumeUploadCardProps> = ({
  currentResumeUrl,
  onUploadSuccess,
  onParseStart,
  onParseSuccess,
  onParseError,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(currentResumeUrl);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    if (ext !== 'pdf' && ext !== 'docx' && ext !== 'doc' && ext !== 'txt') {
      setErrorMsg("Invalid file type. Please upload a PDF, DOCX or TXT file.");
      setFile(null);
      return;
    }
    setErrorMsg(null);
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const data = await resumeService.uploadResume(formData);
      setUploadedUrl(data.resume_url);
      onUploadSuccess(data.resume_url);
      setFile(null); // Clear selected file once uploaded
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Failed to upload resume.");
    } finally {
      setUploading(false);
    }
  };

  const handleParse = async () => {
    if (!uploadedUrl) return;
    onParseStart();
    try {
      const data = await resumeService.parseResume();
      onParseSuccess(data);
    } catch (err: any) {
      onParseError(err.response?.data?.detail || "Parsing resume failed.");
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="glass-panel rounded-xl p-6 relative overflow-hidden h-full flex flex-col justify-between">
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
          <UploadCloud className="h-5 w-5 text-primary" />
          Resume Control Panel
        </h3>
        <p className="text-xs text-text-secondary">
          Upload your resume in PDF or Word format. The AI parser extracts education, skills, work history, and certificates automatically.
        </p>

        {/* Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
            dragActive
              ? 'border-accent bg-accent/5'
              : 'border-border hover:border-primary/50 bg-background/25'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleChange}
            accept=".pdf,.docx,.doc,.txt"
          />
          <UploadCloud className="h-10 w-10 text-text-secondary mb-3 animate-pulse-slow" />
          <p className="text-sm font-semibold text-text-primary text-center">
            {file ? file.name : "Drag & Drop or Click to Browse"}
          </p>
          <p className="text-xs text-text-muted mt-1 text-center">
            PDF, DOCX, or TXT (Max 5MB)
          </p>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Actions panel */}
        {file && (
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-button px-4 py-2.5 text-sm font-medium text-white shadow-glow-primary hover:bg-gradient-button-hover disabled:opacity-50 transition-all"
          >
            {uploading ? (
              <span className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            <span>{uploading ? "Uploading..." : "Save Resume File"}</span>
          </button>
        )}

        {/* Currently Uploaded File Info */}
        {uploadedUrl && !file && (
          <div className="flex items-center justify-between rounded-lg bg-border/40 p-3 border border-border/50">
            <div className="flex items-center gap-2.5 min-w-0">
              <FileText className="h-5 w-5 text-accent shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-text-primary truncate">
                  {uploadedUrl.split('/').pop()}
                </p>
                <p className="text-[10px] text-accent font-medium">Uploaded & Ready</p>
              </div>
            </div>
            <span className="h-2 w-2 rounded-full bg-accent shadow-glow-accent shrink-0 animate-pulse"></span>
          </div>
        )}
      </div>

      {uploadedUrl && (
        <div className="mt-6 border-t border-border/50 pt-4">
          <button
            onClick={handleParse}
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-accent text-accent px-4 py-2.5 text-sm font-semibold hover:bg-accent/10 transition-all shadow-sm shadow-accent/10"
          >
            <Play className="h-4 w-4 fill-accent" />
            <span>AI Parse Resume & Populate Profile</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ResumeUploadCard;
