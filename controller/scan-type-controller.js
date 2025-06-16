import ScanType from '../model/scanTypeSchema.js';

export const saveScanType = async (request, response) => {
  try {
    const scanTypeData = request.body;
    const newScanType = new ScanType(scanTypeData);
    await newScanType.save();
    response.status(201).json({ message: 'ScanType saved successfully', data: newScanType });
  } catch (error) {
    response.status(500).json({ message: 'Error saving ScanType', error });
  }
};

export const getAllScanTypes = async (request, response) => {
  try {
    const scanTypes = await ScanType.find();
    response.status(200).json(scanTypes);
  } catch (error) {
    response.status(500).json({ message: 'Error fetching ScanTypes', error });
  }
};

export const updateScanType = async (request, response) => {
  try {
    const { id } = request.params;
    const updatedData = request.body;
    const updatedScanType = await ScanType.findByIdAndUpdate(id, updatedData, { new: true });
    if (!updatedScanType) {
      return response.status(404).json({ message: 'ScanType not found' });
    }
    response.status(200).json({ message: 'ScanType updated successfully', data: updatedScanType });
  } catch (error) {
    response.status(500).json({ message: 'Error updating ScanType', error });
  }
};

export const deleteScanType = async (request, response) => {
  try {
    const { id } = request.params;
    const deletedScanType = await ScanType.findByIdAndDelete(id);
    if (!deletedScanType) {
      return response.status(404).json({ message: 'ScanType not found' });
    }
    response.status(200).json({ message: 'ScanType deleted successfully' });
  } catch (error) {
    response.status(500).json({ message: 'Error deleting ScanType', error });
  }
};

export const filterScanType = async (request, response) => {
  try {
    const { scanType } = request.body;
    if (typeof scanType === 'undefined') {
      return response.status(400).json({ message: 'scanType is required in the request body' });
    }
    const filtered = await ScanType.find({ scanType });
    response.status(200).json(filtered);
  } catch (error) {
    response.status(500).json({ message: 'Error filtering ScanType', error });
  }
}; 