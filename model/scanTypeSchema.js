import mongoose from 'mongoose';

const scanTypeSchema = new mongoose.Schema({
  brand: [String],
  firmware: [String],
  osType: [String],
  partNo: [String],
  project: [String],
  scanType: mongoose.Schema.Types.Mixed, 
  serialNo: [String],
  type: [String],
  status: String,
  scheduler_hours: String,
  cveId: [String],
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: false }
});

const ScanType = mongoose.model('scanType', scanTypeSchema);

export default ScanType; 