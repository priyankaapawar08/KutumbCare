import { useState, useEffect } from 'react';
import { 
  uploadDocument, 
  getDocumentsByMember, 
  getAllFamilyDocuments,
  deleteDocument 
} from '../services/documentService';
import { FamilyMember } from '../services/familyService';

interface DocumentsSectionProps {
  familyMembers: FamilyMember[];
  showAddForm: boolean;
  setShowAddForm: (show: boolean) => void;
  setActiveTab: (tab: string) => void;
}

interface Document {
  _id: string;
  title: string;
  description: string;
  documentType: string;
  documentDate: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  uploadDate: string;
  tags: string[];
  memberId?: {
    name: string;
    relation: string;
  };
}

export default function DocumentsSection({ 
  familyMembers, 
  showAddForm, 
  setShowAddForm, 
  setActiveTab 
}: DocumentsSectionProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedMember, setSelectedMember] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    memberId: '',
    title: '',
    description: '',
    documentType: '',
    documentDate: '',
    tags: ''
  });

  useEffect(() => {
    loadDocuments();
  }, [selectedMember]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      
      let response;
      if (selectedMember === 'all') {
        response = await getAllFamilyDocuments();
      } else {
        response = await getDocumentsByMember(selectedMember);
      }
      
      if (response.success) {
        setDocuments(response.documents || []);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      alert('Please select a file');
      return;
    }

    if (!formData.memberId || !formData.title || !formData.documentType) {
      alert('Please fill all required fields');
      return;
    }

    try {
      setUploading(true);

      const uploadData = new FormData();
      uploadData.append('document', selectedFile);
      uploadData.append('memberId', formData.memberId);
      uploadData.append('title', formData.title);
      uploadData.append('description', formData.description);
      uploadData.append('documentType', formData.documentType);
      uploadData.append('documentDate', formData.documentDate || new Date().toISOString());
      uploadData.append('tags', JSON.stringify(formData.tags.split(',').map(t => t.trim())));

      const result = await uploadDocument(uploadData);

      if (result.success) {
        alert('✅ Document uploaded successfully!');
        setShowAddForm(false);
        setFormData({
          memberId: '',
          title: '',
          description: '',
          documentType: '',
          documentDate: '',
          tags: ''
        });
        setSelectedFile(null);
        loadDocuments();
      }
    } catch (error: any) {
      alert('❌ Upload failed: ' + (error.error || error.message));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId: string, title: string) => {
    const confirmed = window.confirm(`⚠️ Are you sure you want to delete "${title}"?`);
    if (!confirmed) return;

    try {
      const result = await deleteDocument(documentId);
      if (result.success) {
        alert('✅ Document deleted successfully');
        loadDocuments();
      }
    } catch (error: any) {
      alert('❌ Delete failed: ' + (error.error || error.message));
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('doc')) return '📝';
    return '📎';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'lab_report': 'Lab Report',
      'prescription': 'Prescription',
      'xray': 'X-Ray',
      'scan': 'Scan (CT/MRI)',
      'insurance': 'Insurance',
      'bill': 'Bill/Receipt',
      'other': 'Other'
    };
    return labels[type] || type;
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      {familyMembers.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4 opacity-30">📄</div>
          <p className="text-gray-500 text-lg">Add family members first to upload documents</p>
          <button
            onClick={() => setActiveTab("members")}
            className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Go to Family Members
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Medical Documents</h2>
            <p className="text-gray-600 text-sm">Store and manage medical records, reports, and prescriptions</p>
          </div>

          {/* Filter */}
          {!showAddForm && (
            <div className="mb-6 bg-gray-50 p-4 rounded-xl">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                📂 Filter by Family Member
              </label>
              <select
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
                className="w-full p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="all">All Family Members</option>
                {familyMembers.map((member: FamilyMember) => (
                  <option key={member._id} value={member._id}>
                    {member.name} ({member.relation})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Upload Form */}
          {showAddForm && (
            <div className="bg-blue-50 p-6 rounded-xl mb-6 border-2 border-blue-200">
              <h3 className="text-xl font-bold mb-4 text-blue-700">📤 Upload Document</h3>
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Family Member *
                  </label>
                  <select
                    value={formData.memberId}
                    onChange={(e) => setFormData({...formData, memberId: e.target.value})}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select Member</option>
                    {familyMembers.map(member => (
                      <option key={member._id} value={member._id}>
                        {member.name} ({member.relation})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Blood Test Report - Dec 2024"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document Type *
                  </label>
                  <select
                    value={formData.documentType}
                    onChange={(e) => setFormData({...formData, documentType: e.target.value})}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select Type</option>
                    <option value="lab_report">Lab Report</option>
                    <option value="prescription">Prescription</option>
                    <option value="xray">X-Ray</option>
                    <option value="scan">Scan (CT/MRI)</option>
                    <option value="insurance">Insurance Document</option>
                    <option value="bill">Bill/Receipt</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document Date
                  </label>
                  <input
                    type="date"
                    value={formData.documentDate}
                    onChange={(e) => setFormData({...formData, documentDate: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    placeholder="Additional notes about this document..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., diabetes, cardiac, routine-checkup"
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload File * (PDF, JPG, PNG, DOC - Max 10MB)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleFileSelect}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                  {selectedFile && (
                    <p className="text-sm text-gray-600 mt-2">
                      Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                    </p>
                  )}
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold flex items-center justify-center space-x-2"
                  >
                    {uploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <span>📤</span>
                        <span>Upload Document</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setSelectedFile(null);
                      setFormData({
                        memberId: '',
                        title: '',
                        description: '',
                        documentType: '',
                        documentDate: '',
                        tags: ''
                      });
                    }}
                    className="flex-1 bg-gray-500 text-white p-3 rounded-lg hover:bg-gray-600 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Documents List */}
          {!showAddForm && (
            <>
              <div className="flex justify-between items-center mb-4">
                <p className="text-gray-600">
                  {documents.length} document(s) found
                </p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold flex items-center space-x-2"
                >
                  <span>➕</span>
                  <span>Upload Document</span>
                </button>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading documents...</p>
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <div className="text-6xl mb-4 opacity-30">📄</div>
                  <p className="text-gray-500 text-lg font-medium mb-2">No documents uploaded yet</p>
                  <p className="text-gray-400 text-sm mb-6">Start uploading medical records and documents</p>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
                  >
                    Upload First Document
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {documents.map((doc: Document) => (
                    <div key={doc._id} className="border-2 border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-blue-300 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="text-4xl">{getFileIcon(doc.fileType)}</div>
                          <div>
                            <h4 className="font-bold text-gray-900">{doc.title}</h4>
                            <p className="text-xs text-gray-500">
                              {doc.memberId?.name || 'Unknown'} 
                              {doc.memberId?.relation && ` (${doc.memberId.relation})`}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600 mb-3">
                        <p>
                          <span className="font-medium">Type:</span> {getDocumentTypeLabel(doc.documentType)}
                        </p>
                        <p>
                          <span className="font-medium">Date:</span> {new Date(doc.documentDate).toLocaleDateString()}
                        </p>
                        <p>
                          <span className="font-medium">Size:</span> {formatFileSize(doc.fileSize)}
                        </p>
                        {doc.description && (
                          <p className="text-xs italic">{doc.description}</p>
                        )}
                        {doc.tags && doc.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {doc.tags.map((tag: string, idx: number) => (
                              <span key={idx} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-200">
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-50 text-blue-600 py-2 px-3 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm flex items-center justify-center space-x-1"
                        >
                          <span>👁️</span>
                          <span>View</span>
                        </a>
                        <button
                          onClick={() => handleDelete(doc._id, doc.title)}
                          className="bg-red-50 text-red-600 py-2 px-3 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm flex items-center justify-center space-x-1"
                        >
                          <span>🗑️</span>
                          <span>Delete</span>
                        </button>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                        <p>Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}