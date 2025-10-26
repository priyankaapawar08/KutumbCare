

// src/pages/Auth/Dashboard.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";


import { 
  addFamilyMember, 
  getFamilyMembers, 
  FamilyMember, 
  getUserFamily, 
  createFamily, 
   
} from "../../services/familyService";
import { 
  addVitalSign, 
  VitalSign, 
  getVitalsByMember, 
  deleteVitalSign 
} from "../../services/vitalsService";

import { addAppointment } from "../../services/appointmentService";
import { Appointment } from "../../types";
import { deleteFamilyMember } from "../../services/memberService";
import { addMedication, Medication, getMedicationsByMember, deleteMedication } from "../../services/medicationService";


interface User {
  name: string;     
  email: string;
  role: string;
}


// Remove this line:
// import DocumentsSection from '../components/DocumentsSection';

// Add this BEFORE the main Dashboard component (around line 1100 or so)
// Right after the MedicationsSection component

interface DocumentsSectionProps {
  familyMembers: FamilyMember[];
  showAddForm: boolean;
  setShowAddForm: (show: boolean) => void;
  setActiveTab: (tab: string) => void;
}
interface DocumentsManagerProps {
  familyMembers: FamilyMember[];
}

const DocumentsManager = ({ familyMembers }: DocumentsManagerProps) => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
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
      
      const token = localStorage.getItem('token');
      const API_URL = 'http://localhost:5000/api';
      
      let url = `${API_URL}/documents/family`;
      if (selectedMember !== 'all') {
        url = `${API_URL}/documents/member/${selectedMember}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setDocuments(data.documents || []);
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
      uploadData.append('tags', JSON.stringify(formData.tags.split(',').map(t => t.trim()).filter(t => t)));

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/documents/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadData
      });

      const result = await response.json();

      if (result.success) {
        alert('✅ Document uploaded successfully!');
        setShowUploadForm(false);
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
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error: any) {
      alert('❌ Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId: string, title: string) => {
    const confirmed = window.confirm(`⚠️ Are you sure you want to delete "${title}"?`);
    if (!confirmed) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (result.success) {
        alert('✅ Document deleted successfully');
        loadDocuments();
      }
    } catch (error: any) {
      alert('❌ Delete failed: ' + error.message);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels: any = {
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

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('doc')) return '📝';
    return '📎';
  };

  if (familyMembers.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="text-center py-12">
          <div className="text-6xl mb-4 opacity-30">📄</div>
          <p className="text-gray-500 text-lg">Add family members first to upload documents</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">📄 Medical Documents</h2>
        <p className="text-gray-600 text-sm">Store and manage medical records, reports, and prescriptions</p>
      </div>

      {!showUploadForm && (
        <div className="mb-6 bg-gray-50 p-4 rounded-xl">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Filter by Family Member
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

      {showUploadForm ? (
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
                {familyMembers.map((member: FamilyMember) => (
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
                placeholder="Additional notes..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
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
                  setShowUploadForm(false);
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
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-600">
              {documents.length} document(s) found
            </p>
            <button
              onClick={() => setShowUploadForm(true)}
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
                onClick={() => setShowUploadForm(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
              >
                Upload First Document
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc: any) => (
                <div key={doc._id} className="border-2 border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-blue-300 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="text-4xl">{getFileIcon(doc.fileType)}</div>
                      <div>
                        <h4 className="font-bold text-gray-900">{doc.title}</h4>
                        <p className="text-xs text-gray-500">
                          {doc.memberId?.name || 'Unknown'}
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
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-200">
                    <button
                      className="bg-blue-50 text-blue-600 py-2 px-3 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm flex items-center justify-center space-x-1"
                    >
                      <span>👁️</span>
                      <span>View</span>
                    </button>
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
  );
};
interface LifestylePredictorProps {
  familyMembers: FamilyMember[];
}

const LifestylePredictor = ({ familyMembers }: LifestylePredictorProps) => {
  const [formData, setFormData] = useState({
    memberId: '',
    sex: '',
    diet: '',
    activity: '',
    addiction: ''
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/lifestyle/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          sex: formData.sex,
          diet: formData.diet,
          activity: formData.activity,
          addiction: formData.addiction
        })
      });

      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      alert('Prediction failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        🔮 Lifestyle Health Predictor
      </h2>

      <form onSubmit={handlePredict} className="space-y-4 max-w-2xl">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Family Member
          </label>
          <select
            value={formData.memberId}
            onChange={(e) => setFormData({...formData, memberId: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="">Select member (optional)</option>
            {familyMembers.map(member => (
              <option key={member._id} value={member._id}>
                {member.name} ({member.relation})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sex *</label>
          <select
            value={formData.sex}
            onChange={(e) => setFormData({...formData, sex: e.target.value})}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="">Select</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Diet *</label>
          <select
            value={formData.diet}
            onChange={(e) => setFormData({...formData, diet: e.target.value})}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="">Select</option>
            <option value="Vegetarian">Vegetarian</option>
            <option value="Non-Vegetarian">Non-Vegetarian</option>
            <option value="Vegan">Vegan</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Physical Activity *</label>
          <select
            value={formData.activity}
            onChange={(e) => setFormData({...formData, activity: e.target.value})}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="">Select</option>
            <option value="Low">Low</option>
            <option value="Moderate">Moderate</option>
            <option value="High">High</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Addiction *</label>
          <select
            value={formData.addiction}
            onChange={(e) => setFormData({...formData, addiction: e.target.value})}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="">Select</option>
            <option value="None">None</option>
            <option value="Smoking">Smoking</option>
            <option value="Alcohol">Alcohol</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-pink-600 text-white p-3 rounded-lg hover:bg-pink-700 disabled:bg-gray-400 font-semibold flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <span>🔮</span>
              <span>Predict Lifestyle</span>
            </>
          )}
        </button>
      </form>

      {result && result.success && (
        <div className="mt-6 p-6 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border-2 border-pink-200">
          <h3 className="text-xl font-bold mb-3">Prediction Results:</h3>
          <div className="space-y-2">
            <p className="text-lg">
              <span className="font-semibold">Lifestyle:</span>{' '}
              <span className={`font-bold text-2xl ${
                result.prediction === 'Healthy' ? 'text-green-600' :
                result.prediction === 'Moderate' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {result.prediction}
              </span>
            </p>
            <p className="text-lg">
              <span className="font-semibold">Confidence:</span>{' '}
              <span className="font-bold">{result.confidence}</span>
            </p>
          </div>
        </div>
      )}

      {result && !result.success && (
        <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
          <p className="text-red-600">❌ {result.error}</p>
        </div>
      )}
    </div>
  );
};
export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User>({ name: "User", email: "user@example.com", role: "member" });
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [hasFamily, setHasFamily] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    loadFamilyData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadFamilyData = async () => {
  try {
    console.log('🟡 [DASHBOARD] Loading family members...');
    const membersData = await getFamilyMembers();
    console.log('✅ [DASHBOARD] API response:', membersData);
    
    if (membersData.success) {
      console.log('✅ [DASHBOARD] Members data:', membersData.members);
      setFamilyMembers(membersData.members || []);
      setHasFamily(membersData.members && membersData.members.length > 0);
    } else {
      console.log('❌ [DASHBOARD] API returned success: false');
    }
  } catch (error) {
    console.error('❌ [DASHBOARD] Failed to load members:', error);
    setHasFamily(false);
    setFamilyMembers([]);
  }
};
  // Add this debug function
useEffect(() => {
  console.log('🔍 [DEBUG] Family members state:', familyMembers);
  console.log('🔍 [DEBUG] Family members length:', familyMembers.length);
  console.log('🔍 [DEBUG] Has family:', hasFamily);
}, [familyMembers, hasFamily]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleLogoClick = () => {
    setActiveTab("dashboard");
    setShowAddForm(false);
  };

  // Add this component BEFORE the Dashboard component
interface LifestylePredictorProps {
  familyMembers: FamilyMember[];
}


  const handleAddData = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  
  try {
    let result: any;
    
    switch (activeTab) {
      case "members":
        const requiredFields = ['name', 'age', 'gender', 'relation'];
        const missingFields = requiredFields.filter(field => !formData[field]);
        
        if (missingFields.length > 0) {
          throw new Error(`Please fill all fields: ${missingFields.join(', ')}`);
        }

        const memberData = {
          name: formData.name,
          age: formData.age,
          gender: formData.gender,
          relation: formData.relation,
          bloodGroup: formData.bloodGroup || 'unknown'
        };

        console.log('🟡 [FRONTEND] Adding member:', memberData);
        result = await addFamilyMember(memberData);
        break;
      
      case "vital":
        if (!formData.memberId || !formData.type || !formData.value || !formData.unit) {
          throw new Error('Please fill all required fields: Member, Type, Value, and Unit');
        }

        if (familyMembers.length === 0) {
          throw new Error("Please add family members first");
        }

        const now = new Date();
        const currentDate = now.toISOString().split('T')[0];
        const currentTime = now.toTimeString().slice(0, 5);

        let vitalValue: any = {
          unit: formData.unit
        };

        if (formData.type === 'blood_pressure') {
          const bpParts = formData.value.toString().split('/');
          if (bpParts.length === 2) {
            vitalValue.systolic = parseInt(bpParts[0]);
            vitalValue.diastolic = parseInt(bpParts[1]);
          } else {
            vitalValue.measurement = parseFloat(formData.value);
          }
        } else {
          vitalValue.measurement = parseFloat(formData.value);
        }

        result = await addVitalSign({
          memberId: formData.memberId,
          vitalType: formData.type,
          value: vitalValue,
          date: currentDate,
          time: currentTime,
          notes: formData.notes || ''
        });
        break;
      
      case "medications":
        if (!formData.memberId || !formData.name || !formData.dosage || 
            !formData.frequency || !formData.startDate) {
          throw new Error('Please fill all required fields');
        }

        if (familyMembers.length === 0) {
          throw new Error("Please add family members first");
        }

        result = await addMedication({
          memberId: formData.memberId,
          medicationName: formData.name,
          dosage: formData.dosage,
          frequency: formData.frequency,
          timing: formData.timing || [],
          startDate: formData.startDate,
          endDate: formData.endDate || undefined,
          prescribedBy: formData.prescribedBy || '',
          purpose: formData.purpose || '',
          instructions: formData.instructions || '',
          notes: formData.notes || '',
          isActive: true,
          reminderEnabled: formData.reminderEnabled !== false
        });
        break;
      
      case "appointment":
        const requiredApptFields = ['memberId', 'title', 'doctor', 'date', 'time'];
        const missingApptFields = requiredApptFields.filter(field => !formData[field]);
        
        if (missingApptFields.length > 0) {
          throw new Error(`Missing required fields: ${missingApptFields.join(', ')}`);
        }

        if (familyMembers.length === 0) {
          throw new Error("Please add family members first");
        }

        result = await addAppointment({
          member: formData.memberId,
          title: formData.title,
          doctor: formData.doctor,
          date: formData.date,
          time: formData.time,
          location: formData.location || '',
          notes: formData.notes || ''
        });
        break;
    }

    // Check if result exists and has success property
    if (result && result.success) {
      setShowAddForm(false);
      setFormData({});
      await loadFamilyData();
      
      const itemType = activeTab === "members" ? "Member" : 
                       activeTab === "vital" ? "Vital Sign" :
                       activeTab === "medications" ? "Medication" : "Appointment";
      alert(`✅ ${itemType} added successfully!`);
    } else {
      // If no success property, check for error
      throw new Error(result?.error || result?.message || "Failed to add data");
    }
    
  } catch (error) {
    console.error('❌ [FRONTEND] Error adding data:', error);
    
    const errorMessage = error instanceof Error ? error.message : "Something went wrong!";
    alert(`❌ Error: ${errorMessage}`);
  } finally {
    setLoading(false);
  }
};

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊", color: "blue" },
    { id: "vital", label: "Vital Signs", icon: "❤️", color: "red" },
    { id: "medications", label: "Medications", icon: "💊", color: "green" },
    { id: "appointment", label: "Appointments", icon: "📅", color: "purple" },
    { id: "documents", label: "Documents", icon: "📄", color: "indigo" },
    { id: "lifestyle", label: "Lifestyle Predictor", icon: "🔮", color: "pink" },
  ];

  const stats = [
    { label: "Family Members", value: familyMembers.length.toString(), icon: "👨‍👩‍👧‍👦", color: "blue", change: "+0" },
    { label: "Active Medications", value: "0", icon: "💊", color: "green", change: "0" },
    { label: "Upcoming Appointments", value: "0", icon: "📅", color: "purple", change: "0" },
    { label: "Health Score", value: "0%", icon: "⭐", color: "yellow", change: "0%" },
  ];


  // Inside Dashboard component
const handleDeleteMember = async (memberId: string, memberName: string) => {
  const confirmed = window.confirm(
    `⚠️ Are you sure you want to delete ${memberName}?\n\nThis action cannot be undone. All health data for this member will be permanently removed.`
  );

  if (!confirmed) return;

  try {
    setLoading(true);
    
    const result = await deleteFamilyMember(memberId);

    if (result.success) {
      alert(`✅ ${memberName} has been deleted successfully`);
      await loadFamilyData();
    } else {
      throw new Error(result.error);
    }
  } catch (error: any) {
    console.error('Delete error:', error);
    alert('❌ Failed to delete member: ' + error.message);
  } finally {
    setLoading(false);
  }
};

const renderLifestyle = () => {
  return <LifestylePredictor familyMembers={familyMembers} />;
};
  const renderAddForm = () => {
  if (!showAddForm) return null;

  switch (activeTab) {
    case "members":
      return (
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-6 border-2 border-blue-200">
          <h3 className="text-xl font-bold mb-4 text-blue-600">Add Family Member</h3>
          <form onSubmit={handleAddData} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                placeholder="Enter full name"
                value={formData.name || ""}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Relationship *</label>
              <select
                value={formData.relation || ""}
                onChange={(e) => setFormData({...formData, relation: e.target.value})}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Relationship</option>
                <option value="self">Self</option>
                <option value="spouse">Spouse</option>
                <option value="father">Father</option>
                <option value="mother">Mother</option>
                <option value="son">Son</option>
                <option value="daughter">Daughter</option>
                <option value="brother">Brother</option>
                <option value="sister">Sister</option>
                <option value="grandfather">Grandfather</option>
                <option value="grandmother">Grandmother</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
              <input
                type="number"
                placeholder="Enter age"
                value={formData.age || ""}
                onChange={(e) => setFormData({...formData, age: parseInt(e.target.value)})}
                required
                min="0"
                max="120"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
              <select
                value={formData.gender || ""}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
              <select
                value={formData.bloodGroup || ""}
                onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>
            <div className="md:col-span-2 flex gap-4 mt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-semibold flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Adding Member...</span>
                  </>
                ) : (
                  <>
                    <span>✓</span>
                    <span>Add Family Member</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({});
                }}
                className="flex-1 bg-gray-500 text-white p-3 rounded-lg hover:bg-gray-600 transition-colors font-semibold flex items-center justify-center space-x-2"
              >
                <span>✕</span>
                <span>Cancel</span>
              </button>
            </div>
          </form>
        </div>
      );

    case "vital":
      return (
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-6 border-2 border-red-200">
          <h3 className="text-xl font-bold mb-4 text-red-600">Add Vital Sign</h3>
          <form onSubmit={handleAddData} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Family Member *</label>
              <select
                value={formData.memberId || ""}
                onChange={(e) => setFormData({...formData, memberId: e.target.value})}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Select Family Member</option>
                {familyMembers.map(member => (
                  <option key={member._id} value={member._id}>
                    {member.name} ({member.relation}, {member.age}y)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vital Type *</label>
              <select
                value={formData.type || ""}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Select Vital Type</option>
                <option value="blood_pressure">Blood Pressure</option>
                <option value="heart_rate">Heart Rate</option>
                <option value="temperature">Temperature</option>
                <option value="blood_sugar">Blood Sugar</option>
                <option value="oxygen_saturation">Oxygen Saturation</option>
                <option value="respiratory_rate">Respiratory Rate</option>
                <option value="weight">Weight</option>
                <option value="height">Height</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Value *</label>
              <input
                type="number"
                step="0.1"
                placeholder="Enter value"
                value={formData.value || ""}
                onChange={(e) => setFormData({...formData, value: parseFloat(e.target.value)})}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
              <input
                type="text"
                placeholder="e.g., bpm, °C, mmHg"
                value={formData.unit || ""}
                onChange={(e) => setFormData({...formData, unit: e.target.value})}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
              <textarea
                placeholder="Any additional notes..."
                value={formData.notes || ""}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="md:col-span-2 flex gap-4 mt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors font-semibold flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Adding Vital...</span>
                  </>
                ) : (
                  <>
                    <span>❤️</span>
                    <span>Add Vital Sign</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({});
                }}
                className="flex-1 bg-gray-500 text-white p-3 rounded-lg hover:bg-gray-600 transition-colors font-semibold flex items-center justify-center space-x-2"
              >
                <span>✕</span>
                <span>Cancel</span>
              </button>
            </div>
          </form>
        </div>
      );

    case "medications":
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg mb-6 border-2 border-green-200">
      <h3 className="text-xl font-bold mb-4 text-green-600">Add Medication</h3>
      <form onSubmit={handleAddData} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Family Member *</label>
          <select
            value={formData.memberId || ""}
            onChange={(e) => setFormData({...formData, memberId: e.target.value})}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Select Family Member</option>
            {familyMembers.map(member => (
              <option key={member._id} value={member._id}>
                {member.name} ({member.relation}, {member.age}y)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Medication Name *</label>
          <input
            type="text"
            placeholder="Enter medication name"
            value={formData.name || ""}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dosage *</label>
          <input
            type="text"
            placeholder="e.g., 500mg, 1 tablet"
            value={formData.dosage || ""}
            onChange={(e) => setFormData({...formData, dosage: e.target.value})}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Frequency *</label>
          <select
            value={formData.frequency || ""}
            onChange={(e) => setFormData({...formData, frequency: e.target.value})}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Select Frequency</option>
            <option value="once_daily">Once Daily</option>
            <option value="twice_daily">Twice Daily</option>
            <option value="thrice_daily">Thrice Daily (3 times)</option>
            <option value="four_times_daily">Four Times Daily</option>
            <option value="as_needed">As Needed</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Timing</label>
          <select
            multiple
            value={formData.timing || []}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, option => option.value);
              setFormData({...formData, timing: selected});
            }}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 h-32"
          >
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
            <option value="evening">Evening</option>
            <option value="night">Night</option>
            <option value="before_meal">Before Meal</option>
            <option value="after_meal">After Meal</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
          <input
            type="date"
            value={formData.startDate || ""}
            onChange={(e) => setFormData({...formData, startDate: e.target.value})}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date (Optional)</label>
          <input
            type="date"
            value={formData.endDate || ""}
            onChange={(e) => setFormData({...formData, endDate: e.target.value})}
            min={formData.startDate}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prescribed By</label>
          <input
            type="text"
            placeholder="Doctor's name"
            value={formData.prescribedBy || ""}
            onChange={(e) => setFormData({...formData, prescribedBy: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
          <input
            type="text"
            placeholder="What is this medication for?"
            value={formData.purpose || ""}
            onChange={(e) => setFormData({...formData, purpose: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Instructions (Optional)</label>
          <textarea
            placeholder="Special instructions for taking this medication..."
            value={formData.instructions || ""}
            onChange={(e) => setFormData({...formData, instructions: e.target.value})}
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
          <textarea
            placeholder="Any additional notes..."
            value={formData.notes || ""}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            rows={2}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="md:col-span-2 flex items-center space-x-2 bg-blue-50 p-3 rounded-lg">
          <input
            type="checkbox"
            id="reminderEnabled"
            checked={formData.reminderEnabled !== false}
            onChange={(e) => setFormData({...formData, reminderEnabled: e.target.checked})}
            className="w-4 h-4"
          />
          <label htmlFor="reminderEnabled" className="text-sm text-gray-700">
            🔔 Enable medication reminders (coming soon)
          </label>
        </div>

        <div className="md:col-span-2 flex gap-4 mt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors font-semibold flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Adding Medication...</span>
              </>
            ) : (
              <>
                <span>💊</span>
                <span>Add Medication</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowAddForm(false);
              setFormData({});
            }}
            className="flex-1 bg-gray-500 text-white p-3 rounded-lg hover:bg-gray-600 transition-colors font-semibold flex items-center justify-center space-x-2"
          >
            <span>✕</span>
            <span>Cancel</span>
          </button>
        </div>
      </form>
    </div>
  );

    case "appointment":
      return (
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-6 border-2 border-purple-200">
          <h3 className="text-xl font-bold mb-4 text-purple-600">Add Appointment</h3>
          <form onSubmit={handleAddData} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Family Member *</label>
              <select
                value={formData.memberId || ""}
                onChange={(e) => setFormData({...formData, memberId: e.target.value})}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select Family Member</option>
                {familyMembers.map(member => (
                  <option key={member._id} value={member._id}>
                    {member.name} ({member.relation}, {member.age}y)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Title *</label>
              <input
                type="text"
                placeholder="e.g., Regular Checkup, Specialist Visit"
                value={formData.title || ""}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Doctor *</label>
              <input
                type="text"
                placeholder="Doctor's name"
                value={formData.doctor || ""}
                onChange={(e) => setFormData({...formData, doctor: e.target.value})}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input
                type="date"
                value={formData.date || ""}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
              <input
                type="time"
                value={formData.time || ""}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Location (Optional)</label>
              <input
                type="text"
                placeholder="Hospital/Clinic address"
                value={formData.location || ""}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
              <textarea
                placeholder="Any notes about the appointment..."
                value={formData.notes || ""}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="md:col-span-2 flex gap-4 mt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors font-semibold flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Adding Appointment...</span>
                  </>
                ) : (
                  <>
                    <span>📅</span>
                    <span>Add Appointment</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({});
                }}
                className="flex-1 bg-gray-500 text-white p-3 rounded-lg hover:bg-gray-600 transition-colors font-semibold flex items-center justify-center space-x-2"
              >
                <span>✕</span>
                <span>Cancel</span>
              </button>
            </div>
          </form>
        </div>
      );

    default:
      return null;
  }
};

  const renderContent = () => {
  return (
    <div className="space-y-6">
      {/* Header with Add Button - Only show for non-dashboard tabs */}
      {activeTab !== "dashboard" && (
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 capitalize">{activeTab.replace('_', ' ')}</h2>
            <p className="text-sm text-gray-500">Manage your family's health data</p>
          </div>
          {!showAddForm && activeTab !== "documents" &&(
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center space-x-2"
            >
              <span>➕</span>
              <span>Add {activeTab === "members" ? "Member" : activeTab}</span>
            </button>
          )}
          {showAddForm && (
            <button
              onClick={() => {
                setShowAddForm(false);
                setFormData({});
              }}
              className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors font-semibold flex items-center space-x-2"
            >
              <span>❌</span>
              <span>Cancel</span>
            </button>
          )}
        </div>
      )}

      {/* Add Form */}
      {showAddForm && renderAddForm()}

      {/* Content based on active tab */}
      {activeTab === "dashboard" && renderDashboard()}
      {activeTab === "members" && renderMembers()}
      {activeTab === "vital" && renderVitals()}
      {activeTab === "medications" && renderMedications()}
      {activeTab === "appointment" && renderAppointments()}
      {activeTab === "documents" && renderDocuments()} {/* NEW */}
      {activeTab === "lifestyle" && renderLifestyle()}
    </div>
  );
};
  const renderDashboard = () => {
    return (
      <>
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">Welcome to KutumbCare, {user.name}! 👋</h1>
          <p className="text-blue-100">
            {familyMembers.length > 0 
              ? `You're tracking health data for ${familyMembers.length} family member${familyMembers.length > 1 ? 's' : ''}`
              : "Start by adding your first family member to track health data."
            }
          </p>
          <div className="mt-4 text-sm text-blue-100">
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className={`text-xs font-medium ${
                    stat.change.startsWith('+') ? 'text-green-500' : 
                    stat.change.startsWith('-') ? 'text-red-500' : 'text-gray-400'
                  }`}>
                    {stat.change} from last week
                  </p>
                </div>
                <div className="text-3xl">{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">📈</span> Recent Activity
            </h3>
            <div className="space-y-4">
              {familyMembers.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2 opacity-30">📝</div>
                  <p className="text-gray-500">No activity yet</p>
                  <p className="text-gray-400 text-sm">Add family members to see activity</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Start adding health data to see activity</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">⚡</span> Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {menuItems.slice(1).map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setShowAddForm(false);
                  }}
                  className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-center group border border-gray-200"
                >
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{item.label}</p>
                </button>
              ))}
            </div>
            {familyMembers.length === 0 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-700 text-center">
                  ⚠️ Add family members first to use these features
                </p>
              </div>
            )}
          </div>
        </div>
      </>
    );
  };

  const renderMembers = () => {
  const handleDeleteMember = async (memberId: string, memberName: string) => {
    const confirmed = window.confirm(
      `⚠️ Are you sure you want to delete ${memberName}?\n\nThis action cannot be undone. All health data for this member will be permanently removed.`
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      
      const result = await deleteFamilyMember(memberId);

      if (result.success) {
        alert(`✅ ${memberName} has been deleted successfully`);
        await loadFamilyData();
      } else {
        throw new Error(result.error || 'Failed to delete member');
      }
    } catch (error: any) {
      console.error('Delete error:', error);
      alert('❌ Failed to delete member: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      {familyMembers.length === 0 && !showAddForm ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4 opacity-30">👥</div>
          <p className="text-gray-500 text-lg">No family members added yet</p>
          <p className="text-gray-400 text-sm mt-2 mb-6">Add your first family member to get started</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Add First Family Member
          </button>
        </div>
      ) : (
        <div>
          {/* Removed the duplicate button from here */}
          <h3 className="text-xl font-bold text-gray-800 mb-6">
            Family Members ({familyMembers.length})
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {familyMembers.map((member: FamilyMember) => (
              <div 
                key={member._id} 
                className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 bg-white transform hover:-translate-y-1 hover:border-blue-300"
              >
                {/* ... rest of member card code stays the same ... */}
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xl">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg">{member.name}</h3>
                    <p className="text-sm text-gray-600 capitalize">{member.relation}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>{member.age} years</span>
                      <span>•</span>
                      <span className="capitalize">{member.gender}</span>
                    </div>
                    {member.bloodGroup && member.bloodGroup !== 'unknown' && (
                      <div className="mt-2">
                        <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                          Blood: {member.bloodGroup}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => navigate(`/member/${member._id}`)}
                    className="bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm flex items-center justify-center space-x-1"
                  >
                    <span>👁️</span>
                    <span>View</span>
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteMember(member._id, member.name);
                    }}
                    disabled={loading}
                    className="bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm flex items-center justify-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>🗑️</span>
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

  const renderVitals = () => {
  // Move these state declarations OUTSIDE of renderVitals and put them at the top with other state
  // For now, let's create a component-level approach

  return (
    <VitalsSection 
      familyMembers={familyMembers} 
      showAddForm={showAddForm}
      setShowAddForm={setShowAddForm}
      setActiveTab={setActiveTab}
    />
  );
};

// Add this new component BEFORE the return statement of Dashboard component
// Add this component BEFORE the main Dashboard component's return statement
const VitalsSection = ({ familyMembers, showAddForm, setShowAddForm, setActiveTab }: any) => {
  const [vitalsData, setVitalsData] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [selectedMemberName, setSelectedMemberName] = useState<string>('');
  const [loadingVitals, setLoadingVitals] = useState(false);

  const loadVitals = async (memberId: string) => {
    try {
      setLoadingVitals(true);
      console.log('🟡 Loading vitals for member:', memberId);
      const response = await getVitalsByMember(memberId);
      console.log('✅ Vitals response:', response);
      if (response.success) {
        setVitalsData(response.vitals || []);
      } else {
        console.error('❌ Failed to load vitals:', response.error);
        setVitalsData([]);
      }
    } catch (error) {
      console.error('❌ Error loading vitals:', error);
      setVitalsData([]);
    } finally {
      setLoadingVitals(false);
    }
  };

  const handleMemberSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const memberId = e.target.value;
    console.log('🟡 Member selected:', memberId);
    
    if (!memberId) {
      setSelectedMember('');
      setSelectedMemberName('');
      setVitalsData([]);
      return;
    }

    setSelectedMember(memberId);
    
    // Find member name
    const member = familyMembers.find((m: FamilyMember) => m._id === memberId);
    if (member) {
      setSelectedMemberName(member.name);
    }
    
    loadVitals(memberId);
  };

  const handleDeleteVital = async (vitalId: string) => {
    const confirmed = window.confirm('⚠️ Are you sure you want to delete this vital record?\n\nThis action cannot be undone.');
    if (!confirmed) return;

    try {
      const result = await deleteVitalSign(vitalId);
      if (result.success) {
        alert('✅ Vital record deleted successfully');
        if (selectedMember) {
          loadVitals(selectedMember);
        }
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      alert('❌ Failed to delete: ' + error.message);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      {familyMembers.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4 opacity-30">❤️</div>
          <p className="text-gray-500 text-lg">Add family members first to record vital signs</p>
          <button
            onClick={() => setActiveTab("members")}
            className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Go to Family Members
          </button>
        </div>
      ) : (
        <div>
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Vital Signs Tracking</h2>
            <p className="text-gray-600 text-sm">Monitor health metrics for your family members</p>
          </div>

          {/* Member Selection - Always visible when not in add form */}
          {!showAddForm && (
            <div className="mb-6 bg-gray-50 p-4 rounded-xl">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                📊 Select Family Member
              </label>
              <select
                value={selectedMember}
                onChange={handleMemberSelect}
                className="w-full p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white text-gray-800 font-medium cursor-pointer hover:border-red-300 transition-colors"
                style={{ WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none' }}
              >
                <option value="">-- Choose a family member to view vitals --</option>
                {familyMembers.map((member: FamilyMember) => (
                  <option key={member._id} value={member._id}>
                    {member.name} ({member.relation}, {member.age} years old)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Vitals List - Only show when member is selected */}
          {selectedMember && !showAddForm ? (
            <div>
              <div className="flex justify-between items-center mb-4 bg-red-50 p-4 rounded-lg">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Vital Signs for {selectedMemberName}
                  </h3>
                  <p className="text-sm text-gray-600">{vitalsData.length} record(s) found</p>
                </div>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center space-x-2"
                >
                  <span>➕</span>
                  <span>Add Vital</span>
                </button>
              </div>

              {loadingVitals ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="mt-4 text-gray-600 font-medium">Loading vitals...</p>
                </div>
              ) : vitalsData.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <div className="text-6xl mb-4 opacity-30">📊</div>
                  <p className="text-gray-500 text-lg font-medium mb-2">No vital signs recorded yet</p>
                  <p className="text-gray-400 text-sm mb-6">Start tracking health metrics for {selectedMemberName}</p>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold inline-flex items-center space-x-2"
                  >
                    <span>➕</span>
                    <span>Add First Vital</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {vitalsData.map((vital: any) => (
                    <div key={vital._id} className="border-2 border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-red-300 transition-all bg-white">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-2xl">
                              {vital.vitalType === 'blood_pressure' ? '💓' :
                               vital.vitalType === 'temperature' ? '🌡️' :
                               vital.vitalType === 'weight' ? '⚖️' :
                               vital.vitalType === 'heart_rate' ? '💗' :
                               vital.vitalType === 'blood_sugar' ? '🩸' :
                               vital.vitalType === 'oxygen_level' ? '🫁' :
                               vital.vitalType === 'height' ? '📏' :
                               vital.vitalType === 'bmi' ? '📊' : '📈'}
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 text-lg capitalize">
                                {vital.vitalType.replace(/_/g, ' ')}
                              </h4>
                              <p className="text-sm text-gray-500 flex items-center space-x-2">
                                <span>📅 {new Date(vital.date).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}</span>
                                <span>•</span>
                                <span>🕐 {vital.time}</span>
                              </p>
                            </div>
                          </div>
                          <div className="ml-14 bg-gray-50 p-3 rounded-lg">
                            <p className="text-2xl font-bold text-gray-900">
                              {vital.value.systolic && vital.value.diastolic
                                ? `${vital.value.systolic}/${vital.value.diastolic} ${vital.value.unit}`
                                : `${vital.value.measurement} ${vital.value.unit}`
                              }
                            </p>
                            {vital.notes && (
                              <p className="text-sm text-gray-600 mt-2 italic">
                                📝 {vital.notes}
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteVital(vital._id)}
                          className="text-red-600 hover:text-white hover:bg-red-600 p-3 rounded-lg transition-all ml-4 border-2 border-red-200 hover:border-red-600"
                          title="Delete vital record"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : !showAddForm ? (
            <div className="text-center py-16 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl">
              <div className="text-7xl mb-4 opacity-40">❤️</div>
              <p className="text-gray-600 text-xl font-medium mb-2">Ready to Track Health</p>
              <p className="text-gray-500">Select a family member above to view or add vital signs</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

  const renderMedications = () => {
  return <MedicationsSection familyMembers={familyMembers} showAddForm={showAddForm} setShowAddForm={setShowAddForm} setActiveTab={setActiveTab} />;
};

// Add this AFTER VitalsSection and BEFORE the main Dashboard return
const MedicationsSection = ({ familyMembers, showAddForm, setShowAddForm, setActiveTab }: any) => {
  const [medicationsData, setMedicationsData] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [selectedMemberName, setSelectedMemberName] = useState<string>('');
  const [loadingMeds, setLoadingMeds] = useState(false);

  const loadMedications = async (memberId: string) => {
    try {
      setLoadingMeds(true);
      console.log('🟡 [DASHBOARD] Loading medications for member:', memberId);
      const response = await getMedicationsByMember(memberId);
      console.log('✅ [DASHBOARD] Medications response:', response);
      if (response.success) {
        setMedicationsData(response.medications || []);
      } else {
        console.error('❌ Failed to load medications:', response.error);
        setMedicationsData([]);
      }
    } catch (error) {
      console.error('❌ Error loading medications:', error);
      setMedicationsData([]);
    } finally {
      setLoadingMeds(false);
    }
  };

  const handleMemberSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const memberId = e.target.value;
    console.log('🟡 Selected member:', memberId);
    
    if (!memberId) {
      setSelectedMember('');
      setSelectedMemberName('');
      setMedicationsData([]);
      return;
    }

    setSelectedMember(memberId);
    const member = familyMembers.find((m: FamilyMember) => m._id === memberId);
    if (member) {
      setSelectedMemberName(member.name);
    }
    
    loadMedications(memberId);
  };

  const handleDeleteMedication = async (medicationId: string, medName: string) => {
    const confirmed = window.confirm(`⚠️ Are you sure you want to delete "${medName}"?`);
    if (!confirmed) return;

    try {
      const result = await deleteMedication(medicationId);
      if (result.success) {
        alert('✅ Medication deleted successfully');
        if (selectedMember) {
          loadMedications(selectedMember);
        }
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      alert('❌ Failed to delete: ' + error.message);
    }
  };

  const formatFrequency = (freq: string) => {
    return freq.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatTiming = (timing: string[]) => {
    if (!timing || timing.length === 0) return 'Not specified';
    return timing.map(t => t.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())).join(', ');
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      {familyMembers.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4 opacity-30">💊</div>
          <p className="text-gray-500 text-lg">Add family members first to manage medications</p>
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
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Medication Management</h2>
            <p className="text-gray-600 text-sm">Track medications for your family members</p>
          </div>

          {!showAddForm && (
            <div className="mb-6 bg-gray-50 p-4 rounded-xl">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                💊 Select Family Member
              </label>
              <select
                value={selectedMember}
                onChange={handleMemberSelect}
                className="w-full p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-800 font-medium cursor-pointer hover:border-green-300 transition-colors"
              >
                <option value="">-- Choose a family member --</option>
                {familyMembers.map((member: FamilyMember) => (
                  <option key={member._id} value={member._id}>
                    {member.name} ({member.relation}, {member.age} years old)
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedMember && !showAddForm ? (
            <div>
              <div className="flex justify-between items-center mb-4 bg-green-50 p-4 rounded-lg">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Medications for {selectedMemberName}
                  </h3>
                  <p className="text-sm text-gray-600">{medicationsData.length} medication(s)</p>
                </div>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center space-x-2"
                >
                  <span>➕</span>
                  <span>Add Medication</span>
                </button>
              </div>

              {loadingMeds ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="mt-4 text-gray-600 font-medium">Loading medications...</p>
                </div>
              ) : medicationsData.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <div className="text-6xl mb-4 opacity-30">💊</div>
                  <p className="text-gray-500 text-lg font-medium mb-2">No medications recorded yet</p>
                  <p className="text-gray-400 text-sm mb-6">Start tracking medications for {selectedMemberName}</p>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                  >
                    Add First Medication
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {medicationsData.map((med: any) => (
                    <div key={med._id} className="border-2 border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-green-300 transition-all bg-white">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
                              💊
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 text-lg">{med.medicationName}</h4>
                              <p className="text-sm text-gray-500">{med.dosage} • {formatFrequency(med.frequency)}</p>
                            </div>
                            {med.isActive && (
                              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-semibold">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="ml-14 space-y-2">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">📅 Start:</span>
                                <span className="ml-2 font-medium">{new Date(med.startDate).toLocaleDateString()}</span>
                              </div>
                              {med.endDate && (
                                <div>
                                  <span className="text-gray-600">📅 End:</span>
                                  <span className="ml-2 font-medium">{new Date(med.endDate).toLocaleDateString()}</span>
                                </div>
                              )}
                              {med.timing && med.timing.length > 0 && (
                                <div className="col-span-2">
                                  <span className="text-gray-600">🕐 Timing:</span>
                                  <span className="ml-2 font-medium">{formatTiming(med.timing)}</span>
                                </div>
                              )}
                              {med.prescribedBy && (
                                <div className="col-span-2">
                                  <span className="text-gray-600">👨‍⚕️ Doctor:</span>
                                  <span className="ml-2 font-medium">{med.prescribedBy}</span>
                                </div>
                              )}
                              {med.purpose && (
                                <div className="col-span-2">
                                  <span className="text-gray-600">💡 Purpose:</span>
                                  <span className="ml-2 font-medium">{med.purpose}</span>
                                </div>
                              )}
                            </div>
                            {med.instructions && (
                              <div className="bg-blue-50 p-3 rounded-lg mt-2">
                                <p className="text-sm text-gray-700">
                                  <span className="font-semibold">📋 Instructions:</span> {med.instructions}
                                </p>
                              </div>
                            )}
                            {med.notes && (
                              <p className="text-sm text-gray-600 italic mt-2">📝 {med.notes}</p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteMedication(med._id, med.medicationName)}
                          className="text-red-600 hover:text-white hover:bg-red-600 p-3 rounded-lg transition-all ml-4 border-2 border-red-200 hover:border-red-600"
                          title="Delete medication"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : !showAddForm ? (
            <div className="text-center py-16 bg-gradient-to-br from-green-50 to-teal-50 rounded-xl">
              <div className="text-7xl mb-4 opacity-40">💊</div>
              <p className="text-gray-600 text-xl font-medium mb-2">Ready to Track Medications</p>
              <p className="text-gray-500">Select a family member above to view or add medications</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};


  const renderAppointments = () => {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        {familyMembers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4 opacity-30">📅</div>
            <p className="text-gray-500 text-lg">Add family members first to schedule appointments</p>
            <button
              onClick={() => setActiveTab("members")}
              className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Go to Family Members
            </button>
          </div>
        ) : !showAddForm ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4 opacity-30">📅</div>
            <p className="text-gray-500 text-lg">No appointments scheduled yet</p>
            <p className="text-gray-400 text-sm mt-2">Schedule appointments for your family members</p>
          </div>
        ) : null}
      </div>
    );
  };
  const renderDocuments = () => {
  return <DocumentsManager familyMembers={familyMembers} />;
};

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`bg-white shadow-xl transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-6 border-b border-gray-200">
          <button 
            onClick={handleLogoClick}
            className="flex items-center space-x-3 w-full text-left hover:opacity-80 transition-opacity"
          >
            <div className="text-3xl">👨‍👩‍👧‍👦</div>
            {sidebarOpen && (
              <div>
                <h1 className="text-xl font-bold text-gray-800">KutumbCare</h1>
                <p className="text-xs text-gray-500">Family Health</p>
              </div>
            )}
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setShowAddForm(false);
              }}
              className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                activeTab === item.id 
                  ? `bg-${item.color}-50 text-${item.color}-600 border border-${item.color}-200` 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
          
          {/* Separate Members Button */}
          <button
            onClick={() => {
              setActiveTab("members");
              setShowAddForm(false);
            }}
            className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 mt-4 ${
              activeTab === "members" 
                ? "bg-indigo-50 text-indigo-600 border border-indigo-200" 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className="text-xl">👥</span>
            {sidebarOpen && <span className="font-medium">Family Members</span>}
          </button>
        </nav>

        {/* Toggle Sidebar Button */}
        <div className="absolute bottom-4 left-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {sidebarOpen ? "◀️" : "▶️"}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        {/* Navbar */}
<header className="bg-white shadow-sm border-b border-gray-200">
  <div className="px-6 py-4">
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">KutumbCare Dashboard</h2>
        <p className="text-sm text-gray-500">Manage your family's health</p>
       
        
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <p className="text-sm text-gray-500">Welcome back</p>
          <p className="font-semibold text-gray-700">{user.name}</p>
        </div>
        
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
          {user.name.charAt(0).toUpperCase()}
        </div>
        
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors font-semibold flex items-center space-x-2"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  </div>
</header>



        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}